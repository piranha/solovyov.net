title: Firepython - no prints?
tags: python, programming, django
date: 2008-11-24
alternate: <link rel="alternate" hreflang="ru" href="../firepython-no-prints/" />
----



While I'm developing some web application I almost never use any debuggers or
supporting tools: in 90% of cases usual ``print variable`` is enough for
understanding a trouble. Of course, there are some very complicated cases, when
I do ``import pdb; pdb.set_trace()``.

But I was pointed at very cool thing yesterday - [FirePython][]. This thing
consists of two parts - small library on python and plugin for [Firebug][]. This
tandem is engaged with very useful business - it displays all python logged
activity[^1] in Firebug tab.

This tool is really helpful - now I need only two applications for development:
an editor and a browser. Good news is that I don't need to look for print output
in `runserver` output. Regarding usual usage of `logging` there are some
benefits too - at least you don't need to follow files and their paths (for
creation of which you may not have rights), moreover immediately you have nice
viewer for logs with ability to filter them.

I've contributed today to development of FirePython by development of two
middlewares - one for Django and one for WSGI applications, so now its usage is
just a question of few movements. ;) In short: you need to install [plugin][1]
itself, which depends on [Firebug 1.3][2] (it's still in beta stage, but I'm
using Firefox 3.1, so this is not scary for me :P). After that do `easy_install
firepython`. Another option: clone project from github and put folder
`firepython` from `python` folder in `sys.path` or your project directory.

After that you just need to enable middleware by adding its path in
`MIDDLEWARE_CLASSES`: `firepython.django.FirePythonDjango`. WSGI middleware has
another path (how strange! :D): `firepython.wsgi.FirePythonWSGI`, which you
should use as any other WSGI middleware.

Usage of whole system in code looks like:

    import logging
    logging.debug('what you want to debug today?')

Naturally you can use any level instead of debug - you can filter them in
FirePython interface.

[^1]: Precisely saying you will get logs which was logged while FirePython was registered as a handler in logging.

[1]: https://addons.mozilla.org/en-US/firefox/addon/9602
[2]: https://addons.mozilla.org/en-US/firefox/addon/1843
[firebug]: http://getfirebug.com/
[firepython]: http://github.com/woid/firepython/tree/master

