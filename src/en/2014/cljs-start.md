title: ClojureScript: how to begin
date: 2014-08-12
tags: cljs
hide: true
----

This is a short guide which indends to give you shortest path to writing
[ClojureScript][] with [React][] and reloadless workflow. It doesn't teach you
how to write actual applications, only how to set up all the necessary (and
boring) boilerplate. For an actual application demo see [snake][] or
[flappy-bird][]. Let's get started.

[ClojureScript]: https://github.com/clojure/clojurescript
[React]: https://facebook.github.io/react/
[snake]: https://github.com/piranha/qsnake
[flappy-bird]: https://github.com/bhauman/flappy-bird-demo

## Steps

### Get Leiningen

First you need to have Leiningen [installed](http://leiningen.org/#install). I
think that the default method - having `lein` in your `$PATH` - works best, but
if you're willing to struggle with your package manager, good luck. If you are a
Windows user, there is an installer (check the link above).

### Create project

After that, find a place where your project will reside, start a command line
shell there, and run:

```shell
$ lein new figwheel superapp
```

This will create a `superapp` directory with a project named `superapp` inside
(so choose your name wisely), using a `fighweel` Leiningen template. This will
give you basic initial structure for a ClojureScript application (regular `lein
new superapp` will give you a Clojure project and you'll have to change a lot of
stuff there).

### Configure project

Your project dependencies and configuration are in `project.clj`: go there and
change url, description and check out the rest of it. We're going with a
different wrapper for React, so replace `[om "0.7.1"]` with
`[quiescent "0.1.4"]`. Read below for a reason why.

### Imports

Now we're going to change `core.cljs` a bit. Set up some requires inside of
`ns` call:

```clj
  (:require [figwheel.client :as fw]
            [sablono.core :as html :refer-macros [html]]
            [quiescent :as q :include-macros true])
```

I'm intentionally not giving all the code at once here so that you'll be forced
to understand what's going on. At least I hope so. Anyway, if something's
bugging you, send me an email.

### The code

Set up our data store:

```clj
(defonce world (atom {:text "Hello!"}))
```

...and main component:

```clj
(q/defcomponent Root
  [data]
  (html
    [:h1 (:text data)))
```

...and renderer:

```clj
(defn render [data]
  (q/render (Root data)
    (.getElementById js/document "main-area")))
```

Now watch for data changes:

```clj
(add-watch world ::render
    (fn [_ _ _ data] (render data)))
```

Finally, react to files being reloaded:

```clj
(fw/watch-and-reload :jsload-callback
  (fn [] (swap! world assoc :tmp-dev (not (:tmp-dev @world)))))
```

This code changes a non-relevant variable when some file is changed (and saved),
forcing your application to re-render.

### Run

Run this in your project directory and open
[http://localhost:3449](http://localhost:3449):

```clj
lein figwheel dev
```

This starts a watcher, which recompiles ClojureScript files as you change them
and sends them to your browser.

### That's it

Now keep your app tab open in the browser, and go change `[:h1 (:text data)]` to
`[:h3 (:text data)]` (or something else, it's up to you). Your browser now
should immediately change rendered HTML. That's how you start. :)

## Why Quiescent

[Om][] is better known and (it seems) more widely used, so why [Quiescent][]?
Because when you're working with Om, you need to know not only how React works,
but also Om semantics, which is much more complex and confusing, especially when
you're just starting. It's API is bigger than React's, and while there are
advantages and reasons to use it, going with Quiescent means your learning curve
will be much lower.

[Om]: https://github.com/swannodette/om
[Quiescent]: https://github.com/levand/quiescent

Plus Quiescent forces you to think about your data layout in a single big, while
Om provides easy access to component local state - and I find that most
developers (me not excluded) are eager to use it, even if it's not necessary
(and it's not most of the time). Anyway, go and read Quiescent's rationale, it's
a good write up.