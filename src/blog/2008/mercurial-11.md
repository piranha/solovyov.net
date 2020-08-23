title: Mercurial 1.1
date: 2008-12-02 22:37:42
tags: news, hg
alternate: <link rel="alternate" hreflang="ru" href="https://solovyov.net/blog/2008/mercurial-11/" /> <link rel="alternate" hreflang="en" href="https://solovyov.net/blog/2008/mercurial-11-en/" />
----


Вышел Меркуриал 1.1 со [списком изменений][1] на 2,5 страницы. :) Есть там и результаты моих усилий, и в общем фичи очень клёвые. Помимо графика дерева изменений в вебморде мне очень нравится `zeroconf` - после его включения `hg paths` в локальной сети показывает все запущенные `hg serve`. Очень удобно - не приходится спрашивать, смотреть и читать вслух айпишники. :)

Само собой, присутствует сделанный в Google SoC `rebase`, а также `bookmarks` - аналог бранчей из гита. К сожалению,  они пока работают только локально, но я думаю, что в 1.2 всё будет.

[1]: http://www.selenic.com/mercurial/wiki/index.cgi/WhatsNew#head-b1d1f9a535adb686d6e0a490e049261313f10d7d
