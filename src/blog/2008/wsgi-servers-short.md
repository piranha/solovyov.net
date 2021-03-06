title: WSGI серверы кратко
date: 2008-07-31 13:01:00
tags: wsgi, python, performance
----


За последние несколько дней обнаружилась (для меня) уйма интересных WSGI серверов. Я уже довольно давно использую (естественно, для Джанги) Apache mod_wsgi для продакшена и CherryPy'евский WSGI-сервер для разработки. Но недавно обнаруженный [fapws2][] заинтересовал меня и я наконец-то собрался его скомпилировать (основная загвоздка была в необходимости обновления libevent), потом моё внимание обратили на [cogen][], и вот сегодня уже - на [spawning][].

И я решил взять и погонять всех сразу apachebenchmark'ом. Тестировал просто - "ab -c 50 -n 500", ничего особенно не тюнинговал, тестирование на абсолютную объективность и точность не претендует. Всех конкурентов запускал так, чтоб они могли скушать оба ядра процессора (иначе это было бы не спортивно со стороны Spawning'а, который запускает несколько процессов и может использовать все ядра).

Итак, протестированные герои:

 - Apache2 mod_wsgi 2.0 daemon mode
 - Twisted
 - CherryPy
 - Spawning
 - Cogen
 - Fapws2

Каждый из них работает как веб-сервер для джанги с byteflow (в качестве БД использован дамп этого самого блога). Каждый запущен в двух экземплярах, сидит за nginx'ом, исключая Spawning, у которого запущено два процесса и сидит он сам.

[Вот][1] результаты. 

Лидеры - fapws2 и совсем немножечко медленее - cogen. На погрешность я бы не списывал, потому что два дня назад такая же ситуация была, и при каких условиях ни тестирую - fapws2 самую чуточку быстрее. Что характерно для лидеров - у них даже самые долгие запросы в 2 секунды укладываются, не то, что у других.

Аутсайдеры - CherryPy со своими 5,5 секундами на самом длинном запросе и Spawning, который так [хвалили][2], со своими 4 секундами на длинный запрос и 80 Мб скушанного ОЗУ - это против 32 у фапвса и 40 у когена!

Про Твистед и Апач можно сказать, что Твистед в принципе немного быстрее, но смысла никакого использовать всё равно нету. Если хочется скорости - есть fapws2 или cogen, если хочется огромного количества фич - есть Апач, который почти всегда есть... В общем, не вижу смысла.

Между cogen и fapws2 тоже можно выбрать: cogen написан на чистом питоне (он использует py-epoll), а fapws2, использующий libevent, имеет внутри кусок C, и потому его необходимо компилировать (к примеру, для винды это - чистейшее мучение, на винде я бы использовал коген). Но fapws2 явно несколько меньше ОЗУ хочет, что приятно в стеснённых условиях VPS, ну и немножечко, но быстрее. ;-)

Так что буду я, похоже, на fapws2 переползать. Тем более у моего VPS целых 4 ядра, зря пропадают с апачем только... :-)

[CherryPy]: http://www.cherrypy.org/wiki/WSGI
[fapws2]: http://william-os4y.livejournal.com/
[cogen]: http://code.google.com/p/cogen/
[spawning]: http://pypi.python.org/pypi/Spawning

[1]: http://dumpz.org/1789/
[2]: http://www.eflorenzano.com/blog/post/spawning-django/
