addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})


async function getPost(url) {
  var res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Error ${res.status} getting post ${url}`, res);
  }
  var text = await res.text();
  try {
    var post = JSON.parse(text);
  } catch (e) {
    console.log('could not parse post json', text);
    throw e;
  }
  //post.status = 'draft';
  return post;
}


function sanitizeHtml(html) {
  return (html
          .replaceAll(/<ul>(.*?)<\/ul>/sg, (_, m) => {
            return (m
                    .replaceAll('<li>', " • ")
                    .replaceAll(/\n*<\/li>\n*/g, '\n'));
          })
          .replaceAll(/<ol>(.*?)<\/ol>/sg, (_, m) => {
            var i = 0;
            return (m
                    .replaceAll('<li>', () => { return i++ + '. '; })
                    .replaceAll(/\n*<\/li>\n*/g, '\n'));
          })
          .replaceAll(/<blockquote>\n*/g, '&gt; ')
          .replaceAll('</blockquote>', '\n')
          .replaceAll(/<p>\n*/g, '')
          .replaceAll('</p>', '\n')
          .replaceAll(/\n\n+/g, '\n\n')
         );
}


function makeTghtml(post) {
  var html = sanitizeHtml(post.html);
  if (post.title) {
    html = `<b>${post.title}</b>\n\n` + html;
  }
  if (post.feature_image) {
    html = `<a href="${post.feature_image}">&#8205;</a>` + html;
  }
  return html;
}


function getId(post) {
  var type = post.status == 'draft' ? 'draft' : 'pub';
  return MSGIDS.get(type + ':' + post.slug);
}


function saveId(post, id) {
  var type = post.status == 'draft' ? 'draft' : 'pub';
  return MSGIDS.put(type + ':' + post.slug, id);
}


async function makeTgreq(post) {
  var TGBASE = "https://api.telegram.org/bot" + TGTOKEN;

  var msgid = await getId(post);
  var html = makeTghtml(post);

  var draft = post.status == 'draft';
  var body = {chat_id: draft ? "-1001224071964" : "@bitethebyte",
              message_id: msgid,
              parse_mode: 'HTML',
              text: html,
              // only show preview when I've supplied an image
              disable_web_page_preview: !post.feature_image};
  var method = msgid ? '/editMessageText' : '/sendMessage';
  var url = TGBASE + method;

  return new Request(url, {
    method: 'POST',
    headers: {'accept': 'application/json',
              'content-type': 'application/json'},
    body: JSON.stringify(body)
  });
}


async function sendTelegram(post) {
  var tgreq = await makeTgreq(post);
  var res = await fetch(tgreq);
  var data = await res.json();
  console.log('telegram response', JSON.stringify(data));

  if (!data.ok) {
    return data;
  }

  await saveId(post, data.result.message_id);

  return data;
}


/// Github

async function ghreq(ghauth, method, url, body) {
  var res = await fetch(new Request('https://api.github.com' + url, {
    method: method,
    headers: {'User-Agent': 'Cloudflare Worker JS',
              'Accept': 'application/vnd.github.v3+json',
              'Authorization': ghauth},
    body: body && JSON.stringify(body)
  }));
  if (res.status != 200) {
    var text = await res.text();
    throw new Error('Github error: ' + text);
  }
  return await res.json();
}

async function notifyGithub(ghauth, post, msgid) {
  return await ghreq(ghauth, 'POST', '/repos/piranha/solovyov.net/dispatches', {
    event_type: "xapicms",
    client_payload: {url: post.url,
                     msgid: msgid,
                     draft: post.status == 'draft'}
  });
}


/// Main

async function handleRequest(request) {
  if (request.method != 'POST') {
    return new Response('Sorry but no', {
      status: 405,
      headers: {'content-type': 'text/plain'}
    });

    var url = new URL(request.url);
    var postUrl = url.searchParams.get('url');
  } else {
    var data = await request.json();
    var postUrl = data.client_payload.url;
  }

  var ghauth = request.headers.get('Authorization');
  var info = await ghreq(ghauth, 'GET', '/user');
  if (info.login != 'piranha') {
    return new Response('wow are you sneaky little bastard or what', {
      status: 400
    });
  }

  if (!postUrl) {
    return new Response('Supply url plz', {
      headers: {'content-type': 'text/plain'}
    });
  }

  var post = await getPost(postUrl);
  console.log('got post', JSON.stringify(post));
  var tg = await sendTelegram(post);

  if (!tg.ok) {
    return new Response(JSON.stringify(data, 2), {
      status: 500,
      headers: {'content-type': 'application/json; charset=utf-8'},
    })
  }

  //var res = await notifyGithub(ghauth, post, tg.result.message_id);

  return new Response(JSON.stringify(tg, 2), {
    headers: {'content-type': 'application/json; charset=utf-8'},
  })
}
