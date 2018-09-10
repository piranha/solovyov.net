class: center, middle

# ClojureScript в реальной жизни

.meta[Alexander Solovyov, How Far Games]

.footer[kievfprog, Nov 2013]

---

# Предпосылки

- JavaScript - платформа будущего
- Clojure - офигенная
- Люди - не дураки (wishful thinking в действии)

---

# JavaScript

- Скорость браузеров
- Выбора нет
- Мода есть
- Всеохватность

---

# Clojure

- Этот Лисп продуман
- И не комитетом
- И набирает популярность

---

# ClojureScript

- Работает везде, где работает JS (везде)
- Чинит семантику JS
  - неизменяемые данные
  - безопасное расширение (протоколы)
  - хорошая система модулей
- Разумный размер результата (Closure Compiler advanced mode)

---

# Люди

## Их не нужно дрессировать полгода, чтобы они чему-то научились

---

# ClojureCup 28-29.09

- 29 часов подряд
- С перерывом на нормальный сон

---

# War Magnet

.center[![wm](http://warmagnet.com/static/logo/logo-400.png)]

---

.full[![screen](https://api.monosnap.com/image/download?id=eian7diLKLVlmfVIBLDoebwl5)]

---

# Стек

- PostgreSQL :P
- Clojure, HTTP-Kit, Korma
- ClojureScript, React, Pump
- Пицца, бургеры, лапша, радуга

---

.full[![rainbow](https://pbs.twimg.com/media/BVVrzK7IIAAN3KS.jpg:large)]

---

# React

- Инкапсуляция
- Скорость
- Удобство
- Концептуально красивый
- Хоть и не Hoplon

---

# Pump

Прямолинейная обëртка, лишь бы можно было использовать React без боли

```
(defr Component [{:keys [name]}]
  [:h1
   [:a {:href "/"} (str "Hello " name)]])
```

---

# ClojureScript

- Плотность
- Скорость
- Привычность

---

# Плотность

- 900 loc CLJS
- ~1500-3000 loc Coffee по прикидкам разных людей
  - Спекуляции спекуляциями, а компоненты сильно короче
- Через месяц код опять слишком плотный

---

# Скорость

- Оверхеда не заметили

---

# Привычность

- Поначалу слишком плотно
- Без paredit'а - тяжело редактировать
- Неизменяемость данных поначалу тяжело ложится на сознание
- Вход тем не менее был довольно быстрый
  - За полдня субботы все начали писать более-менее
  - Как из Ланоса в Мондео (назад - не очень)

---

# Размеры

- CLJS **877** loc, Clojure **515** loc, общего **111** loc

--
- React **430kb**, WarMagnet **1.2mb**

--
- Min: React **57kb** (**21kb** gzip), WarMagnet **300kb** (**68kb** gzip)

--
- Для сравнения, jQuery - **33kb** gzip

---

# Архитектура

- Event sourcing
- Append log событий
- Функция модификации состояния игры общая между клиентом и сервером


---

# Aftermath

- Paredit'а не хватает в остальных языках сильно
- Работать с данными в остальных языках неудобно
- От изменяемых данных побаливают зубы и чувство опасности не покидает

---

class: center, middle

# Что-то такое

---

# Ссылки

- http://github.com/piranha/pump/
- http://facebook.github.io/react/
- http://piranha.github.io/slides/
- https://github.com/tailrecursion/hoplon
