title:  ElasticSearch query builder
date: 2020-08-23
tags: programming, clojure
draft: true
----

This post strives to be useful to anyone who uses ElasticSearch, but all examples are going to be in Clojure since it's what we use. 

ElasticSearch is a wildly useful database (if I may say so), but at times it feels like its query language evolved rather than was planned. This manifests in it being rather ad-hoc and non-orthogonal. Plus using JSON with its low expressiveness adds quite a bit of verbosity. All of this leads to code, which builds ES queries, being really messy and unpleasant to use. 

## Jump in

Certainly this was our case few years ago. Our code was a bunch of functions calling one another, which sounds like functional programming and should be fine, right? Well, as always, devil is in the detail, and: 

- `if`/`case`/`cond` everywhere, various cases were piling on top of each other
- functions parametrized with functions — it's a good tool if you make some higher order well-documented/understood function, but your business logic should be free of this stuff in general; makes logic hard to be understood
- code factorization was quite a bit off: function boundaries felt a bit random
- it firmly rooted in 2015, grew with our codebase and just happened, was never planned (see common theme here)

Our use case, by the way, is filtering API (facets and all that stuff) for an ecommerce site, [Kasta](https://kasta.ua/). Apply some filters and retrieve some aggregations, which is enough of a problem to need a proper solution. 

## What is out there

So where to go? I looked around, and saw stuff like [elasticsearch-dsl](https://elasticsearch-dsl.readthedocs.io/en/latest/), which was just like ES data structures, but methods on mutable objects. Ugh. Also, [ElasticBuilder](https://elastic-builder.js.org/docs/), which is similar, but with different names, so you have to remember two layers of abstraction. Thanks, but no. 

And there are a lot of articles how to accomplish with a query to ES, but nobody writes an article how to make an ES query builder! Well, except for me. :-)

## Solution

What I really like is HoneySQL, which is a compiler from maps/vectors to SQL queries. This got me thinking and it turns out that good question is half of the answer. 

What we need is a compiler from our API interface — GET request query string — to an ES query.

Rephrased like this it makes the task almost a walk in the park. A long-long walk, but much less "here be dragons" if-peppered abomination of the past. And the design cornerstones are:

- branchless pipeline
- [multimethods](https://clojuredocs.org/clojure.core/defmulti)
- small dictionary of verbs on top of ES incantations

### Verbs

So we have a number of functions like `not`, `and`, `or`, `term=`. They signal intent rather than what ES is doing inside and make reading aggregations and filters much easier. Some examples:

```
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

We represent user query inside with a map like that:

```
{:base {"menu" "pants"}
 :filters {"1" #{"123" "456"}}
 :sort :default
 :cursor "ZXCVB"
 :limit 100}
```

This is easier to interact with that just raw query string. 

### make-aggs-q

This part is the most convoluted one.  The essence is following: it concatenates results of a few loops:

 - known non-faceted aggregations
 - facets which were used as filters in a query
 - regular facets
 - numeric facets
 - ranged facets

What I call a "facet" can be [read here](https://project-a.github.io/on-site-search-design-patterns-for-e-commerce/#indexing-facet-values), and I recommend this article very much.

Every loop then delegates to `make-agg` multimethod, which actually build its piece of query. 

```
(defmethod make-agg :depot [k _ filters _]
  [k (-> {:filter (filters/term= "skus.depot" true)
          :aggs   {:real_count {:reverse_nested {}}}}
         (agg-nested "skus")
         (agg-filter (filters/make filters)))])
```

This aggregations looks up SKUs which are stored at our warehouse. This information is stored inside of a nested map (like `{:product-id 1 :skus [{:id 1 :depot true}]}`). And then user filters are applied on top — this could be moved to `make-aggs-q` logic, doesn't feel necessary though. :)

### aggs->response

Loops over response converting raw data into what we feel is appropriate to show our clients. Fortunately most parts of the response are independent, so it's pretty clean and simple. Unfortunately there is no good way to pass additional information from `make-agg` to `extract-agg`, so at times it's stringly-typed. Also does sorting, etc. 

```clojure
(defmethod extract-agg :depot [k agg query]
  (let [cnt (-> agg :real_count :doc_count)]
    [{:id        k
      :widget    :toggle
      :values    [{:key       "true"
                   :doc_count cnt}]
      :doc_count cnt}]))
```

That part is pretty simple since you just have to massage data into whatever you declared you support in the API. :)

## Divide and conquer

There is nothing new under the sun. If only the right idea would appear right at the start. :-) Just factor your functions correctly and you're golden.

In the end what we've got is a straightforward pipeline, no parametrization with functions, every chunk of a query is as simple as it gets, and extensibility is just great! It's been in production for 1.5 years now with no significant changes to the logic, received some new features and doesn't feel like it was holding us back.

I could publish some code, but that would require describing our data layout, so maybe later. I now hope this post can serve as an inspiration for your own code. If you feel confused or have questions, please contact me by email — I would love to update this post more approachable.