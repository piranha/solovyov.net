#!/usr/bin/env python

import sys
import os
import json
from tornado import ioloop, web

DIR = None

class Responder(web.RequestHandler):
    def get(self):
        name = self.get_argument('id')
        try:
            with file(os.path.join(DIR, name)) as f:
                content = f.read()
                self.write(json.dumps({"content": content}))
        except IOError:
            self.write(json.dumps({"error": "data not found"}))

app = web.Application([(r'/', Responder)])

if __name__ == '__main__':
    try:
        DIR = sys.argv[1]
    except IndexError:
        print "Supply path to directory with data as first argument"
        sys.exit()

    app.listen(8080, 'localhost')
    ioloop.IOLoop.instance().start()
