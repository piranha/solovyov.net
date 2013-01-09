tags: go, programming
title:  Cross-compiling Go
date: 2012-03-09
----

Cross-compiling Go
==================

I saw a [thread on
cross-compilation](https://groups.google.com/forum/#!topic/golang-nuts/dQxQ9O7u11g)
in golang-nuts group recently and decided to replicate information here
so I won't forget and (maybe/hopefully) it'll make it easier to discover
for others how to cross-compile go applications.

I'm on OS X and my Go installation resides in `~/var/go`. In this case
what I do is:

    > cd ~/var/go/src
    > CGO_ENABLED=0 GOOS=linux GOARCH=amd64 ./make.bash
    > CGO_ENABLED=0 GOOS=windows GOARCH=amd64 ./make.bash

And afterwards in different directory:

    > CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o gr-linux64 goreplace
    > CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -o gr-win64 goreplace

This has some limitations - you can't cross-compile applications, which
are using CGo. In particular this means applications importing package
`net`. Which is a shame, but still, cross-compilation has never been
easier. :)

UPD. Also see
[this](http://www.reddit.com/r/golang/comments/qowak/crosscompiling_go_code/c3zcriv)
comment on reddit for more.
