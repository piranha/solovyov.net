title: MacOS: too many open files
date: 2013-01-21
tags: macos, gostatic
alternate: <link rel="alternate" hreflang="ru" href="https://solovyov.net/blog/2013/ulimit/" /> <link rel="alternate" hreflang="en" href="https://solovyov.net/blog/2013/macos-too-many-open-files/" />
----

Sometimes MacOS gives you an error like this. I tried to fix that by whatever
Internet told me: made `kern.maxfiles` and `kern.maxfileperproc` values bigger,
changed limits in `launchctl limit` - it did not really help though. Usually the
error went away just because some application stopped doing what it was doing.

Lately it became unbearable: I start
[gostatic](https://github.com/piranha/gostatic) in a file watching mode and some
file changes triggered execution of an external command (`lessc` in my case),
which caused `too many open files`. How many is "too many", dammit! Anyway, I've
spent 10 minutes on that again and here is the post to prevent searching web
again (and maybe it'll help somebody else as well).

So, solution. I never looked carefully enough at `ulimit -n`, because it always
said `unlimited`. It seems like a wishful thinking though, and the actual limit is pretty low. So:

```bash
ulimit -S -n 4096
```

did help!

FYI: I've spent some time experimenting and established that maximum open files
per 1 process is 249 inclusive.
