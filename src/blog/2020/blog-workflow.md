title: Blog workflow
date: 2020-06-16
tags: blog, programming
draft: true
----

A long time ago I had a blog that had an admin interface. That ended 10 years ago, and it's been Emacs and git since then. Until yesterday!

A few months ago I found an app - [Drafts.app](https://getdrafts.com/) - which I love to use. It's good for notes and for longer texts, and, important for my use case, it's very usable on a phone. Since what I do lately is instead of sitting in front of my laptop, I write texts while waiting for my son to fall asleep. The longer it takes, the more I can type. :)

So I type a post of iPhone, then go to a laptop, open Drafts there, copy text to Emacs, commit to git, push it to my server and send a link to post for review to friends. 

It works, but is a little tedious. I hate supporting processes and this is exactly it. 

But fortunately, you can write actions for Drafts in JavaScript! So I wrote two: one adds gostatic header to a post (title and date, and updates that date if you call it again). The second one - and this is beautiful - converts title to slug and commits a file to Github!

I don't know if you're excited yet, but it's great! I can do this from my phone, not touching my laptop at all. Fixing errors and retyping sentences is low friction now, so when somebody points out a bug in a text I don't get irritated. :)

And then I moved my hosting to Netlify because I'm too lazy to play with webhooks and so got auto-deploy for free. 

So I wrote this post in a dark calm room next to a little kid snoring a bit, pressed few buttons and voila! It's published. :)