#!/usr/bin/env python

import re
import asyncore
import os, os.path as op
import email, email.utils, email.header
import urllib
import shlex
from datetime import datetime
from smtpd import SMTPServer
from HTMLParser import HTMLParser
from subprocess import Popen

from opster import command
import jinja2

# haha this is damned global and I don't care :P
TEMPLATE = jinja2.Template(u'''
title: <a href="{{ link }}">{{ subject }}</a>
date: {{ date.strftime("%Y-%m-%d %H:%m:%s") }}
----

{{ desc }}
''')

LINK_RE = re.compile('https?://[^ \r\n]+')

# tag stripper

class HTMLStripper(HTMLParser):
    def __init__(self):
        self.reset()
        self.content = []

    def handle_starttag(self, tag, attrs):
        if tag == 'br':
            self.content.append('\n')

    def handle_endtag(self, tag):
        if tag == 'div':
            self.content.append('\n')

    def handle_data(self, d):
        self.content.append(d)

    def get_data(self):
        return ''.join(self.content)


def strip_tags(html):
    s = HTMLStripper()
    s.feed(html)
    return s.get_data()


# helpers

def getnewnum(path, day):
    r = re.compile('%s-(\d+).md' % day)
    matches = map(r.search, os.listdir(path))
    groups = [m.group(1) for m in matches if m]
    if not groups:
        return 1
    return max(map(int, groups)) + 1


# this is laughable, but who cares
def get_best_payload(m):
    if not m.is_multipart():
        return m.get_payload()
    for p in m.get_payload():
        ct = p.get_content_type()
        x = p.get_payload(decode=True)
        if x and ct == 'text/plain':
            return x
        elif x and ct == 'text/html':
            return strip_tags(x)


def parse_dt(s):
    t = email.utils.parsedate(s)
    return datetime(*t[:7])


def decode_header(s):
    return email.header.decode_header(s)[0][0].decode('utf-8')


def fetch_title(url):
    data = urllib.urlopen(url).read()
    try:
        return re.search('<title>([^<]+)</title>', data).group(1)
    except (AttributeError, IndexError):
        return url


def parse_payload(m, payload):
    link = LINK_RE.search(payload).group(0)
    desc = payload.replace(link, '').strip()
    subject = decode_header(m['subject'])
    if subject == link and '://' in link:
        subject = fetch_title(link)
    return {
        'from': m['from'],
        'date': parse_dt(m['date']),
        'subject': subject,
        'link': link,
        'desc': '' if desc in (link, subject) else desc,
        }

# Epic mail server

class FancyServer(SMTPServer):
    def __init__(self, base, after, *args, **kwargs):
        self.base = base
        self.after = shlex.split(after)
        SMTPServer.__init__(self, *args, **kwargs)

    def process_message(self, peer, mailfrom, mailto, data):
        # if mailfrom != 'alexander@solovyov.net':
        #     return

        m = email.message_from_string(data)
        m.set_unixfrom(mailfrom)

        payload = get_best_payload(m)
        if payload:
            payload = payload.decode('utf-8')
        else:
            payload = decode_header(m['subject'])

        data = parse_payload(m, payload)
        fn = make_post(self.base, data)
        url = fn
        tweet(data, url)

        Popen(self.after)


# Actions

def make_post(base, data):
    now = datetime.now()
    path = op.join(base, now.strftime('%Y-%m'))
    if not op.exists(path):
        os.makedirs(path)
    n = getnewnum(path, now.day)

    fn = op.join(path, '%d-%d.md' % (now.day, n))

    result = TEMPLATE.render(data).lstrip()
    with file(fn, 'w') as f:
        f.write(result.encode('utf-8'))

    return fn


def tweet(data, url):
    pass

# Interface

@command()
def run(dest,
        address=('a', 'localhost:2323', 'Address to listen on'),
        after=('', '', 'Command to run after processing each email'),
        template=('t', '', 'Path to Jinja2 template')):
    '''Fancy Mail Processing Agent
    '''
    # if not template:
    #     print >> sys.stderr, 'Supply template since I have no idea what to do'
    #     sys.exit(1)
    host, port = address.split(':')
    s = FancyServer(dest, after, (host or 'localhost', int(port)), None)

    # global TEMPLATE
    # TEMPLATE = jinja2.Template(file(template).read())

    print 'Listening to %s:%d...' % s.addr
    try:
        asyncore.loop()
    except KeyboardInterrupt:
        pass


if __name__ == '__main__':
    run.command()
