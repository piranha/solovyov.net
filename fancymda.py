#!/usr/bin/env python

'''
This is a script indended to work as an MDA for your mail server, for example
Exim could be configured like so:

    # somewhere after 'begin transports'

    fancymda_pipe:
      debug_print = "T: fancymda_pipe for $local_part@$domain"
      driver = pipe
      path = "/bin:/usr/bin:/usr/local/bin"
      command = "/home/piranha/web/solovyov.net/fancymda.py /home/piranha/web/solovyov.net/src/links --after '/home/piranha/web/files/gostatic-linux /home/piranha/web/solovyov.net/config'"
      user = piranha
      return_path_add
      delivery_date_add
      envelope_to_add

    # somewhere after 'begin routers'

    redirect_links:
        debug_print = "R: redirect_links for $local_part@$domain"
        local_parts = whatever-name-you-want-for-local-part
        senders = your-email
        driver = accept
        transport = fancymda_pipe

After that you send an email, which will be parsed and then rendered with one of
templates depending on that email content: it tries to get a link from email and
then determine if it's an image.

Improvement to follow... I hope. :)
'''

import re
import sys
import os, os.path as op
import email, email.utils, email.header
import shlex
from urllib2 import urlopen, HTTPError
from datetime import datetime
from HTMLParser import HTMLParser
from subprocess import call

from opster import command
import jinja2

t = lambda x: jinja2.Template(x.strip())

TEMPLATES = dict(
    link = t(u'''
title: {{ subject }}
link: {{ link }}
date: {{ date.strftime("%Y-%m-%d %H:%M:%S") }}
tags: link
----

{{ desc }}
'''),

    image = t(u'''
title: {{ subject }}
link: {{ link }}
date: {{ date.strftime("%Y-%m-%d %H:%M:%S") }}
tags: image
----

<img src="{{ link }}">

{{ desc }}
'''))

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
    data = urlopen(url).read()
    try:
        return re.search('<title>([^<]+)</title>', data).group(1)
    except (AttributeError, IndexError):
        return url

def fetch_type(url):
    try:
        r = urlopen(url)
    except HTTPError:
        pass
    else:
        ct = r.info().get('Content-Type')
        if ct.startswith('image/'):
            return 'image'
    return 'link'

LINK_RE = re.compile('https?://[^ \r\n]+')

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
        'type': fetch_type(link),
        'desc': '' if desc in (link, subject) else desc,
        }


# Actions

def make_post(base, data):
    now = datetime.now()
    path = op.join(base, now.strftime('%Y-%m'))
    if not op.exists(path):
        os.makedirs(path)
    n = getnewnum(path, now.day)

    fn = op.join(path, '%d-%d.md' % (now.day, n))

    result = TEMPLATES[data['type']].render(data)
    with file(fn, 'w') as f:
        f.write(result.encode('utf-8'))


# Interface

@command()
def run(dest,
        address=('a', 'localhost:2323', 'Address to listen on'),
        after=('', '', 'Command to run after processing each email'),
        template=('t', '', 'Path to Jinja2 template')):
    '''Fancy Mail Processing Agent
    '''
    data = sys.stdin.read()
    m = email.message_from_string(data)

    payload = get_best_payload(m)
    if payload:
        payload = payload.decode('utf-8')
    else:
        payload = decode_header(m['subject'])

    data = parse_payload(m, payload)
    make_post(dest, data)

    if after:
        sys.exit(call(shlex.split(after)))

if __name__ == '__main__':
    run.command()
