title: Opster
tags: python, programming, opster
date: 2009-09-14
----


Two months ago I've released little command line parsing library for Python
called [opster][pypi] (actually it was called finaloption then, but I've renamed
it because of remark from native speaker ;-)). What's the reason to write one
more command line parser when Python already has getopt and optparse in standard
library and not so long time ago argparse and optfunc were released?

Well... as usually, because I think that they are going wrong way and doing
wrong things. Of course, IMO (but what matters if not opinion? :P).<!--more-->

It started to happen when Zed Shaw wrote [big article][zs] on Python warts and
mentioned that Lamson has much better command line parsing solution than
argparse/optparse. I was interested in this topic a little at the time and I
looked at the code. It would be lie to say that I liked it. In fact I thought
that this is a heresy of the same level as optparse. ;-)

I've [written][1] in Twitter that it's funny to say that Lamson has superior
command system and got some amount of sarcasm from Zed and clear understanding
that Zed see nothing bad when:

 - command functions should be defined in a single module
 - default settings are defined by calling separate function inside a command
   function
 - specifying option in command line with mistake wouldn't raise error
 - formatting of help text on options is done by hands

So I thought that world needs Mercurial's command system. ;) And I've rewritten
it as library, keeping main idea.

Small example of usage:

    from opster import command

    @command(usage='[-l HOST] DIR')
    def main(dirname,
             listen=('l', 'localhost', 'ip to listen on'),
             port=('p', 8000, 'port to listen on'),
             daemonize=('d', False, 'daemonize process'),
             pid_file=('', '', 'name of file to write process ID to')):
        '''Command with option declaration as keyword arguments

        Otherwise it's the same as previous command
        '''
        print locals()

    if __name__ == '__main__':
        main()

I think that you should understand what's going on here. For example, option is
required to have long name (keyword argument name), possibly short name (using
`''` will discard short name), some default value and help string. Default value
determines what should be done to incoming data:

 - string - nothing happens, incoming value will remain as string
 - int - incoming value is parsed by calling `int()`
 - list - incoming value is appended to the list
 - function is called with incoming value and output is used
 - True/False/None - option needs no argument, just switching default value in
   opposite value

After wrapping with `@command` your function `main()` can be called:

 - without arguments at all; it will parse `sys.argv` in this case
 - with argument named `argv`, which needs to be list of strings (same as
   `sys.argv[1:]`)
 - with usual arguments/keyword arguments, which are defined in function

I think it may be not obvious that you will get clean values in your function
(for example, `port` will contain value `8000`), and not some strange
three-tuples.

And you get such help for free:

    piranha@gto ~/dev/misc/opster>./test_opts.py --help
    test_opts.py [-l HOST] DIR

    Command with option declaration as keyword arguments

        Otherwise it's the same as previous command

    options:

     -l --listen     ip to listen on (default: localhost)
     -p --port       port to listen on (default: 8000)
     -d --daemonize  daemonize process
        --pid-file   name of file to write process ID to
     -h --help       show help

Furthermore, underscores in argument names are converted to hyphens to support
conventions of command line. ;)

I should mention that option names (and subcommand names, if you're using them)
can be shortened: i.e. you can say `--pi` instead of `--pid-file`.

If I'm going to compare opster with something, this should be [optfunc][] by
Simon Willison.  Most noticeable differences are syntax of command definitions
and subcommand support. Actually optfunc has subcommand support, but it's pretty
incomplete.

Opster uses getopt inside to parse options and that's the reason why it's
somewhat bigger than optfunc (which is essentially optparse wrapper). Opster's
internal API - options are list of four-tuples (short name, long name, default
value, help string) - is exactly the same as Mercurial's API for defining
options. This means that such code will work (taken from [test_cmd.py][]):

    import opster

    config_opts=[('c', 'config', 'webshops.ini', 'config file to use')]

    @opster.command(options=config_opts)
    def initdb(config):
        """Initialize database"""
        pass

    @opster.command(options=config_opts)
    def runserver(listen=('l', 'localhost', 'ip to listen on'),
                  port=('p', 5000, 'port to listen on'),
                  **opts):
        """Run development server"""
        print locals()

    if __name__ == '__main__':
        opster.dispatch()

Interesting thing happens in definition of `runserver`, help and output of which
looks like this:

    piranha@gto ~/dev/misc/opster> ./test_cmd.py help runs
    test_cmd.py runserver [OPTIONS]

    Run development server

    options:

     -l --listen  ip to listen on (default: localhost)
     -p --port    port to listen on (default: 5000)
     -c --config  config file to use (default: webshops.ini)
     -h --help    display help

    piranha@gto ~/dev/misc/opster> ./test_cmd.py runs
    {'port': 5000, 'opts': {'config': 'webshops.ini'}, 'listen': 'localhost'}

You can factor out common options and pass them to @command decorator, keeping
your pants [DRY][]. ;-)

So... Read [documentation][] and use it! :) Any feedback, questions, suggestions and patches are highly
welcome. ;-) 

[1]: http://twitter.com/asolovyov/status/1969773034
[optfunc]: http://github.com/simonw/optfunc/tree/master
[pypi]: http://pypi.python.org/pypi/finaloption
[zs]: http://zedshaw.com/blog/2009-05-29.html "article itself is quite good"
[test_cmd.py]: http://hg.piranha.org.ua/opster/file/tip/test_cmd.py
[dry]: http://en.wikipedia.org/wiki/DRY
[documentation]: http://hg.piranha.org.ua/opster/docs/
