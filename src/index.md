title: Alexander Solovyov
----

## Online presence

<dl>
  <dt>
    <div class="icon">
      <a href="http://feeds.feedburner.com/AmazonByteflow">
      <img src="static/services/rss_32.png">
      </a>
    </div>
    <a class="readers" href="http://feeds.feedburner.com/AmazonByteflow">
      <img src="http://feeds.feedburner.com/~fc/AmazonByteflow">
    </a>
    <a href="blog/">Blog in Russian</a>
  </dt>
  <dd>
  {{ with .Site.Pages.Children "blog/" }}
  {{ with index . 0 }}
  Last entry: <a href="{{ .Url }}">{{ .Title }}</a>
  {{ end }}
  {{ end }}
  </dd>
</dl>
