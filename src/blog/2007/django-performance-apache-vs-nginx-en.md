title: Django performance: Apache vs Nginx
tags: apache, nginx, django, wsgi, fastcgi, performance
date: 2007-12-01
alternate: <link rel="alternate" hreflang="ru" href="https://solovyov.net/blog/2007/django-performance-apache-vs-nginx/" /> <link rel="alternate" hreflang="en" href="https://solovyov.net/blog/2007/django-performance-apache-vs-nginx-en/" />
----

Just a week ago I have [compared][1] performance and stability of nginx working
with Django through mod_wsgi and fastcgi. Comparison revealed that performance
with fast local DB (i.e. time of DB work is negligibly small) is almost
identical and all the difference is in used resources.

Today at last I have time to look, what will be, when database is located at
other computer and WiFi connection between application and DB worsening
situation. :-) I.e. sense of my today's actions is looking at situation, when DB
is slow (this is interesting for me after Manlio's commentary in previous
post). Additionally I wanted to look at Apache's behavior.

Before doing that I runned lightweight test (`ab -n 100 -c 20`) on Apache (with
local database), which showed up that Apache don't want to use my two cores. :-(
Nor prefork, neither worker don't used second core and time between requests
was around 28 ms, which is two times to nginx' 14 ms. Logic thoughts said that
heavy-weight Apache in any case is slower than nginx - second core will not
improve performance in two times (so says nginx' 24 ms when working with one
core :-).

Further PostgreSQL was launched at another laptop. Apache was tested in both
versions, prefork and worker and displayed no difference, so I've stopped on
worker.

First - `ab -n 1000 -c 20`:

- Apache - ~37 ms. Very stable, difference in time between 5 runs was lesser
  than 1 ms.
- nginx + mod_wsgi - ~50 ms. Expected (as Manlio said, nginx is blocked while
  working with application, which is blocked by request to DB).
- nginx + fastcgi prefork - ~28 ms. I can't believe it is so faster than Apache!
  :-)

Second test - `ab -n 3000 -c 500` - is not very distinguished from first. Apache
and fastcgi - same result, mod_wsgi raised to 55 ms.

At that moment I thought that mod_wsgi is only suited for application without
database (or when delays for its work is negligibly small). But, thought over, I
made knight's move - raised number of workers in nginx. :-) With 16 workers
(tested after - 8 is enough) and 500 concurrent connections delay between
answers is 28 ms. Now I can believe in fastcgi result and Apache is heavy and
fat, as usual. ;-) Thought, every nginx' process, which works with Django, eats
around 15 mb of RAM. However apache and fastcgi (threaded, forked) want bigger
amount of memory.

Everyone can do summary for himself, the only one thing I can say unambiguously
- nginx + mod_wsgi is very interesting combination.

[1]: https://solovyov.net/blog/2007/nginx-mod-wsgi-vs-fastcgi-en/

