class: center, middle

# Make It Fast

.meta[<p>Alexander Solovyov<br>CTO @ Kasta</p>]

???

Привет, меня зовут Саня, и я вам сегодня расскажу несколько историй.

---

class: center, middle

# Сказ о том, как Kasta переживает пики нагрузок.<br>Кровь, кишки и распродажи.

???

У меня есть разные истории, которые я рассказываю за пивом друзьям, и, возможно,
и вам интересно будет. В отличии от обычных рассказов здесь будут цифры, которые
я честно скопировал из метрик, а не взял из головы. :-) 

А еще друзья у меня такие, какие есть, и постоянно перебивают, поэтому закончить
историю или рассказать мораль - очень тяжело. Зато у вас такой возможности не
будет! :-)

---

# Black Friday 2015, 27 ноября

* Python/Django с кучей исправлений за 2015 год
* 19 тысяч онлайн в 16:00
* Синхронизация времени - это боль
* В 8 вечера кэш главной страницы показывал *"18 секунд до старта акций"*
* Чистка кэша уложила нас на 2.5 часа
* https://medium.com/engikasta/black-friday-1fa0959a4fbf

???

Я пришёл в компанию в январе 2015 и большУю часть времени мы тратили на
перестройку архитектуры, так как сайт БФ14 не выдержал. Там было много
интересного, и я даже года три назад рассказывал, что там есть, но в целом - мы
капитально готовились. 

Людей пришло прилично, но сайт очень старался, пока наши переживания и желание,
в основном моё, еще что-нибудь ускорить, не привело к тому, что мы закешировали
главную до начала следующего часа. А разбежность времени на аппах и
балансировщиках привела к тому, что закешировалась на целый час страница
"осталось 18 секунд до старта".

Мы искали, где же эта разбежность, минут 20, и когда устранили - оказалось, что
перестарались с чисткой кэша. :'(

В нашем блоге по ссылке можно почитать историю поподробнее.

---

class: middle, center

## Мораль
# Если сервис медленный,<br>поменять это - сложно

???

А если медленный, переусложнённый и запутанный - то проще переписать.

---

# MK Day 2016, 1 августа

* SPA на Clojure/Script
* В проде с февраля 2016
* С мая - быстрый рост CPU load под нагрузкой

???

К MK Day у нас уже почти весь главный флоу, кроме чекаута, работал на
Clojure. Но, начиная с мая, когда мы перевели туда список товаров, появилась
странная тенденция - увеличение нагрузки процентов на 30 повышает загруженность
CPU раза в 2-3.

А MK Day для нас это фактически предвестник сезона и тренировка перед
осенью. Иначе говоря, оракул предсказывает болезненную смерть.

---

# clojure.cache

* A caching library implementing various cache strategies
* Локально в памяти (в `atom`'е)
* Супер-быстро, доступа по сети же нет

???

Для кэширования я, в качестве эксперимента, взял библиотеку на Clojure. Она
имплементирует разные стратегии кэширования поверх просто hash-map'ов, но сама
данные не хранит - их хранит каждый как может, в памяти процесса. Очень быстро
всё, конечно, я тестировал vs memcache и разница колоссальная - по сети-то
ходить не надо дополнительно.

Я для хранения взял атом.

---

# Atom

* https://clojure.org/reference/atoms
* Way to manage shared, .invert[synchronous], independent state
* Another thread may have changed the value in the intervening time, it may have to .invert[retry], and does so .invert[in a spin loop]

???

Атом это такой контейнер, откуда можно взять данные, и куда можно их
положить. Нормальный способ работы - дать атому функцию, которая поменяет его
данные.

Чтоб сохранить свои свойства, а именно синхронное изменение расшаренного между
тредами состояния, атом, если во время вызова этой функции данные поменялись,
пробует еще раз.

Как переводится "spin loop"?

---

background-image: url(img/facepalm.png)

# SPIN LOOP

```java
public Object swap(IFn f) {
* for (; ;) {
    Object v = this.deref();
    Object newv = f.invoke(v);
    if (this.compareAndSet(v, newv) {
*     return newv;
    }
  }
}
```

???

Бєсканєчний цикл :o

---

# Спасти рядового MK Day

```commit
commit a98153222b2f17a7407521cabee455e4e084ad55
Author: Alexander Solovyov <alexander@solovyov.net>
Date:   Sun Jul 31 16:09:11 2016 +0300

    switch to memcache for caching products
```

???

К вечеру воскресенья перед продажей внезапно полегчало. Мы прошли MK Day как каравелла
по зелёным волнам.

---

class: middle, center

## Мораль
# Никто бы и не догадался,<br>если бы не thread dump

???

В тред дампе все треды занимались обновлением кэша, очевидно. Кстати, новые
инструменты изучаются очень быстро, когда нужда припрёт.

---

# Halloween 2017, 31 октября

* Потери пакетов в момент наплыва
* `main.js` еле грузится
* Переезд в новый DC?
* Очень высокий LA на балансировщиках?!

???

Мы буквально перед хэллоуином в 17 году переехали в новый DC, и тут прям на
распродажу какой-то кошмар, как набегает народ - теряются пакеты,
джаваскриптовый бандл качается годы, и вообще полный ахтунг.

Мы, конечно, подняли панику и нам наш провайдер, спасибо ему, поднял лимиты на
канале повыше, но не помогло.

Почему мы глянули на график нагрузки на балансировщиках - не знаю, потому что
это место никогда нас не беспокоило. Но высокий Load 

---

class: middle

# Случайно догадались

## В пик обычно нагрузка больше на спаде посещения, а тут была на росте

* Уходящие люди оформляют заказы. Оформление — тяжелая операция.
* При росте нагрузки смотрят популярные (первые) товары, а на спаде внимание размазано — и меньше попаданий в кэш.

???

У нас есть очень четкий паттерн поведения. ... И то, что всё было иначе, и
большая нагрузка на балансировщиках заставили искать в неожиданных местах.

---

# Почему

* LA на балансировщиках вырос 19 сентября
* 19 сентября опубликовали 4 уровень меню
* А у нас меню отдаётся всё за 1 раз
* 3 МБ JSON'а, привет!

???

Я уже не помню, как мы определили, что тогда опубликовали меню, но оказалось,
что у нас АПИ отдаёт 3 Мб каждый вызов. И эти 3 Мб еще есть в каждом
отрендеренном на сервере хтмл, так как в каждом есть меню.

Но странность - канал это всё равно не забивает. Ну да, много данных, но это ж
не чёрная пятница, даже 2 гигабита не превысили.

Значит это...

---

# Как вылечились

* Понизили уровень сжатия gzip'а
* Который мы за пару месяцев до этого сами и подняли :-)
* А к BF в темпе вальса переделали API

???

За месяц до того великие комбинаторы решили, что раз мы пока не можем включить
клиентам бротли, то хотя бы больше будем жать гзипом. И увеличили степень
сжатия. 

Героическое уменьшение степени сжатия на хэллоуин позволило нам как-то дожить до
конца дня, а на БФ мы в темпе вальса и капитальной панике всё поменяли.

---

class: middle, center

## Мораль
# Подстава может прийти<br>откуда не ждали

???

Жизнь - она такая неожиданная

---

class: center

# March 2018

## Сменили модель данных

???

Само по себе не проблема, но тут нужно введение в курс дела

---

# Было

.center.middle[<img src="sku-old.png" style="height: 500px"/>]

---

# Стало

.center.middle[<img src="sku-price.png" style="height: 500px"/>]

---

# Результат

* Какая-то рядовая распродажа чуть не убила сайт нагрузкой
* sku_price оказался очень большой таблицей
* `CREATE MATERIALIZED VIEW sku_price_current`

???

Прям реально непонятная мне по сей день история, индексы на месте, всё как
обычно, один дополнительный джойн в запросе сделал нашу жизнь болью.

Когда проектировали и делали, вроде и головой думали, и эксплейны читали, но вот
как-то... Хорошо хоть матвью спас, не пришлось инфраструктуру достраивать. :-)

---

class: middle, center

## Мораль
# Explain полезен,<br>но реальность на 100% не предскажет

???

Человек предполагает, а постгрес располагает.

---

# July 17, 2018

Сообщения из телеграма:

* *00:30* мы лежим мёртвые с 12 ночи и пока непонятно почему
* *01:16* задеплоили версию недельной давности и оно кое-как живёт
* *02:31* нас DDoS'ят :-)

???

- в ночь с пн на вт знакомая в 00:20 написала "почему сайт не грузится"
- апп в логи выдавал огромное количество внутренних ошибок нетти, перед тем как
  замолкнуть
- деплой старой версии внезапно заставил его, хоть и не очень быстро, но
  работать
- после этого все успокоились и проснулись достаточно, чтоб начать
  интерпретировать показания в графане и проверять их достоверность

---

# July 17, 2018

* Слишком большая нагрузка на серверный рендеринг
* И ошибка в одном запросе в БД (поэтому не умирала старая версия)

???

- с большого количества айпишников запрашивали главную страницу
- в пятницу в одном из апи добавили новый запрос в базу мимо транзакции -
  простое чтение, до сих пор непонятно, почему это так повлияло

---

.center.middle[<img src="img/grafana-1.png" style="width: 100%"/>]

???

Нормальная нагрузка на серверный рендеринг - кол-во запросов в десятках в секунду

---

# Что дальше

* Отправить в кэш мешает куча обстоятельств :-(
* Повторилось с утра
* Супер-секретная система обнаружения запросов от потенциального одного клиента
* Отключение серверного рендеринга для частых посетителей

???

- удачно, что атакующий вернулся, пока мы про него еще не забыли
- отдаём ему нерендеренную страничку

---

.center.middle[<img src="img/grafana-2.png" style="width: 100%"/>]

---

class: middle, center

## Мораль
# Не хватало своих глупостей,<br>ещё кого-то принесло

???



---

# Kasta Day 2018, 1-2 августа

* Ежегодная проверка на вшивость перед сезоном
* `sku_price_current` разрослась и её обновление - тяжелое
* `future` зажёвывал ошибку и в memcache было пусто

<img src="img/grafana-3.png" style="width: 100%"/>

???

- MK Day в новой инкарнации
- помните ту матвью? её рефреш начал делать больно постгресу
- а еще в октябре мы поломали запись в кэш. Эт мы без кэша на товарах жили и в
  BF17 :-))

---

# Как починились

* Починили запись товаров в memcache
* Обновление matview раз в час

???

Помогло достаточно, чтоб дожить день

---

# Экстра-бонус

* На следующий день в 9:35 выпустили перманентный кэш товаров из БД: можно получить всю информацию по товару без JOIN'ов

<img src="img/grafana-4.png" style="width: 100%"/>

???

К этому моменту запись в ES привели в порядок, и её же реюзнули собранные данные
про товар ложить в перманентный кэш, пока всё в том же постгресе. 99 перцентиль
времени запроса упал в 3 раза.

---

class: middle, center

## Мораль
# Поломать перформанс несложно,<br>но если это единичные изменения,<br>то с этим можно бороться

???

Мораль на самом деле в том, что надо быть внимательным. Расслабишься и
твои же поделия на тебя нападают, никакого DDoS'а не надо, обычного маркетинга
хватит.

---

class: middle, center

## Заводят такие проблемы?
# We're hiring!

???

Там черная пятница опять надвигается, кто хочет поучаствовать?

---

class: middle, center

# Вопросы?

https://solovyov.net/slides/18-09-15-highload/