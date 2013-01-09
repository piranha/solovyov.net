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
  Last entry: {{ template "post-date" .First }} {{ template "post-link" .First }}
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
  <dd>ololo
  {{ with .Site.Pages.Children "en/" }}
  {{/*
  Last entry: {{ template "post-date" .First }} {{ template "post-link" .First }}
  */}}
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
      <a href="http://www.last.fm/user/p1r4nh4"><img src="static/services/lastfm_32.png"></a>
    </div>
    <a href="http://www.last.fm/user/p1r4nh4">Last.fm profile</a>
  </dt>
  <dd id="lastfm-title">Do you like music? I certainly do!</dd>

  <dt>
    <div class="icon">
      <a href="http://www.linkedin.com/in/asolovyov"><img src="static/services/linkedin_32.png"></a>
    </div>
    <a href="http://www.linkedin.com/in/asolovyov">Linkedin page</a>
  </dt>
  <dd>Biggest social network of professionals.</dd>
</dl>

<br>

<h2>Projects
  <span class="note">
    (more at <a href="http://github.com/piranha/">GitHub</a>)
  </span>
</h2>

<dl class="presence">
  <dt><a href="http://github.com/piranha/keymage/">keymage</a></dt>
  <dd>Simple and small JS keybinding library</dd>

  <dt><a href="http://showkr.org/">Showkr</a></dt>
  <dd>Minimalistic viewer for Flickr</dd>

  <dt><a href="http://github.com/piranha/goreplace/">goreplace</a></dt>
  <dd>grep/ack alternative with ability to replace (a-la sed) and support for
      .hgignore/.gitignore</dd>

  <dt><a href="project-root/">project-root</a></dt>
  <dd>Emacs project management tool</dd>

  <dt><a href="http://github.com/piranha/opster/">opster</a></dt>
  <dd>Dead simple (yet powerful) command line parser</dd>

  <dt><a href="http://github.com/piranha/gostatic/">gostatic</a></dt>
  <dd>Static site generator (engine of this site)</dd>
</dl>

<script type="text/javascript">
function renderTweet(amount) {
    var tmpl = '<time datetime="{iso}">{time}</time> ' +
        '<a href="http://twitter.com/asolovyov/status/{id}">{text}</a>';
    // 2 because 1 often returns nothing
    amount = amount || 2;
    JSONP.get("http://api.twitter.com/1/statuses/user_timeline.json",
              {screen_name: "asolovyov", count: amount},
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

    JSONP.get("http://ws.audioscrobbler.com/2.0/",
              {method: "user.getRecentTracks", user: "p1r4nh4", limit: 1,
               api_key: "3ab11bf68138eac2ad58a101a91da500", format: "json"},
              function(response) {
                  var t, song = response.recenttracks.track;
                  if (song[0]) {
                      song = song[0];
                      t = 'Now playing';
                  } else {
                      t = song.date['#text'];
                  }

                  byId('lastfm-title').innerHTML = (
                      '<time>{t}</time> <a href="{u}">{a} - {n}</a>').format({
                          t: t,
                          a: song.artist['#text'],
                          n: song.name,
                          u: song.url
                      });
              });
})();
</script>
