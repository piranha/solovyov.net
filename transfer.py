#!/usr/bin/python

import os, os.path as op
import sys
import re
from subprocess import check_output
import textwrap


MAP = {}


def between(start, end, s):
    return s[s.index(start) + len(start):s.index(end)]


def fromhtml(content):
    head = between('{% meta %}', '{% endmeta %}', content)
    body = between('{% mark body %}{% filter markdown %}',
                   '{% endfilter %}{% endmark %}',
                   content)

    return textwrap.dedent(head), body


def fromrst(fn, content):
    head = between('.. meta::', '\n======', content)
    body = check_output(['pandoc', '-f', 'rst', '-t', 'markdown', fn])
    title = re.search('====+\n([^\n]+)\n====+', content).group(1)
    head = textwrap.dedent(head).strip() + '\ntitle: ' + title
    return head, body


def fixtags(s):
    return re.sub('tags: \[([^\]]+)\]', r'tags: \1', s)

def setdate(s, fn):
    if 'date:' in s:
        return s
    date = re.search('(\d{4}/\d\d-\d\d)-', fn)
    if not date:
        print 'Unknown date for %s' % fn
        return s
    date = date.group(1)
    s = s.strip() + '\ndate: ' + date.replace('/', '-')
    return s

def escape(body):
    return body

def trytransfer(srcdir, tgtdir, fn):
    try:
        tgtfn = re.split('^\d\d-\d\d-', fn)[1]
        tgtfn = op.splitext(tgtfn)[0] + '.md'
    except IndexError:
        return # only interested in blog posts right now
    src = op.join(srcdir, fn)
    tgt = op.join(tgtdir, tgtfn)

    MAP[src] = tgt

    content = file(src).read()
    if op.splitext(fn)[1] == '.html':
        head, body = fromhtml(content)
    elif op.splitext(fn)[1] == '.rst':
        head, body = fromrst(src, content)

    head = fixtags(head)
    head = setdate(head, src)
    body = escape(body)

    with file(tgt, 'w') as f:
        f.write(head.strip())
        f.write('\n----\n\n')
        f.write(body)


def main(source, target):
    for dirpath, dirnames, fns in os.walk(source):
        append = dirpath[len(source):]
        for fn in fns:
            if op.splitext(fn)[1] in ['.html', '.rst']:
                trytransfer(dirpath, target + append, fn)

    for k, v in MAP.items():
        old = op.splitext(k[len(source):])[0]
        new = op.splitext(v[len(target):])[0]
        print "rewrite %s.* %s/ permanent;" % (old, new)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
