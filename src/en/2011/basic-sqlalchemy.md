tags: python, programming, sql, db
title:  SQLAlchemy: how to start
date: 2011-04-23
----

SQLAlchemy right now is an obvious leader of ORM solutions in Python,
but it has a problem: you will need to read quite a bit of documentation
to start using it. Which is why I've decided to write small introductory
article.

Level 1: hand-written SQL
-------------------------

First step is obtaining a connection to a database:

If you want to use named parameters, there is `text()`:

From objects that you receive by iterating over result - `RowProxy` -
data can be obtained by index, by key or by attribute:

Transaction wanted?

That's already better than using raw DB API, especially given that
parameters are escaped.

Level 2: SQL-expressions in Python
----------------------------------

You can autoguess tables from database and then work with them, if
that's more suitable for you:

That was the same query, but using Python.

Level 3: ORM
------------

And if you prefer working with mapped objects, where you can add some
behavior:

In this case you can use full power of ORM:

Also if you're going to use `Session.execute()`, it accepts strings with
named parameters by default:

Miscellaneous
-------------

Should be noted that by default `Engine` already has a pool of
connections, which is useful.

`MetaData` with reflection and early binding is not a preferred way to
work with SQLA, it's there mostly for ad-hoc scripts and working in
REPL. Usually you want to construct your tables/classes at first and
then bind `Engine` to `MetaData` somewhere later - when you are
configuring your application, for example (by doing `meta.bind = e`).

`Session` often is not used directly, especially in multi-threaded
application - there is \`orm.scoped\_session\`\_, which creates
thread-local session class.

That is basically all I wanted to tell you, for futher information there
is [documentation](http://www.sqlalchemy.org/docs/). :)
