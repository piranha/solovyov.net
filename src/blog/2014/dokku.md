title: Dokku
date: 2014-07-31
tags: linux
favorite: true
----

Недавно перевëз свой сервер на Digital Ocean, и заодно переехал с системы
настройки "сча поправлю конфиг и забуду навсегда" на
[Dokku](https://github.com/progrium/dokku).

Докку - это система деплоя, такой себе "Heroku для дома". У докку есть список
так называемых "билдпаков", которые описывают, как собирать тот или иной тип
приложений. Эти билдпаки есть для питона, руби, джавы, и т.п. Пушишь
гит-репозиторий с кодом в определëнное место (`dokku@yourhost:project.git`),
докку проходит по списку билдпаков и у каждого из них спрашивает - тебе
подходит? Кто первый согласился, тот и собирает.

Вся сборка происходит в LXC-контейнере с помощью Docker'а, и работает потом
приложение внутри Docker'a, что довольно приятно - система не засоряется разными
версиями библиотек и утилит, зависимости каждого приложения захламляют лишь его
образ.

Конечно, иногда это выходит оверкиллом - я сейчас именно так деплою этот блог, и
вместо того, чтоб лежать спокойно статическими файлами на диске, которые
сервятся с помощью nginx'a, они лежат в контейнере, в котором запущен еще один
nginx, на который главный всë проксирует. :) С другой стороны, я только что
посмотрел - он съел 2 мб RSS и 3 мб кэша, вполне себе недорого. :)

## Дебаг

Единственная штука - дебагать приложения немного тяжело. Поначалу особенно
совершенно непонятно, что происходит - один раз минут 40 потратил на то, что
приложение запускается нормально, в `dokku logs app` пишет `Listening port 5000`
и никаких ошибок нигде, а присоединиться к порту, на который его проксирует
докер, я не могу.

Сильно помог [nsenter](https://github.com/jpetazzo/nsenter), узнаëшь id
контейнера из `docker ps`, а потом:

```bash
nsenter --target $(docker inspect --format {{.State.Pid}} bddaf1804e59) --mount --uts --ipc --net --pid bash
```

и ты внутри контейнера с работающим приложением. Пока я не нашëл это
заклинание - страдал. А после того быстренько уловил, что просто приложение
слушает только 127.0.0.1, а надо 0.0.0.0. :)

## Закругляясь

В целом - удобно. Скажем, я тут внезапно провëл эксперимент и уничтожил свой
сервер. Ребилд и восстановление основных приложений заняли около получаса, и
вообще не пришлось ходить редактировать конфиги - только навесить нужные домены
на виртуалхосты (что делается через один из плагинов к докку).

С другой стороны, для серьëзного приложения я бы докку не использовал. Меня
очень беспокоит то, что сборка и запуск происходят в один момент в одном и том
же месте. Куда разумнее было бы собирать контейнер в одном месте, запускать на
него тесты, складывать уже готовый образ, а запуск иметь отдельным шагом и без
всяких инструментов для сборки.

Я еще попытался посмотреть на альтернативы, и нашëл:

- [dokku-alt](https://github.com/dokku-alt/dokku-alt), который больше умеет, но
что-то стало немного страшно возиться с еще более сложным проектом, который тоже
написан на bash'e.

- [octohost](http://octohost.io/), у которого немного отличается концепция - нет
никаких билдпаков, всë строится из Dockerfile'а руками. Получается, вроде и
гибче, и нет зависимости на то, что кто-то там в билдпаке сделал, но и думать
больше надо, и какое-то оно незаконченное немного, что ли. Ну и оно использует
Chef для того, чтоб себя установить и настроить, а я к нему серьëзную неприязнь
испытываю.

- [flynn](http://flynn.io/), оно типа в превью, и это посерьëзнее уже сервис, но
они, похоже, будут хотеть брать деньги за сервера (судя по [этой][1] страничке),
потому что всë как-то работает через их веб-интерфейс. Не уверен, что всë
правильно понял, но беспокоит. :)

[1]: http://monosnap.com/image/wJX1s4W7Srzv4id1nqARGLSeruBdZf

- [deis](http://deis.io/), который посерьëзнее, но и ресурсов требует
побольше. Они там строят систему, которая строит образы и потом запускает их на
сервере со свободными ресурсами, сама выбирает, где и как, и легко
масштабируется. За это надо платить (по крайней мере так написано в доке)
минимум 2 гб оперативки на каждом хосте плюс минимум 3 серверами чтоб это всë
как-то вменяемо работало. Мне стало лень возиться с этим всем, но потенциально
для больших деплойментов это всë интересно.

Так что остался пока на dokku. :)
