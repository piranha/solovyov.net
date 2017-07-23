title: Server Side Rendering on modnakasta.ua
date: 2017-07-22
tags: programming
----


I've decided to translate an [article][] I wrote
for [modnaKasta](https://modnakasta.ua) technical blog since it should be
fairly interesting for a wider audience than just Russian-speaking people.

[article]: https://medium.com/engikasta/server-side-rendering-b5b11dfe2400

MK (I'm going to use this as an abbreviation for modnakasta.ua) is a single page
application right now, which uses React internally and is written in
ClojureScript. But we care about Google and people experience, which means we
certainly care about server-side rendering.

# Ancientry

Since the whole front-end is in React, which promises to make app renderable
without having access to DOM - in Node.js in particular - the first idea was to
render everything using Node.js. Doesn't feel that fuzzy, does it? Especially
given that there is a new shiny super-fast JS engine in Java 8: Nashorn. And
first experiments showed that it's indeed very fast, faster than Node.js.

"That's great," I thought and we started building an app (not SSR, an app
itself). When the app became at least somewhat usable the time has come for a
reality check. Loading our ~2-3k loc application into Nashorn proved difficult:
8 Gb of heap was barely enough to load JS file and after 30 seconds of hard work,
it spits "this expression in your JS is invalid" error. Fixing few of
those errors (mostly by commenting code) showed that there is no way we could
develop with an environment like that.

# Antiquity

So the Node.js at last. The architecture was simple: we put compiled JS file inside
of API server uber jar, on start write it somewhere, and run Node.js against
it. After that communicate with Node via HTTP: proxy user requests there, proxy
rendered HTML back.

Because Node.js is single-threaded it's totally wrong to have a single process -
so our API server becomes a process pool manager and a load balancer.

Also, we make a request for data while a component is mounted. Which is fine for
the browser, you just wait for a bit, the response comes back and the browser
will render that data. But on server user request is already gone: your first
version of an "empty" component was already sent to a user because rendering
process does not wait for the data to be received.

Which was fixed by making it two-pass renderer: first you rendered to kick off
the data gather process, and when all XHR activity stops, app is rendered one
more to have full content. That takes around 300 ms on a fairly simple page in
optimistic case.

Can't forget to mention that Node.js also leaked memory. Profilers did not help
so I went lazy `uwsgi` way: made a Node process restart every 1000 requests.

But what won't you sacrifice for the sake of result? So we've got this system in
place (not in production yet though) and I went to Philly for Clojure/Conj 2015.

# Enlightenment

Weirdly I did not plan on attending Allen Rohner's "Optimizing ClojureScript
Apps For Speed" which taught me that descriptions suck. There was nobody in the
lobby though so I became bored and went there.

Core idea is following: Clojure 1.7 (came out 5 months before that, in June 2015)
gained an ability to have a single `.cljc` file which can be compiled by both
Clojure (which usually lives in `.clj` files) and ClojureScript (`.cljs`
files). Let's say this is a React component which renders an image:

```clj
(defc Image [image-source]
  [:img {:src image-source}]]
```

Here `defc` is a macro which transforms the code into React calls. Here's a
result (roughly):

```clj
(def Image (js/React.createComponent {
  :render (fn []
            (js/React.createElement "img" 
              {:src (get js/this.args :image-source)}))})) 
```

But that's what macro generates when we compile into JavaScript. What if during
execution on JVM (or, in Clojure) it will make this code into a function,
returning a string `<img src="...">`?

```clj
(defn Image [image-source]
  (format "<img src=\"%s\">" image-source))
```

I wrote [first version][1] of this rendering for Rum back in January 2016, and
Nikita (and other contributors) developed in a properly working thing. We've got
a server-side rendering, but without React runtime, in JVM, with synchronous
(yay!) network reads, with multithreading: in other words, pure joy!

[1]: https://github.com/tonsky/rum/commit/5add8dfb4d1e077b0b63a9b2eb76d77ec593817d


# Fruits

Synchronous network reads are good because until data from a top-level component
is received from the server, inner components (which are dependent on that data)
sit there waiting. But right after data is there, inner components are
rendered/initialized and start fetching their own data. So the dependency
management here is really simple

Also, it occurred that if you render your HTML in the same process your API is
running there is no need to go through network and HTTP. Clojure's Ring protocol
is just a function which received a request, so if you can make a request in
your code (and it's only a simple map), you can call this function and get data
back. So XHR looks like that for ClojureScript:

```clj
(defn xhr [params callback]
  (let [req (js/XMLHttpRequest.)]
    (set-params req params)
    (set-callback req callback)))
```

And like that for Clojure (`app` is our HTTP API):

```clj
(defn xhr [params callback]
  (callback (app (params->http-request params)))
```

Of course, real implementations are a bit longer, setting headers, parsing JSON,
etc. By the way, there is an interesting story about JSON: right after Black
Friday 2016, when our architecture proved to be a success, I was showing to
somebody how it works and saw in [MiniProfiler][] that serializing JSON takes
quite a bit of time. Obviously parsing is not free as well.

[MiniProfiler]: http://miniprofiler.com/

54 lines of changes later and now we pass unserialized data to server rendering:
takes less time and less memory (minus string for JSON and minus newly parsed
data). Pleasantly median time for rendering HTML went down from 110 to 80 ms. :)

Also interesting that we have a cheat (or optimization) around caching and
user-specific content: everything that depends on a current user is rendered
only on a client. It's a compromise: users see "anonymous" version of a site
initially for a few moments, but in exchange, we can cache rendered HTML for
everyone. This makes us able to look like we're not sweating a bit during sharp
increases in traffic. :)

And they lived happily ever after. The End.
