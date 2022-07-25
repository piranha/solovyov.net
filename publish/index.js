addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})


/// Utils

function jsonres(data, status) {
  return new Response(JSON.stringify(data, 2), {
    status:  status || 200,
    headers: {'content-type': 'application/json; charset=utf-8'},
  })
}


/// Posts

async function getPost(url) {
  var res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Error ${res.status} getting post ${url}`);
  }
  var text = await res.text();
  try {
    var post = JSON.parse(text);
  } catch (e) {
    throw new Error('could not parse post json', {cause: e});
  }
  //post.status = 'draft';
  return post;
}


function sanitizeHtml(html) {
  var images = [...html.matchAll(/<img src="(.*?)"\/>/g)].map(m => m[1]);
  return [images,
          (html
           .replaceAll(/<figure>(.*?)<\/figure>\n*/g, "")
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
          )];
}


function makeTghtml(post) {
  var [images, html] = sanitizeHtml(post.html);
  var image = post.feature_image || images[0];
  if (post.title) {
    html = `<b>${post.title}</b>\n\n` + html;
  }
  if (image) {
    html = `<a href="${image}">&#8205;</a>` + html;
  }
  return html;
}


function getId(post) {
  var type = post.status == 'published' ? 'pub' : 'draft';
  return MSGIDS.get(type + ':' + post.uuid);
}


function saveId(post, id) {
  var type = post.status == 'published' ? 'pub' : 'draft';
  return MSGIDS.put(type + ':' + post.uuid, id);
}

function makeTgreq(url, body) {
  return new Request(url, {
    method: 'POST',
    headers: {'accept': 'application/json',
              'content-type': 'application/json'},
    body: JSON.stringify(body)
  });
}


async function buildTgreq(post) {
  var TGBASE = "https://api.telegram.org/bot" + TGTOKEN;

  var msgid = await getId(post);
  var html = makeTghtml(post);

  var draft = post.status != 'published';
  var body = {chat_id: draft ? "-1001224071964" : "@bitethebyte",
              message_id: msgid,
              parse_mode: 'HTML',
              text: html,
              // only show preview when I've supplied an image
              disable_web_page_preview: (!~html.indexOf('&#8205;') &&
                                         !~post.tags.indexOf('preview'))
             };
  var method = msgid ? '/editMessageText' : '/sendMessage';
  var url = TGBASE + method;

  return makeTgreq(url, body);
}


async function sendTelegram(post) {
  var tgreq = await buildTgreq(post);
  var res = await fetch(tgreq);
  var data = await res.json();
  console.log('telegram response', JSON.stringify(data));

  if (!data.ok) {
    return data;
  }

  await saveId(post, data.result.message_id);

  return data;
}

async function sendWarning(text) {
  var url = "https://api.telegram.org/bot" + TGTOKEN + "/sendMessage";
  var body = {chat_id: 1106338, text: text};
  var tgreq = makeTgreq(url, body);
  return await fetch(tgreq);
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
  if (res.status > 299) {
    var text = await res.text();
    throw new Error('Github error: ' + res.status + ' ' + text);
  }
  return await res.json();
}

async function notifyGithub(ghauth, postUrl, msgid) {
  return await ghreq(ghauth, 'POST', '/repos/piranha/solovyov.net/dispatches', {
    event_type: "xapicms",
    client_payload: {url: postUrl, msgid: msgid}
  });
}


/// Main

async function main(request) {
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
  if (!post.tags) {
    post.tags = [];
  }

  if (!~post.tags.indexOf('channel') &&
      !~post.tags.indexOf('blog')) {
    await sendWarning('This post is not for a blog or a channel: ' + postUrl);
  }

  var message_id;
  if (!!~post.tags.indexOf('channel')) {
    var tg = await sendTelegram(post);

    if (!tg.ok) {
      return jsonres({error: 'Could not send notification to Telegram',
                      data: tg},
                     500);
    }

    message_id = tg.result.message_id;
  }

  var res = await notifyGithub(ghauth, postUrl, message_id);
  return jsonres(tg);
}

async function handleRequest(request) {
  try {
    return await main(request);
  } catch(e) {
    console.error(e.message);
    return jsonres({error: e.message}, 500);
  }
}
