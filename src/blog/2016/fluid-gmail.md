title: Fluid.app + Gmail
date: 2016-01-02
tags: software
----

So I've decided once again I dislike having my mail client opened in one of the
browser tabs and I want it somehow separate. I'm still unsure why'd I got this
feeling, but I like the result - read on if you're interested.

I went with [Fluid.app](http://fluidapp.com/) - free version at first. I've put
it on `Cmd-Ctrl-]` and it's been working pretty okay for some time, so I've bit
the bullet and paid all the whopping 5$!

Which makes it **really** good: I've put an
[icon](https://jrothmanshore.files.wordpress.com/2014/04/gmail-red-icon.png),
made it fullscreen (wow, nobody can distract me now when I'm replying to
emails - since I turn off popups for everything), and made it display amount of
unread email in Inbox with this userscript (yes, it has userscripts and
[some API](http://fluidapp.com/developer/)):

```javascript
function setDockBadge(badge) {
    window.fluid.dockBadge = badge || '';
}


function getUnread() {
  // Extract unread message count from title and set dockBadge
  // There is no "Inbox" in this regex to work around different gmail-languages.
  var re = /\s*\((\d+)\)[^\d]*/;
  var parent = document.querySelector('[role=navigation]');
  if (!parent) return;
  var el = parent.querySelector('a[href$="#inbox"]');
  var badge = el && el.title.match(re);
  return badge && badge[1];
}


function updateDockBadge() {
  var unread = getUnread();
  setDockBadge(unread);
}

setInterval(updateDockBadge, 1000);
```

*(yeah, I don't need to parse unread counter here - I'll never reuse the code
anyway, but somehow this makes me feel cleaner)*

So yeah, now it's sitting on a full screen single hotkey away with an unread
message count badged on top of an icon. Feels good.
