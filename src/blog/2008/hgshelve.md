title: Hgshelve
tags: python, programming, hg
date: 2008-05-19
----



NOTE: Not to be confused with a mercurial extension, named [shelve][].

Few days ago there was a lot links on the Internet to [gitshelve][1], which
implements persistent versioned storage of objects in the git. I've read
it description and realized that there are few serious design flaws:

 * Can store only strings
 * Uses `subprocess.PIPE` for interconnection with git
 * Uses bunch of C+Perl+Shell code in Python library instead of using another
   Python library ;-)<!--more-->

## History

We've discussed it with [Pythy][], and I've convinced him to write
[hgshelve][], which should be easy and pain-free to implement. First thing
which we came to is storage of objects through usage of simplejson, which
generates (opposing to pickle) easy-readable string representation of
objects. Plus objects, dumped by simplejson, can be edited by hands without
fear of occasional corruption caused by newline or space.

While I was theorizing, he just wrote code and got hgshelve working. ;-) And
from starts all mentioned flaws of gitshelve was fixed. ;-)

## Usage

It's really simple to use, just as usual shelve:

    >>> import hgshelve
    >>> data = hgshelve.open('path/to/repo') # repository is opened/created here
    >>> data['key'] = {1: "Hello, world!", 'b': 'just test'}
    >>> data.sync()
    >>> data
    {'key': {u'1': u'Hello, world!', u'b': u'just test'}}

Additionally you can use `data.commit`, which optionally accepts two
arguments: commit message and key to commit (if you want to commit single
key).

There are no support of advanced mercurial features, like branches[^1] and
named branches, though it can arise lately. `get_data` method can return data
from another revision through getting optional argument called `rev`, which
can be one of: revision number, partial (or full) revision hash, mercurial
tag.

## Dependecies

There are only two of them:

 * Mercurial
 * simplejson

## Where to get

Just clone repository:

    hg clone http://hg.piranha.org.ua/hgshelve/

[^1]: Branches in mercurial are the same as they are in git (where they are called named branches), but instead they can be created implicitly and they don't carry names.

[1]: http://www.newartisans.com/blog_files/git.versioned.data.store.php
[Pythy]: http://pyobject.ru/
[hgshelve]: http://hg.piranha.org.ua/hgshelve/
[shelve]: http://www.selenic.com/mercurial/wiki/index.cgi/ShelveExtension
