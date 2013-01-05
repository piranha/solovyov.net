title: Mercurial 1.4.1
date: 2009-12-02 09:47:32
tags: hg, news
----


Хочу похвастаться - вышел [Меркуриал 1.4.1][1], замечательный тем, что в него
включили моë расширение - [schemes][]. Это аналог алиасов, но только для
адресов. После его включения и добавления в `~/.hgrc` таких строчек:

    [schemes]
    p = ssh://piranha.org.ua/hg/

можно писать `hg push p://byteflow/` вместо полного адреса. В расширении уже
есть предопределëнные ссылки:

    py = http://hg.python.org/
    bb = https://bitbucket.org/
    bb+ssh = ssh://hg@bitbucket.org/
    gcode = https://{1}.googlecode.com/hg/

`{1}` в `gcode` означает, что первая часть урла (если считать их так:
`gcode://первая/вторая/етц/`) будет вставлена в начало адреса, а не в конец.

Остальные изменения - в основном мелкие фиксы для 1.4 (который, кстати, вышел
две недели назад).

[1]: http://mercurial.selenic.com/wiki/WhatsNew#A1.4.1_-_2009-12-01
[schemes]: http://mercurial.selenic.com/wiki/SchemesExtension
