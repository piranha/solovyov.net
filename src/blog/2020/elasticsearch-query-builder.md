title:  ElasticSearch query builder
date: 2020-09-30
tags: programming, clojure, db
draft: true
----

This post strives to be useful to anyone who uses ElasticSearch, but all examples are going to be in Clojure since it's what we use. 

ElasticSearch is a wildly useful database (if I may say so), but at times it feels like its query language evolved rather than was planned. This manifests in it being rather ad-hoc and non-orthogonal. Plus using JSON with its low expressiveness adds quite a bit of verbosity. All of this leads to code which builds ES queries being really messy and unpleasant to use. 

## Jump in

Certainly this was our case a few years ago. Our code was a bunch of functions calling one another, which sounds like functional programming and should be fine, right? Well, as always, devil is in the detail, and: 

- `if`/`case`/`cond` everywhere, various cases were piling on top of each other
- [functions parametrized with functions](https://solovyov.net/blog/2020/higher-order-functions/) — it's a good tool if you make some higher order well-documented/understood function, but your business logic should be free of this stuff in general; makes logic hard to be understood
- code factorization was quite a bit off: function boundaries felt a bit random
- it was written at the start of current codebase, grew with it and just happened, was never planned

Our use case, by the way, is a product filtering API (facets and all that stuff) for an ecommerce site, [Kasta](https://kasta.ua/). Apply some filters and retrieve some aggregations, which is enough of a problem to need a proper solution. 

## What is out there

So where to go? I looked around, and saw stuff like [elasticsearch-dsl](https://elasticsearch-dsl.readthedocs.io/en/latest/), which was just like ES data structures, but methods on mutable objects. Ugh. Also, [ElasticBuilder](https://elastic-builder.js.org/docs/), which is similar, but with different names, so you have to remember two layers of abstraction. Thanks, but no. 

And there are a lot of articles how to make a query to get what you need from ES, but nobody wrote an article how to make an ES query builder! Well, except of me. :-)

## Solution

What I really like in terms of API is [HoneySQL](https://github.com/seancorfield/honeysql), which is a compiler from maps/vectors to SQL queries. This got me thinking and it turns out that a good question is half of the answer. 

What we need is a compiler from our API interface — GET request query string — to an ES query.

Rephrased like this it makes the task almost a walk in the park. A long-long walk, but much less "here be dragons" if-peppered abomination of the past. And the design cornerstones are:

- branchless pipeline
- [multimethods](https://clojuredocs.org/clojure.core/defmulti)
- small dictionary of verbs on top of ES incantations

### Verbs

So we have a number of functions like `not`, `and`, `or`, `term=`. They signal intent rather than what ES is doing inside and make reading aggregations and filters much easier. Or should I say `should` easier? Or `must` easier? :-) You can understand what's it doing without opening ES docs. Some examples:

```clojure
(defn or* [& clauses]
  (let [clauses (filterv identity clauses)]
    (cond
      (empty? clauses)
      {:bool {}}

      (= 1 (count clauses))
      (first clauses)

      :else
      {:bool {:should               clauses
              :minimum_should_match 1}})))


(defn facet= [k v]
  {:nested {:path  "facets"
            :query (and* (term= "facets.id" k)
                         (term= "facets.value" v))}})
```

What they accomplish is that most of our lower-level use cases are covered with "loaded" terminology rather than "neutral" (and often cryptic) ES maps.

### Pipeline

Pipeline is 4 steps:

- `qs->query` parses query string, cookies, headers into a basic query data structure
- `make-aggs-q` loops through supplied filters and known aggregations, and builds an ES query
- then a query is executed
- `aggs->response` converts ES response to what our API returns

We represent a user query internally with a map like that:

```clojure
{:base {"menu" "pants"}
 :filters {"1" #{"123" "456"}}
 :sort :default
 :cursor "ZXCVB"
 :limit 100}
```

This is easier to interact with than with just a raw query string.

### Data format

Some time ago I stumbled upon a great article about working with ES, and one of its parts [describes a data model](https://project-a.github.io/on-site-search-design-patterns-for-e-commerce/#generic-faceted-search) they have used. It proposes that instead of a map like `{:brand "wow" :color "red"}` you use a following structure:

```
{:facets [{:name "brand"
           :value "wow"}
          {:name "color"
           :value "red"}]}
```

This allows you to query all those facets with a single definition, rather than sending a separate aggregation for every field. More than that, you don't really need to know which facets are available for filtering upfront, since you'll receive all of them from ES.

In practice, two lists of facets are needed - regular ones and ranged facets. Regular facets are aggregated by `terms` aggregation, and ranged are aggregated by combo of `ranges` and `percentiles`.

### make-aggs-q

This part is the most convoluted one. It builds the essence of an ES query for aggregations, and consists of:

 - loop over known non-facet aggregations
 - loop over every facet which was used as a filter in a query
 - query for regular facets
 - query for ranged facets

What is a facet aggregation is described in [data format](#data-format) section. All other aggregations are non-facet and should be explicitly mentioned. Those are filters such as price, depot (whenever they are on stock in our warehouse rather than supplier's one), supplier, etc. When I look there it feels like most of them need to be in facets. Historical reasons. :)

Every loop then delegates to `make-agg` multimethod, which actually build its piece of query. Here is an example of a filter for colors - it's one of the simplest aggregations, just generates a list of colors available for selected products.

```
(def NESTED-AGG :_nest)

(defn agg-filter [agg filter-data]
  {:filter filter-data
   :aggs   {NESTED-AGG agg}})

(defmethod make-agg :color [filter-name _ filters options]
  [filter-name
   (-> {:terms {:field "color_group"
                :size  (:max-buckets options)}}
       (agg-filter (filters/make filters)))])

```

`filters` are filters for the given query except the one for the given aggregation, so that you'll receive all possible values for the current aggregation in a given context. So we apply them with an `agg-filter` function.

`->` could be confusing, but look at it as a pipeline operator: every function you give it is executed in order.

ElasticSearch aggregation rules are nested, read on to discover why we need `NESTED-AGG`.

### aggs->response

This stage loops over response and converts data from ES into API response format. Fortunately most parts of the response are independent, so it's pretty clean and simple: it's a loop, which calls `extract-agg` on every aggregation:

```clojure
(defn agg-recur [{:keys [doc_count] :as agg}]
  (loop [agg agg]
    (if-let [nested (get agg NESTED-AGG)]
      (recur nested)
      (if-not (:doc_count agg)
        (assoc agg :doc_count doc_count)
        agg))))

(defn aggs->response [query es-response]
  (for [[k agg] (:aggregations es-response)
     (extract-agg k (agg-recur agg) query))
```

`agg-recur` is a way to get to the real data: ES aggregations are very nested. To get through we use key `:_nest` (value of `NESTED-AGG`), and then use this `agg-recur` function.

Unfortunately, there is no good way to pass additional information from `make-agg` to `extract-agg`, so it's stringly-typed, as is [recommended by ES](https://www.elastic.co/guide/en/elasticsearch/reference/7.x/returning-aggregation-type.html). Look at our `extract-agg` multimethod (`defmulti` defines dispatcher, this is a function which determines which method to call):

```clojure
(defmulti extract-agg
  (fn [filter-name data query]
    (condp #(str/starts-with? %2 %1) filter-name
      "facet_"      :facet
      "percentile_" :percentile
      "range_"      :range
      :else         filter-name)))
```

`extract-agg` methods extract data, sort if necessary (so brands are alphabet-sorted rather than count of matches-sorted), fix up document count (in case of nested aggregations). Here's an example processing `:depot`:

```clojure
(defmethod extract-agg :depot [filter-name agg query]
  (let [cnt (-> agg :real_count :doc_count)]
    [{:id        filter-name
      :widget    :toggle
      :values    [{:key       "true"
                   :doc_count cnt}]
      :doc_count cnt}]))
```

That part is pretty simple since you just have to massage data into whatever you need for the API. :)

## Divide and conquer

There is nothing new under the sun. If only the right idea would appear right at the start. :-) Just factor your functions correctly and you're golden.

In the end what we've got is a straightforward pipeline, no parametrization with functions, every chunk of a query is as simple as it gets, and extensibility is just great! It's been in production for 1.5 years now with no significant changes to the logic, received some new features and doesn't feel like it was holding us back.

I hope this post can serve as an inspiration for your own code. If you feel confused or have questions, please contact me by email — I would love to make this post more approachable.