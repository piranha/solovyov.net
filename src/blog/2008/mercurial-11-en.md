title: Mercurial 1.1
tags: news, hg
date: 2008-12-02
alternate: <link rel="alternate" hreflang="ru" href="https://solovyov.net/blog/2008/mercurial-11/" /> <link rel="alternate" hreflang="en" href="https://solovyov.net/blog/2008/mercurial-11-en/" />
----



Mercurial 1.1 is out and [list of changes][1] takes 2.5 pages. There are some my
efforts in this release, ;-) but in overall two most appealing features for me
is a graph of changeset tree in webinterface and `zeroconf` extension - it
allows `hg paths` to display all `hg serve` instances running in a local
network. Very useful - now I don't need to ask and answer about IPs. :)

Of course, there is long-awaited result of Google SoC - `rebase` and also
`bookmarks` - git-like branches. Sad news is that bookmarks are only local now,
but I hope that 1.2 will handle that.

[1]: http://www.selenic.com/mercurial/wiki/index.cgi/WhatsNew#head-b1d1f9a535adb686d6e0a490e049261313f10d7d
