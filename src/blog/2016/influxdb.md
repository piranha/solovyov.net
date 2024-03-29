title: InfluxDB
date: 2016-03-01
tags: software, programming
----

Где-то в сентябре мне пришла в голову прекрасная мысль, что без хотя бы
относительно вменяемого мониторинга [приложения](https://modnakasta.ua) нам
вообще-то нельзя, и надо бы узнать, сколько запросов в секунду мы обрабатываем,
как долго это происходит, и что там люди чаще всего открывают.

Иначе говоря, черная пятница на носу, а инфы у нас, что же именно улучшать,
минимум. Посмотрел я в разные стороны, и обнаружил разные
[opentsdb](http://opentsdb.net/), [kairosdb](https://kairosdb.github.io/),
[druid](http://druid.io/), еще пару каких-то штук, и, очевидно, одну из самых
хайпофицированных баз последних лет - [influxdb](https://influxdata.com/).

У всех этих баз, что мне попались на глаза, был один серьезный минус - они
требовали серьезной такой инсталляции, кассандру как хранилище, несколько
процессов, и прочий геморрой. А я хотел вот прям сейчас и здесь - и инфлюкс
подходил как нельзя более кстати.

## Введение

Ну мы его и запустили, я написал миддлварь для приложения на джанге, и начали
туда логать данные. Вроде все нормально заработало, сделали релиз с миддлварью
внутри и меньше чем за минуту инфлюкс умер. Я посидел, почитал, и узнал, что
[Riemann](http://riemann.io/) не зря чуваки хвалили на PolyConf'е, взгромоздили
его рядом с инфлюксом, сказали джангам писать в него, написали в нем агрегации и
так оно и поехало. Раз в 500 событий или 1 секунду, что наступит раньше, риман
выгружал данные в инфлюкс.

Поставили графану, сделали пару каких-то графиков, начали их изучать и думать, и
тут пришла черная пятница. Трафика было как-то прилично, судя по инфлюксу, когда
забралось за ~1100-1200 запросов в секунду, инфлюкс умер. Я пошел посмотреть на
сервер, а он сожрал 56 гигабайт (из 64 доступных) оперативки, 800% процессора и
молчит.

Подтюнили риман, чтоб он пореже туда сгружал данные, перезапустили инфлюкс и
как-то оно поехало опять.

## Кульминация

И тут у нас последние несколько дней появилась часть на Clojure (я про неё
собираюсь отдельно еще написать). Которая точно так же пишет в риман, как
джанга. А в понедельник (вчера, то есть) была неплохая распродажа. Не черная
пятница, но LA в базе к 20 подполз, довольно серьезно все было. Но график
количества запросов в это новое приложение не превышал 4. Это прямо очень
настораживало, мягко говоря, тем более что это одна из самых активных страниц
сайта. И я задался целью сегодня решить эту проблему, потому что слепым себя
чувствовать прям совсем неприятно.

## Развязка

Сделал я себе на машине полный сетап, с приложением, риманом, инфлюксом и
приложением на синатре для дебага того, что шлет риман в инфлюкс:

```ruby
ruby -r sinatra -e "post('/write') { puts headers.inspect; puts request.body.read }"
```

Поначалу я обнаружил то, что я генерирую несколько событий в приложении, а в
инфлюкс попадает только одно.

Потом я обнаружил, что я их все наблюдаю в римане.

Потом я обнаружил, что я нигде время у события не ставлю, и его генерирует
риман - и в джанге я тоже не ставлю, но при этом времена для джанги - это double
c миллисекундами, а для кложуры - это просто int секунд. Я попытался повторить
то же самое с помощью `:time (/ (System/currentTimeMillis) 1000.0)`, но в
результате для кложуры приходили четкие секунды.

Потом [Кайл](https://aphyr.com/), автор римана, в IRC подтвердил, что риман
оперирует временем в секундах, так что мне непонятно, как джанга присылает свое
время с миллисекундами (которые попадают в инфлюкс) - может пайтоновский
protocol buffer менее строгий, чем джавный? Не знаю.

Потом я провел больше экспериментов и раскопок в продакшен данных от джанги и
убедился, что последняя запись по таймстемпу выигрывает, и поэтому у нас
теоретический максимум количества событий от джанги по одному контроллеру -
тысяча с одного сервера, потому что в инфлюксе время у записи уникальное в ее
серии, а серия складывается из названия и тегов, которые у меня - сервер и имя
контроллера.

А для clojure, в котором одна и та же функция исполнялась, максимум - 1 запрос в
секунду на сервер. Которых 4. Йуху, все понятно.

## Решение

Ну т.е. понятно, но как-то даже обидно. Но в теории инфлюкс умеет наносекунды,
что должно спасти! К сожалению, риман 0.2.10 в инфлюкс события засылает JSON'ом,
в котором время сериализовано в формат ISO, и наносекундами в нем не помашешь. К
счастью, в master'е римана клиент к инфлюксу уже все шлет
[line protocol'ом](https://docs.influxdata.com/influxdb/v0.9/write_protocols/line/),
в котором собственно основной формат - наносекунды.

Риман вообще суперкруто сделан, по-моему, и конфиг на кложуре - это прямо
фантастика. Я просто скопировал нужный код себе в конфиг, подправил пару
моментов (риман по дефолту
[сообщает](https://github.com/riemann/riemann/blob/master/src/riemann/influxdb.clj#L158)
`precision=s` инфлюксу, что меня не устраивало, конечно).

После этого я в события, уходящие из кложуры, добавил время в наносекундах:

```clj
:nanotime (+ (* (System/currentTimeMillis) 1000000)
             (mod (System/nanoTime) 1000000))
```

А после в римане начал его использовать:

```clj
(defn assoc-nanotime [event]
  (if (:nanotime event)
    (-> event
      (assoc :time (Long. (:nanotime event)))
      (dissoc :nanotime))
    (update-in event [:time] #(long (* % 1000000000)))))
```

Выходит, когда есть `:nanotime` - мы делаем вид, что это время, и кладем его в
виде инта туда (конвертация нужна, потому что все кастомные атрибуты протобафом
превращаются в строку). А если нет (событие из джанги) - то пытаемся времени
придать вид наносекунд.

Ну и все типа заработало, кроме одного прикольного момента:

```bash
> wrk -c 5 -d 5 http://mk.dev:8080/ | grep requests
  5585 requests in 5.02s, 273.90MB read

> influx -host 127.0.0.1 -database mk_dev -execute 'select count(value) from "clj.ui.time"' -format json | jq '.results[0].series[0].values[0][1]'
5007
```

Куда делось еще 500 запросов? Из римана все ушло (десяток-полтора дополнительных
запросов в апи, пока не закешировались, присутствует, доводя сумму до 5597):

```logs
INFO riemann.config - count 4
INFO riemann.config - count 968
INFO riemann.config - count 1271
INFO riemann.config - count 1124
INFO riemann.config - count 1253
INFO riemann.config - count 977
```

Я не знаю, пересеклись они там по наносекундам, или в чем еще вопрос, но
инфлюкс, который постоянно жрет 5-8 гигабайт оперативы и 100-200% процессора,
данные теряет только так. И по нескольким запускам он у меня теряет от 10% до
30%!

Самое смешное в этом что? То, что riemann написан на Clojure, гоняет тонны
мусора в JVM, жрет 2-4 Гб памяти и 3-7% процессора, и ни разу не заикнулся на
данных от приложения.

А InfluxDB написан на [Go](https://solovyov.net/blog/2014/when-to-use-go/).

## P.S.

Мне [написал](http://twitter.com/pauldix/status/704708483875106816) CTO
инфлюкса, Пол Дикс:

> @asolovyov it supports micro and nanosecond resolution. Just make sure no
> timestamps in the same series collide (otherwise last write wins)

Ну т.е. это design decision такой. Мне не нравится, правда, прям
совсем-совсем. Я тут думаю, что у джанги какое-то количество ивентов тоже ведь
теряется. :(

В общем, рекомендую инфлюкс как никогда! В смысле, никогда не рекомендовал, и
сейчас не рекомендую.

## 0.10.0

Сева мне говорит в процессе разбирания вопроса - так может столько гемора потому
что 0.9.6, а на дворе-то уже 0.10.1! А я прям так сразу и
[парировал](https://github.com/influxdata/influxdb/issues/5856), чувак 11
запросов в секунду логает и оно не работает, эхехе.

## Edit 07.01.2017

Надо честно признаться, что мы до сих пор живем с инфлюксом (уже 1.1), который
ускорился и уменьшил объемы БД на диске, но всё же с риманом, как с прослойкой,
который агрегирует события посекундно, прежде чем их отправить в инфлюкс.
