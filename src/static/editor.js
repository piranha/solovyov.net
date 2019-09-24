(function(window, selector) {
    var URL = 'https://script.google.com/a/solovyov.net/macros/s/AKfycbxJFBRQCoPw1WmbzrYwNBRV_P8LoQrwUl8lTBvVjw/exec';
    var root = document.querySelector(selector);

    function href() {
        return location.origin + location.pathname;
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

    function deserializeSelection(s) {
        var sel = window.getSelection();
        var range = deserializeRange(s);

        //sel.removeAllRanges();
        sel.addRange(range);
    }


    /// EDITOR

    function gatherData() {
        var s = serializeSelection();
        var text = window.getSelection().toString();
        var comment = prompt('Any comments?');
        var m = location.search.match(/\beditor=([^&]+)/);
        var author = m && m[1];

        return {selection: s,
                url: href(),
                text: text,
                comment: comment,
                author: author,
                timestamp: new Date()};
    }

    function storeComment() {
        var data = gatherData();
        fetch(URL, {method: 'POST',
                    body: JSON.stringify(data)})
            .then((x) => console.log(x));
    }

    window.addEventListener('keydown', function(e) {
        if (e.keyCode == 13 && e.shiftKey) {
            storeComment();
        }
    });


    /// MASTER

    function createTooltip(text, top, left) {
        el = document.createElement('div');
        el.className = 'tooltip';
        el.style.top = top || '100px';
        el.style.left = left || '100px';
        el.innerHTML = text;
        document.body.appendChild(el);
        return el;
    }

    function permSelection(rect) {
        el = document.createElement('div');
        el.className = 'permsel';
        el.style.top = rect.top + 'px';
        el.style.left = rect.left + 'px';
        el.style.height = rect.height + 'px';
        el.style.width = rect.width + 'px';
        document.body.appendChild(el);
        return el;
    }

    function render(row) {
        var range = deserializeRange(row.selection);
        window.getSelection().addRange(range);

        var rects = range.getClientRects();
        for (rect of rects) {
            permSelection(rect);
        }
        var rect = rects[0];
        var text = 'Author: {author}<br>Comment: {comment}<br>Orig: {text}'.format(row);
        createTooltip(text, rect.top + 'px', rect.left + 'px');
    }

    function renderComments(rows) {
        var sel = window.getSelection();
        rows.forEach(render);
        sel.removeAllRanges();
    }

    function loadData() {
        fetch(URL + '?url=' + encodeURIComponent(href()))
            .then(x => x.json())
            .then(x => x.rows && renderComments(x.rows));
    }

    if (location.search.match(/\beditor=asolovyov\b/)) {
        loadData();
    }

})(window, 'article > section');
