title: Alexander Solovyov
----

# Online presence

<div class="row">
  <div class="span8">
    <div class="icon">
      <a href="http://feeds.feedburner.com/AmazonByteflow">
        <img src="static/services/rss_32.png">
      </a>
    </div>
    <a href="blog/">Blog in Russian</a>
  </div>
  <div class="span4">
    <a class="readers" href="http://feeds.feedburner.com/AmazonByteflow">
      <img src="http://feeds.feedburner.com/~fc/AmazonByteflow">
    </a>
  </div>
</div>

<dl>
  <dt>
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
