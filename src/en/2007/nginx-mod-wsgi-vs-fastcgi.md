title: Nginx + Django: mod_wsgi vs FastCGI
tags: nginx, django, wsgi, fastcgi, performance
date: 2007-11-24
----

(Translation of my previous [post][1]).

Yesterday I have finally sorted out my trouble with compilation of nginx'
[mod_wsgi][2] and got it working (how much means slash in our life ;-).

Configuration to get Django application running is quite simple -
[django.wsgi][3], which is used for Apache's `mod_wsgi`, fits perfectly. I'll
not describe all configuration, because code is unstable and needs testing and
is's contra-indicated to run it on production now.

Lets do the fun - testing. :-) Simple page, 15 queries (PostgreSQL on same pc),
2 workers for nginx (I have tried 3 and 4 - they both are slighty slower, for
2-4 ms). Two variants of testing queries (`ab -n 1000 -c 20` and `ab -n 10000 -c
500`) and three variants of servers (`mod_wsgi`, `prefork fastcgi`, `threaded
fastcgi`). Hardware (this is not so interesting, because performance is
interesting only in comparison, but why not to show it?)
- Core 2 Duo T7300 and 2 Gb of RAM.

First - `ab -n 1000 -c 20` (around of 10-12 runs for every variant):

- `mod_wsgi` takes 14.2-14.3 ms per query, quite stable performance
- `prefork fastcgi` takes 12.5-16.5 ms (mostly near of 12 ms, but raises from
  time to time), eats bigger amount of RAM - I have an xmobar[^1] showing usage
  of RAM and `mod_wsgi` has a two-three percents (percent is 20 megs) lesser
  usage
- `threaded fastcgi` takes 24-25 ms per query - it uses only one core of CPU. I
  have tried to get `upstream` working in `nginx` - it works, but uses only 1
  process for some reason :-(

I.e. in most cases for such load FastCGI is slighty faster (and uses somewhat
bigger amount of resources). But... lets go further? ;)

Second - `ab -n 10000 -c 500` (here I got 3-4 runs for every variant):

- `mod_wsgi` takes 13-14 ms. Pretty stable result. Each worker consumes 21/15
  megs of RAM (VSZ/RSS)
- `prefork fastcgi` takes 15.5-17 ms per request, but it runs from 40 to 50
  serving instances, each consuming 16-20 VSZ (10-13 RSS) megs of RAM! xmobar
  says that usage raises up to 50% (by leaps, usually around 45-48%) - compare
  to 33% for `mod_wsgi`! Additional 300 mbytes of RAM.
- `threaded fastcgi` - most "interesting" variant. With this level of
  concurrency it just dies. With `-c 100` - dies. It lives with `-c 50` with
  slighty lower speed than with `-c 20`, but process eats near of 300 mb of VSZ.

What I can say here? Lets wait for stable mod_wsgi release! :-) Thanks, Manlio,
for this piece of code. :-)

[1]: http://piranha.org.ua/blog/2007/11/24/nginx-mod-wsgi-vs-fastcgi/
[2]: http://hg.mperillo.ath.cx/nginx/mod_wsgi/
[3]: http://trac.piranha.org.ua/browser/byteflow/django.wsgi
[4]: http://gorgias.mine.nu/xmobar/

[^1]: [xmobar][4] - small statusbar, written on Haskell. Displays system state and other various information

