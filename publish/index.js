addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  console.log(request.method);
  if (request.method == 'POST') {
    var data = JSON.parse(request.data);
    var postUrl = data.client_payload.url;
  } else {
    var url = new URL(request.url);
    var postUrl = url.searchParams.get('url');
  }

  if (!postUrl) {
    return new Response('Supply url plz', {
      headers: {'content-type': 'text/plain'}
    });
  }

  return await sendTelegram(postUrl);
}


async function getPost(url) {
  var res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Error ${res.status} getting post ${url}`, res);
  }
  var post = await res.json();
  post.status = 'draft';
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


async function sendTelegram(url) {
  var post = await getPost(url);
  console.log('got post', JSON.stringify(post));

  var tgreq = await makeTgreq(post);
  var res = await fetch(tgreq);
  var data = await res.json();
  console.log('telegram response', JSON.stringify(data));

  if (!data.ok) {
    return new Response(JSON.stringify(data, 2), {
      status: 500,
      headers: {'content-type': 'application/json; charset=utf-8'},
    })
  }

  await saveId(post, data.result.message_id);

  return new Response(JSON.stringify(data, 2), {
    headers: {'content-type': 'application/json; charset=utf-8'},
  })
}

