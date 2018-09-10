class: middle
background-image: url(img/title-slide.png)

<style>
.ml-28 { margin-left: 29px; }
.left h1 { text-align: left; }
</style>

.ml-28.left[

<br>

# Make It Fast

.meta[<p>Alexander Solovyov<br>CTO @ Kasta</p>]

]
---

class: center, middle

# Сказ о том, как Kasta переживает пики нагрузок.<br>Кровь, кишки и распродажи.

---

# Black Friday 2015, 27 ноября

* Python/Django с кучей исправлений за 2015 год
* 19 тысяч онлайн в 16:00
* В 8 вечера кэш главной страницы показывал *"18 секунд до старта акций"*
* Чистка кэша уложила нас на 2.5 часа
* https://medium.com/engikasta/black-friday-1fa0959a4fbf

---

class: middle, center

## Мораль
# Если сервис медленный,<br>поменять это - сложно

---

# MK Day 2016, 1 августа

* SPA на Clojure/Script
* В проде с февраля 2016
* С мая - быстрый рост CPU load под нагрузкой

---

# clojure.cache

* A caching library implementing various cache strategies
* Локально в памяти (в `atom`'е)
* Супер-быстро, доступа по сети же нет

---

# Atom

* https://clojure.org/reference/atoms
* Way to manage shared, .invert[synchronous], independent state
* Another thread may have changed the value in the intervening time, it may have to .invert[retry], and does so .invert[in a spin loop]

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

---

# Спасти рядового MK Day

```commit
commit a98153222b2f17a7407521cabee455e4e084ad55
Author: Alexander Solovyov <alexander@solovyov.net>
Date:   Sun Jul 31 16:09:11 2016 +0300

    switch to memcache for caching products
```

---

class: middle, center

## Мораль
# Никто бы и не догадался,<br>если бы не thread dump

---

# Halloween 2017, 31 октября

* Потери пакетов в момент наплыва
* `main.js` еле грузится
* Переезд в новый DC?
* Очень высокий LA на балансировщиках?!

---

class: middle

# Случайно догадались

## В пик обычно нагрузка больше на спаде посещения, а тут была на росте

* Уходящие люди оформляют заказы. Оформление — тяжелая операция.
* При росте нагрузки смотрят популярные (первые) товары, а на спаде внимание размазано — и меньше попаданий в кэш.

---

# Почему

* LA на балансировщиках вырос 19 сентября
* 19 сентября опубликовали 4 уровень меню
* А у нас меню отдаётся всё за 1 раз
* 3 МБ JSON'а, привет!

---

# Как вылечились

* Понизили уровень сжатия gzip'а
* Который мы за пару месяцев до этого сами и подняли :-)
* А к BF в темпе вальса переделали API

---

class: middle, center

## Мораль
# Подстава может прийти<br>откуда не ждали

---

class: center

# March 2018

## Сменили модель данных

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

---

class: middle, center

## Мораль
# Explain полезен,<br>но реальность на 100% не предскажет

---

# July 17, 2018

Сообщения из телеграма:

* *00:30* мы лежим мёртвые с 12 ночи и пока непонятно почему
* *01:16* задеплоили версию недельной давности и оно кое-как живёт
* *02:31* нас DDoS'ят :-)

---

# July 17, 2018

* Слишком большая нагрузка на серверный рендеринг
* И ошибка в одном запросе в БД (поэтому не умирала старая версия)

---

.center.middle[<img src="img/grafana-1.png" style="width: 100%"/>]

---

# Что дальше

* Отправить в кэш мешает куча обстоятельств :-(
* Повторилось с утра
* Супер-секретная система обнаружения запросов от потенциального одного клиента
* Отключение серверного рендеринга для частых посетителей

---

.center.middle[<img src="img/grafana-2.png" style="width: 100%"/>]

---

class: middle, center

## Мораль
# Не хватало своих глупостей,<br>ещё кого-то принесло

---

# Kasta Day 2018, 1-2 августа

* Ежегодная проверка на вшивость перед сезоном
* `sku_price_current` разрослась и её обновление - тяжелое
* `future` зажёвывал ошибку и в memcache было пусто

<img src="img/grafana-3.png" style="width: 100%"/>

---

# Как починились

* Починили запись товаров в memcache
* Обновление matview раз в час

---

# Экстра-бонус

* На следующий день в 9:35 выпустили перманентный кэш товаров из БД: можно получить всю информацию по товару без JOIN'ов

<img src="img/grafana-4.png" style="width: 100%"/>

---

class: middle, center

## Мораль
# Поломать перформанс несложно,<br>но если это единичные изменения,<br>то с этим можно бороться

---

class: middle, center

## Заводят такие проблемы?
# We're hiring!

---

class: middle, center

# Вопросы?
