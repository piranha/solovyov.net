title: Gostatic got HTML hot reload functionality
date: 2020-03-21
tags: software, gostatic
----

After a years of reminding myself to do it, I finally did it: [gostatic](https://github.com/piranha/gostatic) now got hot reload! And it took me only two month (nothing compared to years of wait) to make a release and write this post.

I should say, it's pretty nifty, seeing browser being updated almost immediately after pressing save (should I enable autosave in Emacs?). Just look at it yourself:

<p><video src="../hot-reload.mp4" loop controls></video></p>

That's it, I gave you a reason to finally go and experiment with gostatic, if you never did. :)

The way it's implemented is that there is a WebSocket connection, opened back to the server, where server sends commands if anything changes: `page`, if HTML changes, and `css`, if it's the CSS. Simple and robust (I hope).

There is [JS](https://github.com/piranha/gostatic/blob/master/hotreload/assets/hotreload.js) counterpart of this, which handles commands and does it's thing. In case you know how to improve that, I'm eager to hear from you.

But all in all just a really useful feature. Enjoy. *(I said that to myself)*
