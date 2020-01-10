title: HTTP2 server push for static sites
date: 2019-11-08
tags: dokku, http2
----

It's been a long time already since we've got HTTP2 push working at [Kasta](https://kasta.ua). And it's a fantastic technology: if you know some resource is going to be needed by a client (browser or app), you can send that data down the network before the client even realizes the need. Our HTTP API is structured so that you first request a list of product ids, then you can get product details using those ids. And we're pushing the first few products when you get a list of ids, and that product details handler pushes the first image of a product (in the case when it can determine the image size you need).

The way it works is HTTP handler returns special header (`Link: </path>; rel=preload`) and then upstream HTTP balancer (be it Nginx or Cloudflare or whatever) will retrieve data by that path (making network roundtrip much shorter) and send it to a client through the same HTTP2 connection.

At some point, I was looking at my [site](/) and decided that there is a clear possibility to speed it up: push CSS and JS files to a client. It was not necessary, but it was certainly something I could do: and when I can, what will stop me? :)

But there was a problem! I use [gostatic](https://github.com/piranha/gostatic) to generate HTML pages from Markdown sources and Go templates and static files, and I did something clever there: I put a long expiration headers on files like CSS and JS, and then use hash of their content in query string to force browsers to load them if their content changes. Again, the reasoning was the same: I could do that, so I did it. It's certainly clever, but it prevented me from instructing my Nginx to push that file: browsers would not recognize `/static/main.css` and `/static/main.css?v=b1d2e227` as the same file.

But then I remembered that *actually* site is hosted in Docker image with its own Nginx (hello Dokku), and then another Nginx (host one) in front of that. That opens a possibility!

## Configuration

I opened `/home/dokku/solovyov.net/nginx.conf` on the server and added those lines to my `server`:

```
listen      443 ssl http2;
http2_push_preload on;
```

Okay, `listen` was replaced, but you get the idea.

Then I went to sources of my site and did [that](https://github.com/piranha/solovyov.net/commit/ecb6c1ec7d830240a2d6ea8950340f88266f0354). Breaking that down:

1) Created `src/_nginx_push.conf`, which upon rendering will generate `Link` headers with necessary paths:

```
add_header Link "<{{ "static/main.css" | version . | cut "^." "$" }}>; as=style; rel=preload";
add_header Link "<{{ "static/stuff.js" | version . | cut "^." "$" }}>; as=script; rel=preload";
```

2) Told gostatic to render that file as a template, by editing `config`:

```
_nginx_push.conf:
	inner-template
```

3) Told inside-the-Docker Nginx to add those headers to all responses of `.html` files (or directories):

```
location ~* (/|\.html)$ {
    include /app/www/_nginx_push.conf;
}
```

## Check it

That was it! That stuff works! We can look at push paths:

```
> curl https://solovyov.net/_nginx_push.conf
add_header Link "</static/main.css?v=b1d2e227>; as=style; rel=preload";
add_header Link "</static/stuff.js?v=7d54ee41>; as=script; rel=preload";
add_header Link "</favicon.ico?v=5d1117ac>; as=image; rel=preload";
```

And we can check that it actually works, but looking at browser Dev Tools or using `nghttp2` or looking at [http2.pro](https://http2.pro/check?url=https%3A//solovyov.net/).

Speed up of the gods. Too bad you can't push data from a different domain (understandably, but still) since I would force this slow Github API to load a little bit faster. :)
