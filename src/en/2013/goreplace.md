title: Go Replace!
date: 2013-05-21
tags: programming, go
----

Once upon a time two and something years ago I decided to check out [Go][] to
learn if it's easy to write applications using it and how good (or bad) result
is. Idea for a first application popped up immediately - my beloved Python has
somewhat slowish startup, so I decided to rewrite [sr][], which I used a lot, in
Go.

That's how [Go Replace][] was born (I should've written this post two years ago,
frankly). Obviously, searching in files is a problem solved long time ago - you
could use find + grep, or grep + shell glob expansion, or [ack][], or
[the_silver_searcher][], but none of them can perform replacement. And this
point was always a pain for me, since rewriting command line in find + sed or
xargs + sed is not the most pleasant task. But `gr` (a short name I've chosen)
can, and that's the whole deal:

    # searching
    $ gr what-is-it
    # and replacing
    $ gr what-is-it -r here-you-go

Press key `up` and add replacement line and here you go indeed!

Long story short: it's easy to write in Go, applications are fast and
beautiful. :) Other things being equal it's usually around 1.5x-2x of speed of
GNU grep (it's not recent test but I'm not really worried about such speed
difference). But it uses patterns from `.hgignore` and `.gitignore` of your
repository to skip files and skips binaries, so usually it's faster. :) And you
get normal regexp syntax instead of POSIX' kind of grep/sed.

Plus you don't need to compile anything! Just download and enjoy: for [OS X][1],
[Linux][2] and [Windows][3]. It's just a binary and it has absolutely no
dependencies.

[Go]: http://golang.org/
[sr]: https://bitbucket.org/lorien/sr
[Go Replace]: https://github.com/piranha/goreplace
[ack]: http://beyondgrep.com/
[the_silver_searcher]: https://github.com/ggreer/the_silver_searcher
[1]: http://solovyov.net/files/gr-latest-osx
[2]: http://solovyov.net/files/gr-latest-linux
[3]: http://solovyov.net/files/gr-latest-win.exe
