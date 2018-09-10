class: center, middle
background-image: url(title-slide.png)

<br/>
# Как писать UI без боли

.meta[Alexander Solovyov, How Far Games]

---

class: center, middle

# НИКАК

# .transparent[А чего вы ожидали?]

---

# Надо бороться

- За увеличение связности
- За уменьшение связанности
- За простоту кода
- За гибкость мозга
- За светлое будущее

---

# Кто будет бороться

- React за связность и против связанности
- ClojureScript за простоту кода и тренировку мозга
- <s>Тëмное пиво</s>Человек за светлое будущее
- И модель данных тоже хочет о себе заявить

---

# React

- Полный перерендер, компоненты, етц
- FRP для бедных
  - Спасает от событий
  - И от случайной сложности
  - И от тормозов
- Не без вопросов

---

# Проблемы React'a

- Темплейты вместе с кодом

---

# Проблемы React'a

- <s>Темплейты вместе с кодом</s>
- Захватывает свой DOM-элемент полностью
  - Нас это не беспокоит
- Top-to-bottom часто не хватает
  - А это беспокоит!

---

# Модель данных

- POJO
- Backbone.Model
- Om, Cortex
- Полноценная БД?

---

# Требования к БД

- Скорость
- Соединения данных (joins)
- Язык запросов
- Ну и всякое прочее

---

# DataScript

```clojure
{:find  [?name ?tour-name]
 :in    [$ ?id]
 :where [[?id :name ?name]
         [?id :tournament-id ?tour-id]
         [?tour-id :name ?tour-name]]}
```

---

# Итак

- Представление - React
- БД - выдумали
- Человек - есть
- Интерфейс между ними?

---

# ClojureScript

- Простой
- Продуманный
- Семантически стройный

---

# Будет ли это всë работать вместе?

- Я не писал на этом за деньги :(
- Но использовал в команде :)

---

# WarMagnet

- 4 человека
- CLJS 877 loc, Clojure 515 loc, общего 111 loc
- React 430kb, WarMagnet 1.2mb
- Min: React 57kb (21kb gzip), WarMagnet 300kb (68kb gzip)
- Для сравнения, jQuery - 33kb gzip

---

# Ну и что, можно?

- Очень плотный код
- paredit сильно помогает
- К неизменяемость данных надо привыкать
- Обратно на JS - больно и обидно :(

---

# Ссылки

- http://facebook.github.io/react/
- https://github.com/swannodette/om/
- https://github.com/levand/quiescent/
- https://github.com/mquan/cortex/
- http://www.emacswiki.org/emacs/ParEdit
