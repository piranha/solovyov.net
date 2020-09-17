(function(window) {
  var URL = 'https://script.google.com/a/solovyov.net/macros/s/AKfycbxJFBRQCoPw1WmbzrYwNBRV_P8LoQrwUl8lTBvVjw/exec';
  var selector = document.currentScript.dataset.selector || 'body';
  var root = document.querySelector(selector);

  function href() {
    return location.origin + location.pathname;
  }

  function format(s, data) {
    return s.replace(/\{([^\}]+)\}/g, function(match, k) {
      return data[k];
    });
  }


  /// SERIALIZE

  function nodeIndex(node) {
    var i = 0;
    while (node = node.previousSibling) {
      i++;
    }
    return i;
  }

  function serializePosition(node, offset) {
    var parts = [];
    while (node && node != root) {
      parts.push(nodeIndex(node));
      node = node.parentNode;
    }
    return parts.join('-') + ':' + offset;
  }

  function deserializePosition(pos) {
    var parts = pos.split(':');
    var indexes = parts[0].split('-'), i = indexes.length;
    var node = root;

    while (i--) {
      var index = parseInt(indexes[i], 10);
      if (index < node.childNodes.length) {
        node = node.childNodes[index];
      } else {
        console.warn("not enough child nodes", node, index, indexes);
        throw "Not enough nodes";
      }
    }
    return {node: node, offset: parseInt(parts[1], 10)};
  }

  function serializeRange(r) {
    return serializePosition(r.startContainer, r.startOffset) + ',' +
      serializePosition(r.endContainer, r.endOffset);
  }

  function deserializeRange(s) {
    var parts = s.split(',');
    var start = deserializePosition(parts[0]);
    var end = deserializePosition(parts[1]);
    var range = document.createRange();

    range.setStart(start.node, start.offset);
    range.setEnd(end.node, end.offset);

    return range;
  }

  function serializeSelection() {
    var sel = window.getSelection();
    var range = sel.getRangeAt(0);
    if (!range) return;

    return serializeRange(range);
  }

  /// EDITOR

  function getEditor() {
    var m = location.search.match(/\beditor=([^&]+)/);
    var editor = m && m[1];
    return editor;
  }

  function gatherData() {
    var s = serializeSelection();
    var text = window.getSelection().toString();
    var comment = prompt('Any comments?');

    return {selection: s,
            url: href(),
            text: text,
            comment: comment,
            author: getEditor(),
            timestamp: new Date()};
  }

  function storeComment() {
    var data = gatherData();
    fetch(URL, {method: 'POST',
                body: JSON.stringify(data)})
      .then((x) => {
        console.log(x);
        render(data);
      });
  }

  window.addEventListener('keydown', function(e) {
    if (e.keyCode == 13 && e.shiftKey) {
      storeComment();
    }
  });


  /// MASTER

  function createTooltip(parent, text) {
    el = document.createElement('div');
    el.className = 'tooltip';
    el.innerHTML = text;
    parent.appendChild(el);
    return el;
  }

  function permSelection(parent, rect) {
    el = document.createElement('div');
    el.className = 'permsel';
    el.style.top = (pageYOffset + rect.top) + 'px';
    el.style.left = (pageXOffset + rect.left) + 'px';
    el.style.height = rect.height + 'px';
    el.style.width = rect.width + 'px';
    parent.appendChild(el);
    return el;
  }

  function render(row) {
    var text = format('Auth: {author}<br>Orig: {text}<br>Said: <b>{comment}</b>', row);

    var range = deserializeRange(row.selection);
    window.getSelection().addRange(range);

    var rects = range.getClientRects();

    var el = document.createElement('div');
    document.body.appendChild(el);

    for (var i = 0; i < rects.length; i++) {
      var sel = permSelection(el, rects[i]);
      createTooltip(sel, text);
    }
  }

  function renderComments(rows) {
    var sel = window.getSelection();
    rows.forEach(render);
    sel.removeAllRanges();
  }

  function loadData(editor) {
    if (!editor) return;
    var query = new URLSearchParams({url: href()});
    if (editor != 'asolovyov') {
      query.set('author', editor);
    }

    fetch(URL + '?' + query.toString())
      .then(x => x.json())
      .then(x => x.rows && renderComments(x.rows));
  }

  loadData(getEditor());

})(window);
