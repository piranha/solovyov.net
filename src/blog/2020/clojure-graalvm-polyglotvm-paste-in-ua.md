title: Clojure, GraalVM, PolyglotVM: paste.in.ua
date: 2020-07-10
tags: programming
draft: true
----

A bit more than 10 years ago I wrote a pastebin app: [paste.in.ua](https://paste.in.ua/). It's quite simple and it came into existence because the one I was using went offline and I didn't really want to use Github's Gist because of it's persistence (sorry for the rhymes) - it's stored in your profile (if you don't delete it manually). I don't really like this. 

So it was a Python app, written using bottle.py (small-ish framework just to play with something different) and Pygments to highlight code. And some JavaScript to highlight ranges of lines, a feature I really liked from Github. 

Fast forward ten years and it's still working: never thought it would be that permanent. :) Did not become popular except in auditory of me, which turned out to be enough to keep it running. It was hosted in Dokku on my personal VPS for many years. And suddenly I got an itch to scratch: I realized the only thing where Dokku is useful is "piu" (short name for the service). The rest is static sites and their dependency and process management is much simpler.

How do you solve that very important problem with not loving Dokku anymore? I realized that GraalVM would allow me to write it in Clojure and then have a single file to deploy to drop Dokku and simplify my deployment. Maybe not the most necessary use case, but sometimes a man needs an excuse to build a native Clojure binary, ain't it?

And so I did. Of course, Pygments are written in Python, what do I do? I tried to run them in PolyglotVM and failed few times. So now my highlighter is highlight.js, but running on the server (because let HTML and CSS be enough to read pastes).

Also I decided to move storage to SQLite instead of weird gzipped files I had. Single artifact to backup, common way to access data (like zcat is very rare!). But somehow, despite seeing examples where it works, I never got SQLite working in compiled binary, it always complained about being unable to load native sqlite .so. 

"Too bad" I thought and implemented my weird flat files scheme together with tnetstrings encoding (because 10 years ago I was feeling fancy). :) I dropped index file though (why did I need it in first place?) and that "increasing natural numbers" id schema. Instead it's a bit more random now, and guessing previous paste url is harder. 

Do you rewrite frontend code when rewriting backend? Of course you do! Especially given that `user-select: none` was non-existent back then, so code table (with line numbers) was rendered weirdly with line numbers in separate table from code lines. I even had to fix markup back in 2015 because something broke and line numbers were not aligned with code lines. So yeah, just a normal table, and JS got rewritten to make only single selection range possible: I seldom used multiple, so reducing code complexity there felt nice. 

[That's it](https://paste.in.ua/)! Github actions free plan builds it in 7-8 minutes, generating 130MB binary. It eats some memory, but given that server is virtually empty (only some static sites), I don't really care enough to rewrite it in Rust (or Zig or whatever will itch next time). Also, automating my deploy is something I'd like to have, but don't want to do now. :)