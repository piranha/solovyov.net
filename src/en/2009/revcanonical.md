title: Short urls — rev=canonical
tags: django, byteflow
date: 2009-04-12
----


Just yesterday my feed reader fetched Simon Willison's [article][1] about
relatively new method of url shortening.

The idea is that url shorteners in fact are not very good thing, especially from
URL term of life point of view. What if tinyurl.com is going to die? A lot of
URLs will appear unusable, even if their destination is still alive. And
discussion gave birth to thought that it could be nice to allow sites to specify
their own short urls, even using their own url shorteners.

There is [site][3] with specification (if it can be named so), in short - you
should specify it in your `<head>...</head>` section with such link:

    <link rev="canonical" href="short-url-here">

In his article Simon tells about how he has implemented `rev="canonical"` in
it's own blog - I like his solution for not saving anything in database. ;) But
hardcoding actual types of content is not that cool, so I've done small Django
application - [revcanonical][2], whose task is to generate and redirect such
short links.

Every url is a two strings joined by a dot - it's a base62-coded[^1]
identification numbers of content type and object in database. So you can use
that application for any object without any configuration. README has
instructions on how to install and use application.

Of course, functionality is already incorporated into Byteflow. ;-)

[^1]: Digits, big and small latin letters

[1]: http://simonwillison.net/2009/Apr/11/revcanonical/
[2]: http://hg.piranha.org.ua/django-revcanonical/
[3]: http://revcanonical.appspot.com/
