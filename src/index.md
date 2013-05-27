title: Alexander Solovyov
----

## Online presence

<dl class="presence">
  <dt>
    <div class="icon">
      <a href="http://feeds.feedburner.com/AmazonByteflow">
        <img src="static/services/rss_32.png">
      </a>
    </div>
    <a class="right" href="http://feeds.feedburner.com/AmazonByteflow">
      <img src="http://feeds.feedburner.com/~fc/AmazonByteflow">
    </a>
    <a href="blog/">Blog in Russian</a>
  </dt>
  <dd>
  {{ with .Site.Pages.Children "blog/" }}
  Last entry:
    {{ template "date" .First.Date }}
    <a href="{{ $.Rel .First.Url }}">{{ .First.Title }}</a>
  {{ end }}
  </dd>

  <dt>
    <div class="icon">
      <a href="http://feeds.feedburner.com/BloggingSpree">
        <img src="static/services/rss_32.png">
      </a>
    </div>
    <a class="right" href="http://feeds.feedburner.com/BloggingSpree">
      <img src="http://feeds.feedburner.com/~fc/BloggingSpree">
    </a>
    <a href="en/">Blog in English</a>
  </dt>
  <dd>
  {{ with .Site.Pages.Children "en/" }}
  Last entry:
    {{ template "date" .First.Date }}
    <a href="{{ $.Rel .First.Url }}">{{ .First.Title }}</a>
  {{ end }}
  </dd>

  <dt>
    <div class="icon">
      <a href="http://twitter.com/asolovyov"><img src="static/services/twitter_32.png"></a>
    </div>
    <a class="right" href="http://twitter.com/asolovyov">
      <span id="twitter-readers">Determining</span> followers
    </a>
    <a href="http://twitter.com/asolovyov">Twitter</a>
  </dt>
  <dd>
    Last tweet: <span id="tweet">determining...</span>
  </dd>

  <dt>
    <div class="icon">
      <a href="photo/"><img src="static/services/flickr_32.png"></a>
    </div>
    <a class="right" id="flickr-photo" href="photo/"></a>
    <a href="photo/">My photos</a>
  </dt>
  <dd>It&apos;s nice to capture a moment occasionally.</dd>

  <dt>
    <div class="icon">
      <a href="http://www.linkedin.com/in/asolovyov"><img src="static/services/linkedin_32.png"></a>
    </div>
    <a href="http://www.linkedin.com/in/asolovyov">Linkedin page</a>
  </dt>
  <dd>Biggest social network of professionals.</dd>


  <dt>
    <div class="icon">
      <a href="http://piranha.github.io/slides/"><img src="static/services/email_32.png"></a>
    </div>
    <a href="http://piranha.github.io/slides/">Slides from my talks</a>
  </dt>
  <dd>So that they can be referenced.</dd>

</dl>

<br>

<h2>Projects
  <span class="note">
    (more at <a href="http://github.com/piranha/">GitHub</a>)
  </span>
</h2>

<dl class="presence">
  <dt><a href="http://github.com/piranha/keymage/">keymage</a></dt>
  <dd>Simple and small, but featureful enough JS keybinding library</dd>

  <dt><a href="http://github.com/piranha/goreplace/">goreplace</a></dt>
  <dd>grep/ack alternative with ability to replace (a-la sed) and support for
      .hgignore/.gitignore</dd>

  <dt><a href="http://github.com/piranha/gostatic/">gostatic</a></dt>
  <dd>Static site generator (engine of this site)</dd>

  <dt><a href="http://github.com/piranha/opster/">opster</a></dt>
  <dd>Dead simple (yet powerful) command line parser</dd>

  <dt><a href="project-root/">project-root</a></dt>
  <dd>Emacs project management tool</dd>

  <dt><a href="http://showkr.org/">Showkr</a></dt>
  <dd>Minimalistic viewer for Flickr</dd>

  <dt><a href="http://github.com/piranha/tnetstrings.js/">tnetstrings.js</a></dt>
  <dd>JS implementation of <a href="http://tnetstrings.org">tnetstrings</a></dd>

  <dt><a href="https://github.com/piranha/adium-inline-images">Adium Inline Images</a></dt>
  <dd>Show images inline in Adium</dd>
</dl>

<script type="text/javascript">
function renderTweet(amount) {
    var tmpl = '<time datetime="{iso}">{time}</time> ' +
        '<a href="http://twitter.com/asolovyov/status/{id}">{text}</a>';
    // note: amount accords to total amount of tweets, even those excluded,
    // that's why there is so much requested.
    amount = amount || 5;
    JSONP.get("http://api.twitter.com/1/statuses/user_timeline.json",
              {screen_name: "asolovyov", count: amount, trim_user: true,
               exclude_replies: true, include_rts: false},
              function (tweets) {
                  if (!tweets.length) {
                      return renderTweet(amount + 1);
                  }
                  var tweet = tweets[0];

                  var date = new Date(tweet.created_at);
                  var data = {iso: date.toISOString(),
                              time: date.format('{FullYear}, {MonthShort} {Date}'),
                              id: tweet.id_str,
                              text: tweet.text};
                  byId('tweet').innerHTML = tmpl.format(data);
              });
}

(function() {
    renderTweet();

    JSONP.get("http://api.twitter.com/1/users/show.json",
              {screen_name: "asolovyov"},
              function(info) {
                  byId('twitter-readers').innerHTML = info.followers_count;
              });

    JSONP.get("http://api.flickr.com/services/feeds/photos_public.gne",
              {id: "8226209@N04", format: "json"},
              function(feed) {
                  var photo = feed.items[0];
                  var el = byId('flickr-photo');
                  el.href = photo.link;
                  el.innerHTML = '<img style="height: 150px" src="{s}">'.format({
                      s: photo.media.m
                  });
              }, "jsoncallback");
})();
</script>
