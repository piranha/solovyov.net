title: A tale of webpage speed, or throwing away React
date: 2020-08-24
tags: programming, javascript, kasta
----

Back in 2011, I happened to get a job writing [Backbone.js](https://backbonejs.org/) app. If you never did that, don’t. I was complaining about difficulties with composition left and right to whoever would listen. As I started digging into alternatives for the front-end, I discovered [FRP](https://en.wikipedia.org/wiki/Functional_reactive_programming) and [Flapjax](https://www.flapjax-lang.org/), and [ClojureScript](https://clojurescript.org/). The last one got me hooked on [Clojure](https://clojure.org/). I even did a [successful talk](https://fwdays.com/event/js-frameworks-day-2013/review/Functional-Reactive-Programming-&-ClojureScript) on FRP and ClojureScript (and precursor to [Hoplon](https://hoplon.io/), called hlisp).

## React

Then in May 2013 React was released. I championed it on my new job and discovered during Clojure-themed hackaton ([Clojure Cup 2013](https://solovyov.net/blog/2013/clojurecup/)) that CLJS and React are a great match. What’s so good about React though? To me, the main selling point is that it composes well. 

When you use predecessors like jQuery or Backbone or Angular or whatever after just a year of development your code is a mess of event listeners and triggers. Don't get me started on unobtrusive JS, code locality is non-existent with jQuery. Which handler is bound where and what it does? It’s too hard to discover to be a good base for a good codebase!

Then I started working at [Kasta](https://kasta.ua), where web frontend was exactly that jQuery-ish mess. Nobody ever wanted to touch checkout, since you could spend hours, if not days, making the smallest change. Then QA would find more invalid states than you can dream of. And then users would report more bugs to our call center. It was just as awful as you can imagine. 

So after some experiments, tests, and checks, I decided that we’re going React + ClojureScript way with server-side rendering done in Clojure. 

## Demise

And for a while, things were looking good. We had this [architecture](https://solovyov.net/blog/2017/server-side-rendering/) where our components are executed as Clojure on the backend, so no Node.js on the server, hurray! And developer UX is through the roof with the excellent live reload (thanks CLJS), ability to connect from your editor to browser REPL, and experiment there. It is just great!

To make a long story short, our frontend grew bigger and bigger. Incremental compilation started to become slower — it now routinely takes more than a second or two. And while there were few attempts on keeping the whole app performant, ultimately we failed. It's a death by a thousand cuts. The application became too big and its boot time became too long. Server side rendering helps partially, but then hydration freezes the browser. On the older hardware or Androids it became unacceptable!

One of the main reasonings back in 2016 was that we take a hit on startup time, but in turn, get no page loads and have a rich web application with a lot of interactions. And for a while that worked! But startup time became longer and longer, leading to a shameful rating of 5/100 from Google’s PageSpeed (okay, it was sometimes up to ~25/100, whatever).

More than that, while doing what is described below, we've discovered that React also leads to some questionable practices. Like hovers in JS (rather than in CSS), drop-down menus in JS, not rendering hidden (under a hover) text (Google won't be happy), weird complex logic (since it's possible!), etc. You can have a React app without those problems, but apparently, you have to have better self-control than we had (nobody's perfect!).

Also since then, the vast majority of our users switched to mobile apps. This made the web app the main entry point for new users. This means its main goal is rendering fast for a newcomer, because old-timers, which want more functionality, are on mobile app now. And [TTI](https://web.dev/tti/) (time to interactive) is so much more important here. 

## Time For A Change

So given that circumstances have changed, what do we do? I read articles “how I survive on vanilla JS” since before React appeared and they usually don’t make sense — it’s either a pink-glassed rant about how great it is, disregarding all the problems (separation of concerns, cohesion, composability, code locality) or a project by one (or few) persons, who just keep everything in their head. 

Somewhere back in February I stumbled upon [Intercooler.js](https://intercoolerjs.org/). I’m not sure if I ever saw it before — maybe I did but skimmed over — it does not matter. This time it captured my attention.

The idea is that all HTML is rendered on the server. And client updates parts of HTML, controlled by element's attributes. Basically like HTML+XHR on steroids. You can’t do anything you want, but that’s partially the point: some limits are good so you won’t do crazy stuff. And you need some support from the server, so you can render partial results — just an optimization, but quite an important one. 

There is an alternative library — [Unpoly](https://unpoly.com/). It has more features around layout and styling but has a little bit less thought out XHR stuff (hard to do a POST request with parameters without having a form, for example). And the library size is much bigger. And it's written in CoffeeScript with lots of classes, [ugh](https://solovyov.net/blog/2020/inheritance/).

So I made a proof-of-concept implementation of our catalogue page in Intercooler and it worked! Except there was a dependency on jQuery and some other irritating stuff... As I was struggling to make a batch request for HTML fragments I understood one thing: when I wrote down a roadmap for catalogue the last point was "small intercooler-like thing for analytics". 

So why wait?

## TwinSpark

I liked Intercooler's coherent approach to working around AJAX, so I decided to name the library after some automotive stuff as well, and TwinSpark seems like an appropriate name. So what's the deal?

[TwinSpark](https://github.com/kasta-ua/twinspark-js) is a framework for declarative HTML enhancement: you put additional attributes on your element and TwinSpark does something with them. Like makes an AJAX call and replaces target with a response, or adds a class, or... well, see [examples](https://kasta-ua.github.io/twinspark-js/), shall you?

There are some differences with Intercooler, of course, because why would it exist? The most noticeable one is that there is no dependency on jQuery. It supports only modern browsers (not IE or Opera Mini) but drops that 88kb monster. 

It also has:

- no inheritance — can't stress that enough!
- clear extension points for your directives
- support for batching requests to a server
- tighter attribute name convention (my own opinion, but `ic-get` and `ic-post` irritate me: do not make me change keys!)
- much smaller payload (thanks to no jQuery!)
- should be faster (thanks to no jQuery again)

Honestly speaking, the main reasons are [batching](https://kasta-ua.github.io/twinspark-js/#batch) and [no inheritance](https://solovyov.net/blog/2020/inheritance/). Inheritance is particularly painful here. In Intercooler, if you declared `ic-target` on the body, all tags inside will think it's their target too. So you include a component somewhere in HTML tree and an attribute higher on tree changes this component behavior. I mean this is a freaking dynamic scope, I want none of that! :)

Funnily enough, after about a month of dabbling with TwinSpark, Intercooler's author announced that he's doing a jQuery-less modern version: [htmx](https://htmx.org/). :) It has really good extensions points, so maybe it's possible to add batching... but inheritance is still there. :-(

## Why is that a good idea

We need to look at it from two sides: if it's good for developers and if it's good for users. React was great at former and terrible at later. 

TwinSpark approach is much better in most cases for the user: less JavaScript, less jitter, more common HTML-like behavior. In the worst case, we would serve you 2.5MB of minified (non-gzipped) JS and 700KB of HTML (half of it were initial data for React) for catalogue. JS bundle is not that big because of embedded images or css or some other obscure stuff, it's big because it's the whole app, with a lot of views and logic.

Now it's 40KB of minified non-gzipped JS (TwinSpark, analytics, some behavior, IntersectionObserver polyfill) and 350KB of HTML. Two orders of magnitude difference and even HTML is smaller! This is just like Christmas in childhood!

On the developer side, I think React is better still, but code locality is great, composability is much better (since you are forced in a limited world of working in a simplistic model) than with jQuery. Plus there are a lot of ways to improve it. 

The good news is that the development process did not change that much! We're still writing components that query necessary data from site-wide memory store (and make a call to API when needed), but they are executed only on the server. We effectively piggy-backend on our previous architecture, and this gives us the perfect ability to render "partial" HTML - since components do not wait for some "controller" to give them all necessary data. This is what allowed us to have both React and non-React versions to co-exist and make an A/B test without writing the markup twice.

## Results

It took us four months since the first experiments to release. Not exactly the amount of time I imagined when we started ("should take two to three weeks at most!"), heh, but we were not exclusively doing that. It still took a lot of time and energy to remove React-isms from the code and wrangle our app to be a server-side citizen. It still could use some polishing, but we decided to release it despite that just to cut it short. And A/B test showed that we were right — especially for Android phones.

Google gives our catalogue 75/100 now instead of 5/100. Hurray, I guess? :)
