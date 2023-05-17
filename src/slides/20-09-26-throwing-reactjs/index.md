class: center, middle
background-image: url(title.jpg)
title: Выкидываем ReactJS
description: Все знают, что много джаваскрипта - это плохо. Но как быть, когда сайт большой, и не хочется через несколько лет упереться в стандартную проблему jQuery (и других библиотек того же поколения) - постоянные конфликты композиции? Послушайте о том, куда решились спрыгнуть в Kasta, и что в результате получилось.

<!--body
<script src="https://cdn.jsdelivr.net/npm/xhr-mock@2.5.1/dist/xhr-mock.js"></script>
<script src="https://twinspark.js.org/static/twinspark.js"></script>

<script>
  setTimeout(function() { twinspark.activate(document.body) }, 100);
  XHRMock.setup();
  var clicks = 0;
  XHRMock.get("/tuda", function(req, res) {
    clicks++;
    var ret = res.status(200).body('<span>Click #' + clicks + '</span>');
    return new Promise(resolve => setTimeout(() => resolve(ret), 1300));
  });
</script>

  <style>
    @keyframes border {
      0%   {left: 0;}
      51%  {left: 85%;}
      100% {left: 0;}
    }

    .indicator.ts-active {
      pointer-events: none;
      position: relative;
    }
    .indicator.ts-active::after{
      animation: border 1.5s infinite linear;
      position: absolute;
      width: 15%;
      height: 10px;
      bottom: -2px;
      left: 0;
      background: #807fe2;
      z-index: 1;
      content: "";
    }

    button.indicator { 
    appearance: none;
    background: #fff;
    border: .05rem solid #5755d9;
    border-radius: .1rem;
    color: #5755d9;
    cursor: pointer;
    display: inline-block;
    font-size: 1.5rem;
    height: 3rem;
    line-height: 1.8rem;
    outline: 0;
    padding: .35rem .6rem;
    text-align: center;
    text-decoration: none;
    transition: background .2s,border .2s,box-shadow .2s,color .2s;
    user-select: none;
    vertical-align: middle;
    white-space: nowrap;
    }
  </style>
-->

???

- Кто я
- Зачем вообще реакт (и предшественники)
- Как начали юзать реакт в касте
- Google Pagespeed, история про эйр
- Intercooler - идея, суть происходящего
- Трейдоффы
- Твинспарк
- результат
- hn?
- htmx, unpoly
- варианты развития
- live view

---

# Кто здесь

- CTO Kasta.ua
- Начал использовать ReactJS в июне 2013
- Выступал о нём N раз

---

# Предыстория

- 2002: ненавязчивый (unobtrusive) JS
- 2004: Dojo, Prototype, Gmail + Google Closure
- 2005+: Prototype, jQuery
- 2010+: Knockout.js, BackboneJS, AngularJS
- FRP, Flapjax, Hoplon

---

# Зачем React

- Приемлемая скорость
- Связность (cohesion) лучше
- Связанность (coupling) ниже
- Локальность поведения в коде
- Вид - функция от состояния

---

# Kasta 2015

- Было: Django + jQuery
- Стало: Clojure + CLJS + React
- Зачем?

---

# Результат

- Глобальный стор, с подписками на данные в компонентах
- Загрузка данных триггерится на маунте компонентов
- Один код исполняется в браузере и на JVM (никаких Node.js)
- Работающий live reload 

---

class: center

# Oops

<img width="821" src="fail.png">

---

# Как же так

- .min.js - 2.5MB
- Если делить на модули, базовый модуль ~1.5MB
- Время загрузки Реакта на старых устройствах :(

---

# Неожиданное

- Логика отображения переползает в Реакт (вместо CSS)
- Сложная логика переползает на клиент с сервера (и потом надо повторять в аппах)
- Высокие требования к дисциплине и самоконтролю разработчика

---

# Intercooler.js

- Рендеринг только на сервере **(революция!)**
- Атрибуты элементов указывают, что обновлять *(bye-bye unobtrusive JS!)*
- Локальность кода ± окей
- Легко (!) перейти с текущей модели рендеринга

---

# Intercooler.js

## AJAX With Attributes

```
<!-- This anchor tag posts to '/click' when it is clicked -->
<a ic-post-to="/click">
  Click Me!
</a>
```

<a href="https://intercoolerjs.org/" target="_blank">intercoolerjs.org</a>

---

# Проблемы?

- Вид больше **не** функция от состояния :(
- Очень сложные интерфейсы делать очень сложно (*#давайпока*)
- Привычки фронтендщикам приходится менять :)
- Дебажить иначе?
- jQuery
- Наследование атрибутов
- Отсутствие расширяемости

---

# TwinSpark

- Без jQuery (и поддержки IE)
- Без наследования
- Легко добавлять новые атрибуты
- **700** строк кода
- **11KB** .min.js
- За 4 месяца переделали каталог

---

class: center

# Демо

```html
<button class="indicator" 
        ts-req="/tuda" 
        ts-swap="inner">
  Just click me
</button>
```

<p>
  <button class="indicator" ts-req="/tuda" ts-swap="inner">Just click me</button>
</p>


---

class: center

# Результат

<img width="821" src="success.jpg">

---

# Ещё результаты

- HTML страница уменьшилась в 2,5 раза
- JS уменьшился в 80 раз
- Столько срача не генерировал с 2013 года
- На Hacker News какой-то чел сказал, что the author comes off as fairly junior
- На старых компах и андроидах глазами видно, насколько всё быстрее
- Понемногу переделываем остальные страницы

---

# Как выглядит

```
[:div {:class     "product-preview"
       :on-click  #(popup/open ProductPreview product campaign)
       :ts-req    (routing/url "/ssr/product/preview" 
                    {:product-key (:product/key product)
                     :campaign-id (:campaign/id campaign)})
       :ts-target "#popup-container"
       :ts-swap   "append"}]
```

---

# А что с API?

- React заставляет сделать API, подходящий для аппов
- Всё на месте, компоненты ходят в API даже сейчас

---

# Альтернативы

- Unpoly - CoffeeScript с классами и кучей фич
- HTMx - продолжение Intercooler.js, на месяц младше TwinSpark'а (с наследованием атрибутов >_<)
- Live View из Elixir/Phoenix, с состоянием на сервере

---

# Ссылки

* https://solovyov.net/
* https://kasta-ua.github.io/twinspark-js/
* https://htmx.org/
* https://intercoolerjs.org/
* https://dockyard.com/blog/2018/12/12/phoenix-liveview-interactive-real-time-apps-no-need-to-write-javascript

# Вопросы
