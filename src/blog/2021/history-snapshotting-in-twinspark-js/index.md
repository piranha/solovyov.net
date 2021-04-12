---
title: History snapshotting in TwinSpark.js
date: 2021-04-12
tags: programming, javascript, kasta
---

![](Photo%207%20Mar%202021%2C%20170558.jpg)

[TwinSpark](https://kasta-ua.github.io/twinspark/) is a library we use to write Kasta frontend now. You can see examples of basic behavior by opening a link, but a cornerstone of TwinSpark is HTML-replacement functionality, which is what concerns us now. 

You see, controlling app behavior can be done in various ways, but the major one is updating what user sees with a new markup from the server. And that potentially can change URL: like when user selects a filter in a product catalogue, this filter gets appended to a query string.

## "Go back"

Fortunately, there is an API to change URL without reloading the page: `history.pushState`. User sees an updated URL and all is well. What happens if said user presses back button? He or she expects to see interface from before URL change. Not so fast! URL will change back, but HTML will stay!

What’s the solution? Well, `pushState` (and `replaceState`) accepts an argument called `state`. And TwinSpark diligently before every `pushState` did a `replaceState` for current URL storing current HTML in that storage:

```
history.replaceState({html: document.body.innerHTML})
```

And when user presses back button, browser raises `popstate` event, indicating that user wants to go back in history.  So you can listen to that event and then replace your current HTML with what's inside of `e.state.html`.

Sounds like it should work nicely, eh? Except for a little problem: Firefox has a limit of 640Kb for a single entry here (Chrome and Safari limits are much higher and of no concern here). And we have endless scroll on product lists. Do you feel where this is going? Our Sentry is full of errors of Firefox users who have scrolled enough. And if they ever go back the behavior (restoring of correct HTML) is broken.

*Aside*: we A/B-tested endless scroll relentlessly because every SEO expert says we should switch to separate pages because Google is really dumb. Not sure about Google being dumb, but endless scroll gives much better conversion rates than pagination. Because humans hate excessive interaction more than Google hates us.

## Real "go back"

It gets worse: what if you changed interface without changing URL and then user went to a separate, real page? Like, there is no `pushState`, no `popstate` event, what happens then? I'll tell you! Browser will show the oldest possible HTML for that whole sequence of `pushState`. I.e. whatever loaded on a last real page load.

This is a problem of planetary proportions, and there is no storage like `pushState` to store HTML. One of the solutions could be loading full HTML for the URL you're opening from a server, but that would be **slooooow**. Another is slapping some caching in `localStorage` and calling it a day:

```
window.addEventListener('beforeunload', function() {
  storeCache(location.href, document.body.innerHTML);
});
if (window.performance &&
    performance.navigation.type == performance.navigation.TYPE_BACK_FORWARD) {
  restoreCache(location.href);
}
```

You see, we've found a weird API — `window.performance.navigation.type` — to check if you opened a page from a "go back" action, but [it's supported](https://caniuse.com/mdn-api_performance) in IE9+ and Mobile Safari 9+, which makes it Good Enough™.

Too bad `localStorage` is often too small in Mobile Safari! It's 5MB, which is considerably more than 640Kb, but it's for all entries rather than a single one in Firefox' `pushState`. Oh well...

## IndexedDB
I wanted to unify approaches for a long time, and got sick to death of those errors. And the only viable solution to all those problems combined was IndexedDB, with its [great presence](https://caniuse.com/indexeddb) almost everywhere we care, and high storage limits (IE is first to panic with a threshold of 250MB).

So approach is following: before every `pushState` or on `beforeunload` current `document.body.innerHTML` is being written to IndexedDB. After writing that stuff a count query is made and if it's over a (configurable, 20 by default) limit — excessive oldest entries are removed. This way if you go back you'll always get a most recent state of that URL — unless you go back too deep. :)

A `popstate` event handler replaces HTML, the same as earlier, just with more blood and tears because of IndexedDB API being a little bit less user friendly. What happens on real "go back" is more interesting though: instead of putting it in `DOMContentLoaded` handler, like everything else, I put it [right in a middle of a script](https://github.com/kasta-ua/twinspark-js/blob/3163611/twinspark.js#L992-L999) itself. This way it manages to update HTML before everything else fires. Browser will even put you in a proper scroll position!

You can read all [IndexedDB-related code here](https://github.com/kasta-ua/twinspark-js/blob/27f2494c169699cddb658c2fd2b1471fd2b08507/twinspark.js#L339-L429). This cursor stuff will leave some marks on my soul, but I won't pretend I could design a better developer experience given all restrictions designers of that API had. Don't take my complains seriously, I'm really happy that there is a solution for a problem, unlike often in that life.

I wonder if I need all that defensive programming in here, I could probably shave off some bytes if I remove it... That's a reason I'm using IndexedDB API directly: I really don't want this library to be dependent upon other libraries. It's wrong and it'll add a lot more code that there already is.

If you feel like I did some mistakes and it could be done better, I'm all ears! I certainly want this history snapshotting to be in a state where there is no need to think about it ever — I'd be grateful for browsers to handle that for me, but let's work with what's available. Cheers!
