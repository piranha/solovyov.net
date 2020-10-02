title: Go Replace!
date: 2013-05-21
tags: programming, go
favorite: true
alternate: <link rel="alternate" hreflang="ru" href="https://solovyov.net/blog/2013/goreplace/" /> <link rel="alternate" hreflang="en" href="https://solovyov.net/blog/2013/goreplace-en/" />
----

Как-то раз два с лишним года назад я решил посмотреть на [Go][], поизучать, как
это - писать на нëм программы, и насколько хороший выходит результат. Идея для
первой программы родилась легко - так как мой любимый Python тормозит на
запуске, я решил переписать [sr][], который я постоянно юзал, на Go.

Так родился [Go Replace][] (надо было рассказать про него еще два года назад,
впрочем). Очевидно, поиск по файлам - давно решëнная проблема, find + grep, или
grep сам по себе, или [ack][], или, вот, [the_silver_searcher][], но никто из
них не умеет заменять. Замена - это всегда раздражающее переписывание командной
строки на find + sed или xargs + sed. А `gr` (короткое название, которое я
выбрал для того, чтоб не сильно много писать) умеет, и в этом весь фокус:

    # сейчас мы тут ищем
    $ gr what-is-it
    # а тут заменяем
    $ gr what-is-it -r here-you-go

Всего лишь нажать вверх и дописать то, на что хочется заменить.

Так вот, писать на Go легко, программы работают быстро и прекрасно. При прочих
равных `gr` может раза в полтора медленнее grep'а на обычных задачах. Go Replace
при этом умеет пропускать файлы по паттернам из `.hgignore` и `.gitignore`, а
так же бинарные - поэтому обычно он ищет заметно быстрее. :) Плюс синтаксис
регекспов нормальный, а не POSIX'овый из grep/sed.

Плюс его не нужно компилировать!
[Качайте](https://github.com/piranha/goreplace/releases) и пользуйтесь. Это
простой бинарник, у которого нет никаких зависимостей ни на что.

[Go]: http://golang.org/
[sr]: https://bitbucket.org/lorien/sr
[Go Replace]: https://github.com/piranha/goreplace
[ack]: http://beyondgrep.com/
[the_silver_searcher]: https://github.com/ggreer/the_silver_searcher
