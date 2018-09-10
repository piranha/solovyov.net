class: middle, center, invert

# <img src="campaign_active.svg" style="height: 100px" />
# Technology to the Rescue

.meta[Alexander Solovyov, CTO modnaKasta]

???

Hey everyone, I hope Andrew woke you up already. Let's go.

---

class: invert

# What's this all about

### &nbsp;

## .center[What works when you try to switch a car during a race]

???

- How I decided to structure this talk

--

## &nbsp;
## .center[And what doesn't]

---

# What's modnaKasta

- Shopping club
- Founded in 2010
- Largest fashion-oriented ecommerce site in Ukraine
- Hundreds of thousands clients
- Hundreds of thousands orders
- 1k+ RPS every day (more so during events)

???

- Just an internet shop
- Everybody knows how to do that
- Write some code, have some clients, sell some stuff, no big deal.

---

# Early 2015

- Aging codebase - started in 2006 four teams ago
- 80k+ lines of Python
- Tons of support requests
- Is a drag on business
  - hard to maintain
  - hard to fix
  - hard to improve
- Black Friday 2014 was a commercial success and ***lots of downtime***

???

- The "write some code" bit is not that easy as it could be, though.
- Stuff's more complex than it seems
- modnaKasta's Black Friday is the biggest one

---

# Black Friday 2015

- 10 months of optimization work
- Huge commercial success
???

- I started working there on January 2015
- We've spent whole 2015 grooming everything

--

- One mistake and 3 hours of downtime

---

# How do you fix that

- Nobody knows original architecture ideas
  - Were there any ideas even?
- The system itself is convoluted
  - Lots of logic in models, overridden `.save()` methods and QuerySets
- Without caching it did at most 5 RPS on my laptop
- *Rewrite!*

???

- Stuff's bad
- You can go many ways
- But we had no idea what's going on inside

---

# How do you rewrite a site

- Decide what the end state should be (high level)
- Do it bit by bit
- Smallest piece by smallest piece
- Be very careful
- Do not rush
- Update your old system to support new one
--

- **DO NOT RUSH**

---

class: invert, middle, center

# The Story

## Various things we did that worked out well

???

- Real content starts here

---

# Page-by-page site rewrite

- `Mar '15`:&nbsp;&nbsp; decision that rewrite is necessary
- `Apr '15`:&nbsp;&nbsp; first actual bits of code for new site
- `Nov '15`:&nbsp;&nbsp; first trial for a new site (heh)
- `Feb '16`:&nbsp;&nbsp; new main page released
- `Mar '16`:&nbsp;&nbsp; basket and order
- `May '16`:&nbsp;&nbsp; campaign
- `Nov '16`:&nbsp;&nbsp; checkout
- `Dec '16`:&nbsp;&nbsp; order list

???

- In summer 2015 it was slow
- Sped up in autumn
- Winter was where we did stuff

--

### Black Friday '16 was OK :)

---

# Single Page Application

- Simpler to make rich interactions with user
- Less data transfer/retrieval on page change
  - Lower load on the server
  - Lower load on the DB
- Unified API for web and mobile apps
- Slower initial load :(
  - Server-side rendering is a must
- React, if you wonder

???

- SPA is controversial
- I believe we mostly got it under control

---

# Server-side rendering: Node.js

```js
function handler(req, res) {
  res.writeHead(200, {"Content-Type": "text/html"});

  render_to_string(req.url, (initial, content) => {
    // Simplest template ever,
    // just a wrapper with html/head
    res.end(render_template(initial, content));
  });
}

http.createServer(handler).listen(6000);
```

???

- Most important stuff for SEO
- Render your current page
- Put it inside wrapper with `head` and return

---

# render_to_string

```js
function render_to_string(url, callback) {
  router.set_route(url);

  var comp = router.Root(data_store);

  // first time render to fire off all AJAX queries
  React.renderToString(comp);

  // wait for the queries to end
  xhr.current_queries.watch(function() {
    if (get_xhr_count() == 0) {
      callback(data_store, React.renderToString(comp));
    }
  });
}
```

???

- First renderToString triggers AJAX requests
- Then we wait until they end
- Then render second time with an actual data

---

# Are we happy?

- Manage a pool of Node.js render servers
- Get results through HTTP API
- Render everything twice

???

- Did a render pool
- Bundle JS file inside of an app
- Put it on disk on start
- Run Node processes against it
- Freaking hell

--

# Not really

---

# Clojure to the rescue!

- Whole new app is in Clojure (obviously)
- `.clj` - Clojure, `.cljs` - ClojureScript, `.cljc` - both
- Front-end is in ClojureScript

```
(defc Example []
  [:div.item {:on-click smile}
    [:span.inner "test"]])
```

???

- You can write files executed in both
- This code returns React component

---

# Server-side rendering

```
(defc Example []
  [:div.item {:on-click smile}
    [:span.inner "test"]])

> (println (rum/render-html (Example)))

<div class="item">
  <span class="inner">test</span>
</div>
```

???

- But on the server the same code returns simple function
- So we can render it to a string
- The best kind of a solution - a simple one

---

class: invert, middle

# Data

???

- Let's talk hard stuff

---

# Meta&thinsp;data&thinsp;pairs

.center.middle[<img src="2-mdp.png" style="height: 500px"/>]

???

- That's my favorite story
- Benchmark inside the team for other disasters
- More or less understandable solution for KV-data
- Okayish design gone horribly wrong

---

# And we store various data there...

```sql
=# SELECT k.key, k.id, COUNT(p.id)
-# FROM product_metadatapair p
-# JOIN product_metadatakey k ON p.key_id = k.id
-# GROUP BY k.key, k.id
-# ORDER BY COUNT(p.id);
   key    | id |  count
----------+----+----------
 Объем    | 18 |       26  -- volume
          |  3 |       27  -- empty string
 Описание | 17 |      176  -- description
 Номер    |  2 |      443  -- number
 Pазмер   |  1 |     3112  -- size with latin "P"
 Размер   | 16 | 15212192  -- size
(6 rows)
```

???

- Empty key has empty values
- First letter of "Pазмер" is a latin one

---

# And stocks...

.center.middle[<img src="3-mdp-stock.png" style="height: 500px"/>]

???

- Effectively MDP becomes a single SKU
- Can single SKU have multiple stocks? Why m2m?

---

# And basket!

.center.middle[<img src="4-mdp-bi.png" style="height: 500px"/>]

???

- 25 mln records in basket item
- 1 BI - 1 sku, but m2m again

---

# Problems?

- 22 queries to DB for 1 size

--

- 110 queries to DB for 5 sizes

--

- Let's fix it with cache

--

background-image: url(img/facepalm.png)

- Which depends on user's basket, so is cached per-user

---

# How it should be

.center.middle[<img src="5-sku.png" style="height: 500px"/>]

???

- No m2m relations

---

# PostgreSQL

- I love it
- Just pure blessing
- Allowed us to come fairly easily from the dark ages of pain to the days of sanity

???

- If your project is not using RDBMS as main db I'm almost certainly sorry for you

---

# No ORM

- ORMs over-fetch data (people are lazy)
- Implicit behavior complicates understanding
- ORMs are inflexible
- ORMs are slow (they are piles of code)
- ORMs are prone to errors (1+N queries, etc)
- ORMs prevent people from understanding a data layout
  - One of your most valuable assets

???

- The only things ORMs are good for is composition

---

# Composition

```
{:select [:name :phone]
 :from   [:user_profile]
 :where  [:= :id 1]}
```

- Just a regular map, compose how you want
- Side-effect: people are learning SQL

???

- Regular Clojure map
- Making helpers is just writing functions

---

# ElasticSearch

- Used for faceted filtration
- Died in 3 seconds under 30% of production load
- It just stopped answering for ever
- Not even to a SIGKILL
- People around kept saying "you want too much"

???

- Documentation is pretty bad
- No good optimization guides
- Explain generates huge JSON and no tool to understand it

---

# Sneaky Cassandra caching!

- When products are published
  - gather facet data from ES
  - put facet data into Cassandra
- On request, first check Cassandra for data
- Cache top level data and first level of every filter

???

- We cheated
- Most of the queries are not touching ES

---

# Kafka

- Ordered messaging system
- Crazy fast
- Beautiful concept of topics/groups
- Removes dependency on availability of neighbouring systems
  - Hard to overstate importance of this
- Replaced custom APIs for data exchange between systems

???

- Kafka is my second favorite system after Postgres
- Simple design
- Orthogonal features
- 5000 w/s

---

# Before

.center.middle[<img src="kafka-before.png" style="height: 500px"/>]

???

- Custom HTTP APIs everywhere

---

# After

.center.middle[<img src="kafka-after.png" style="height: 500px"/>]

???

- Hub appeared without anyone doing anything

---

# Onyx

- onyxplatform.org
- Masterless distributed event stream framework
- Describe all your flows with data
- Using it for data exchange and publishing
- For cache generation
- Side-effects on events (sending emails etc)
- Debugging can be hard sometimes

???

- Our Celery :)

---

class: invert, middle

# Platform

---

# Functional programming & immutable data

- Prevents in-place ad-hoc data mutation
- Makes you write data processing in pipelines
- Easier to test
- Less confusion about behavior
- Immutability removes whole classes of bugs
- Makes your app simpler
???

- New technologies are here to help us write better programs
- And better is *more correct*

--

- Makes your *life* simpler

---

# Clojure

- Expressiveness
- Speed
- Sharing code between server and client
- Hot code reload that works
- Practical functional language
- It's also fun!

???

- Simple
- Fast
- Crazy good community
- High quality libs
- FUN

---

# REPL

- Connect to running process
- Not your regular IPython shell
- Execute various code there
  - Experiment with code *in editor*
  - Update a function
  - Switch to different env
- Why nobody does that in Python baffles me

---

class: invert, middle

# Monitoring

---

# Riemann + Influx + Grafana

<img src="img/grafana.png" width="100%">

---

# Miniprofiler

- Made by StackOverflow
- Server-side libs in many languages

<img src="img/miniprofiler.png">

---

class: invert, middle

# What did not work well

---

# Moving fast (and breaking things)

- You do a change too fast
- It breaks your:
  - Business
  - Life
  - Will
  - Energy
  - Spine
- I learned that by trial :)

???

Once upon a time I "fixed" reservation system in two days. It took us two weeks to gather pieces back.

---

# Fixing old code

## If the code is sufficiently rotten, there is no fix, only replace. Learn what it does and write it yourself.

---

class: invert, middle

# Results

---

# Performance

- Median API response time - `18ms`
- Median server-side page rendering time - `71ms`
- Black Friday 2015: 18k online, 18 servers with Python, *dead*
- Black Friday 2016: 22k online, 8 servers with Clojure, *alive*
- Postgres is not breaking a sweat at 4k selects a second

---

# Amounts of code

- 6k loc of API
- 13k loc of Front-end
- 5k loc of event stream processor
- Hard to compare

---

# Conclusions

- Rewriting is hard
- Still can be done (and sometimes should)
- Everybody should switch to immutable data
