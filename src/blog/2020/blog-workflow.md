title: Blog workflow
date: 2020-06-16
tags: blog, programming
----

A long time ago I had a blog that had an admin interface. That ended 10 years ago, and it's been Emacs and git since then. Until yesterday!

A few months ago I found an app - [Drafts.app](https://getdrafts.com/) - which I love to use. It's good for notes and for longer texts, and, important for my use case, it's very usable on a phone. Since what I do lately is instead of sitting in front of my laptop, I write texts while waiting for my son to fall asleep. The longer it takes, the more I can type. :)

So I type a post on iPhone, then go to a laptop, open Drafts there, copy text to Emacs, commit to git, push it to my server and send a link to post for review to friends. 

It works, but is a little tedious. I hate supporting processes and this is exactly it. 

But fortunately, you can write actions for Drafts in JavaScript! So I wrote two: [one](https://actions.getdrafts.com/a/104) adds gostatic header to a post (title and date, and updates that date if you call it again). [The second](https://actions.getdrafts.com/a/105) one - and this is beautiful - converts title to slug and commits a file to Github! And copies destination url to clipboard.

I don't know if you're excited yet, but it's great! I can do this from my phone, not touching my laptop at all. Fixing errors and retyping sentences is low friction now, so when somebody points out a bug in a text I don't get irritated. :)

At first I also moved my hosting to Netlify. Because I'm too lazy to setup [webhooker](https://github.com/piranha/webhooker/) and all that stuff, and Netlify gives you auto-deploy for free. But it turns out their Docker-based builds take at least half a minute to finish, and that kind of latency makes me impatient. 

So I went and configured systemd service to run that stuff. Also discovered that my old webhook on Github is still enabled and is erroring out for nobody knows how long. :-) Now latency is around 2 seconds, which is acceptable.

So I wrote this post in a dark calm room next to a little kid snoring a bit, pressed few buttons and voila! It's published. :)