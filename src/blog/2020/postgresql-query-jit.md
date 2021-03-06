title: PostgreSQL query JIT
date: 2020-06-23
tags: postgresql, programming
----

We're proud users of PostgreSQL. Proud in a sense we're really glad that our main data store is such a stable, performant, introspective, and overall great DBMS. It's been very reliable for us and in times of turbulence made it possible to understand what the issue is. Overall, I love it. 

We were on 10.x since ages - upgraded a month after it came out. We did a regular old school upgrade using `pg_upgrade`. You see, one of PG traits is that on-disk data layout is different between major versions. That means that version 10 can't work with data from version 9 (and vice versa) and you have to convert the data to run a new version. It's a PITA but gives you time to test and see if everything is okay, etc. 

But when 11th came out something stopped us from upgrading (I don't remember what). Plus around that time we started using [pglogical](https://www.2ndquadrant.com/en/resources/pglogical/) for a purpose of having, for example, an analytical replica. Or a partial replica to speed up something. And our idea of the next major upgrade was to use logical replication to copy data from our main db to the new node with newer PostgreSQL. It's one of the cool features of logical replication - you can replicate data between nodes with different major versions. 

Then pg12 came out. It was a great (as always) release, with a lot of performance improvements (CTE is not an optimization fence anymore, woohoo!), plus JIT was improved and enabled by default, and some new exciting features (jsonpath anyone?). And we're experienced users of logical replication now. 

It is time to upgrade then, right? Not so fast, amigo. 2ndQuadrant, authors of pglogical, had some problems with rolling out new release for pg12. I don't know details here, but after some time they figured stuff out and February saw release of pglogical 2.3.

Cool! So after weeks of preparation on one uneventful (so far) night of 16th of April, a designated person did a migration. Well, a migration was done by logical replication before, so he switched pgbouncer to the new main db. 

As a logical (heh) consequence of that - we did not really test pg12 on production traffic. Is that because of blind faith? Or laziness? It's a hard question.

For some time everything was normal. New PostgreSQL, running smoothly, yada-yada-yada. And then the traffic came. It wasn't even some peak sale or anything. Our daily campaigns start at 6:00, so that's the start of the day for the site. Right at 6:00 pg started to feel unwell.

At 6:40, when I was woken up, site barely moved. We tracked slowdown to a very popular query, which selected a user from db: it was executed on every request which required authentication. 

And what was wrong? Query plan for this query was so wildly weird that we've tried to use our intuition first and just disabled non-critical parts which we knew were heavy. This improved our mean API timings from 10s to 5s. Which is still strictly in "site is unresponsive" category.

Okay, back to investigation. Explain for that query was the same as on pg10, but explain analyze said that 12.9s of 13s of execution (API timings are lower because of caches) are spent on joining `auth_user` and `user_userprofile`. We're an ex-Django site and that means some peculiarities in database design. For example, having a table called `product_product`, or that stuff where `auth_user` is a table about users and `user_userprofile` is about users data. So the interesting part of the query plan looks like this:

```
->  Nested Loop  (cost=0.86..12.89 rows=1 width=310) (actual time=13708.286..13708.290 rows=1 loops=1)
      ->  Index Scan using auth_user_pkey on auth_user u  (cost=0.43..6.44 rows=1 width=97) (actual time=0.108..0.108 rows=1 loops=1)
            Index Cond: (id = 7002298)
      ->  Index Scan using user_userprofile_user_id_key on user_userprofile p  (cost=0.43..6.44 rows=1 width=217) (actual time=0.087..0.088 rows=1 loops=1)
            Index Cond: (user_id = 7002298)
```

What is the magic here? How does `0.08 + 0.1` results in `13708`? Is this the real life or is this just fantasy? We've spent half an hour pondering on that question until [Vsevolod](https://vsevolod.net) woke up and told me there is a JIT report at the end of the query plan:

```
 Planning Time: 2.515 ms
 JIT:
   Functions: 138
   Options: Inlining true, Optimization true, Expressions true, Deforming true
   Timing: Generation 108.775 ms, Inlining 888.683 ms, Optimization 7700.314 ms, Emission 5091.838 ms, Total 13789.610 ms
 Execution Time: 13821.487 ms
```

I blame this on both being too sleepy (being woken up in the wrong sleep phase is a pain) and having absolutely zero experience with JIT. Somehow this `Optimizations` word has captured my attention and I've spent quite a bit of time reading up on new optimizations in PostgreSQL and how to disable them. No idea why `Emission` did not have my attention - I guess its time just didn't come yet. :-) 

JIT got disabled. API response timings dropped from 5s to whatever they are normally. Things went back to usual state.

## Reasons

Discussion on [lobste.rs](https://lobste.rs/s/r6ydjp/postgresql_query_jit) was coming to a conclusion that 14 seconds is too much for a JIT and maybe we triggered some bug in PostgreSQL. So I went up to reproduce this, but with more verbose query plan (literally `explain (analyze, verbose, buffers) ...`). And got this:

```
 Planning Time: 2.240 ms
 JIT:
   Functions: 101
   Options: Inlining false, Optimization false, Expressions true, Deforming true
   Timing: Generation 13.719 ms, Inlining 0.000 ms, Optimization 3.280 ms, Emission 83.755 ms, Total 100.753 ms
 Execution Time: 102.812 ms
```

My first reaction was of course "argh it fixed itself or what?!" But then it hit me: this is one of the most frequent queries in our database and JIT adding 100 ms of CPU time (because just in time compilation for sure is not some I/O wait) put such a massive load on our CPUs that eventually that 100 ms went up to being 14 seconds.

## Conclusion

We should have tested more. Also, we need more monitoring to see that one query became too slow. I've been thinking that not skipping PG11 would've helped to test JIT and identify this issue early. OTOH it seems it wasn't that straightforward to enable.

With all that said, I can't shake off the feeling that JIT being enabled by default is a bit too early.