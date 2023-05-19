title: Server-Sent Events, but with POST
date: 2023-05-17
tags: js, programming
----

![less is more](less-is-more.jpg)

I really like [Server-Sent Events][1]: the protocol is quite simple and
effective, and using it from a browser is easy. Listen for a `message` event
on `EventSource`, and it just works. [gostatic][] hot reload functionality is
[built using SSE][2], and it works very well and takes just a pinch of code.

[1]: http://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
[gostatic]: https://github.com/piranha/gostatic/
[2]: https://github.com/piranha/gostatic/blob/master/hotreload/assets/hotreload.js#L5-L10

Let's get to my current usecase though. I'm making an AI-powered editor right
now - and streaming response from OpenAI API looks so much better than a really
long wait for a full response. Plus you can abort that response in-flight if you
see it going awry.

Which means I need to send context to a server, right? And the only way to
convey anything to a server using `EventSource` object is through an URL. There
is no way I can pass enough context through an URL, and I really don't want to
use WebSockets here. It's a totally different beast, and why would I reach for
something that different if I have an almost perfect tool for that job?

So I searched the internets a bit and found [an implementation of SSE using
fetch][3]. I had to upgrade it a little bit - there is no protocol parsing, but
it's a few lines of code and now it works perfectly.

[3]: https://rob-blackbourn.medium.com/beyond-eventsource-streaming-fetch-with-readablestream-5765c7de21a1

Except later on I decided to make that "abort" button. How do you abort a
`fetch` request? You create an [`AbortController`][], then pass it as
`fetch(url, {signal: controller.signal})`, and then call an `.abort()`
method. Awkward? Very much so. But at least it's working? Not at all!

[AbortController]: http://developer.mozilla.org/en-US/docs/Web/API/AbortController

I mean, yeah, request is aborted. But your promise (the one `fetch` returned) is
never rejected (nor resolved, of course). And in Firefox' devtools console you
get an error on the line with `controller.abort()` call. You can't catch it with
a `try/catch`. Chrome is even better: it reports an error on the first line of
your HTML. _Wooohooo momma I'm a web developer help me before I killed a man._

One option is to reject that promise by myself, but all that stuff sounds
dirty. So I reached to an old friend `XMLHttpRequest` and that guy is reliable
as ever! Behold the mighty:

```js
function sseevent(message) {
  let type = 'message', start = 0;
  if (message.startsWith('event: ')) {
    start = message.indexOf('\n');
    type = message.slice(7, start);
  }
  start = message.indexOf(': ', start) + 2;
  let data = message.slice(start, message.length);

  return new MessageEvent(type, {data: data})
}

export function XhrSource(url, opts) {
  const eventTarget = new EventTarget();
  const xhr = new XMLHttpRequest();

  xhr.open(opts.method || 'GET', url, true);
  for (var k in opts.headers) {
    xhr.setRequestHeader(k, opts.headers[k]);
  }

  var ongoing = false, start = 0;
  xhr.onprogress = function() {
    if (!ongoing) {
      // onloadstart is sync with `xhr.send`, listeners don't have a chance
      ongoing = true;
      eventTarget.dispatchEvent(new Event('open', {
        status: xhr.status,
        headers: xhr.getAllResponseHeaders(),
        url: xhr.responseUrl,
      }));
    }

    var i, chunk;
    while ((i = xhr.responseText.indexOf('\n\n', start)) >= 0) {
      chunk = xhr.responseText.slice(start, i);
      start = i + 2;
      if (chunk.length) {
        eventTarget.dispatchEvent(sseevent(chunk));
      }
    }
  }

  xhr.onloadend = _ => {
    eventTarget.dispatchEvent(new CloseEvent('close'))
  }

  xhr.timeout = opts.timeout;
  xhr.ontimeout = _ => {
    eventTarget.dispatchEvent(new CloseEvent('error', {reason: 'Network request timed out'}));
  }
  xhr.onerror = _ => {
    eventTarget.dispatchEvent(new CloseEvent('error', {reason: xhr.responseText || 'Network request failed'}));
  }
  xhr.onabort = _ => {
    eventTarget.dispatchEvent(new CloseEvent('error', {reason: 'Network request aborted'}));
  }

  eventTarget.close = _ => {
    xhr.abort();
  }

  xhr.send(opts.body);
  return eventTarget;
}
```

That's the full implementation of `EventSource` (at least for my use case), even
the method to close connection is called `close()`, just as in real
`EventSource`.

One interesting thing to note here is that `loadstart` event is sent
synchronously with the `xhr.send(opts.body)` call. This feels weird to me, since
no listeners are ready when it's send... But if I put `xhr.send` in
`setTimeout`, then data starts arriving _visibly_ later. I have no idea why,
profiling and looking at network panel did not give me any insights, so if you
know what's up or get other results or anything - hit me up, I'd love to
understand what is going on.

All in all it feels like this post took more time to write than the code - and
it's much simpler than DecodablePipe stuff from Rob's post. Works well for me,
so maybe it'll do the same for you. :)
