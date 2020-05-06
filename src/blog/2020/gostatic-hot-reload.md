title: Gostatic got HTML hot reload functionality
date: 2020-03-21
tags: software, gostatic
----

After years of reminding myself to do it, I finally did it: [gostatic](https://github.com/piranha/gostatic) now got hot reload! And it took me only two month (nothing compared to years of wait) to make a release and write this post.

I should say, it's pretty nifty, seeing browser being updated almost immediately after pressing save (should I enable autosave in Emacs?). It's not a so-called "Live Reload", when a page is reloaded, that is a literal update-on-the-fly. Just look at it yourself:

<p><video src="../hot-reload.mp4" loop controls></video></p>

That's it, I gave you a reason to finally go and experiment with gostatic, if you never did. :)

So how does it work? A [script](https://github.com/piranha/gostatic/blob/master/hotreload/assets/hotreload.js) is inserted before closing `</head>`, and this script establishes WebSocket connection. Then when some file changes server's watching mechanism sends a command down this connection: `page`, if HTML changes, and `css`, if it's the CSS. Simple and robust (I hope).

All in all just a really useful feature, and a pleasant to use and see. Enjoy. *(I said that to myself)*
