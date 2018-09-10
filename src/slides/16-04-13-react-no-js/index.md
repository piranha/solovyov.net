class: middle, center

# React on JVM

.meta[Александр Соловьëв, CTO modnaKasta]

---

# Предыстория

- Хотим приложение на React'е
- CLJS
- SEO - важно
- Рендеринг на сервере необходим

---

class: middle, center

## Как в лучших домах Парижа
# Node.JS

---

# Как жить

- HTTP-cервер
  - На вход - оригинальный запрос
  - На выходе - отрендеренная страничка
- Пул процессов Node.JS
- В случае перегрузки рисуем только ботам и мобильным

---

# Ну... Node.JS же

- Один тред
- Асинхронный I/O
- `binding` не работает
- Производительность на грани фантастики
  - 300 мс рендеринг
  - 300-600 Мб один процесс ноды

---

# Nashorn?

- Стартап в 10-50 раз медленнее
- 4Gb на мое приложение не хватило, пришлось давать 8
- Не может исполнить совершенно невинный JS (который еще и сгенерирован через CLJS!)

---

# Idea!

- Рассказал Allen Rohner на Clojure/Conj 2015
- В Clojure 1.7 появились cljc
- API, который по-разному компилируется в clj/cljs
- rum!

---

# Общий

```
(defn defc [name body]
  `(def ~name (build-class ~body))
```

---

# ClojureScript

```
(defn build-class [body]
   (js/React.createClass (body->react-obj body))
```

---

# Clojure

```
(defn build-class [body]
  (fn [props]
    (render body props)))
```

---

# views.cljc

```
(defc Header [name]
  [:h1 name])
```

---

# Плюсы

- Многопоточность, все в одном JVM
- В API можно ходить не по HTTP, а звать как функцию
- Нет гемора с кучей процессов
- Потребление памяти гораздо ниже

---

# Работает?

- https://modnakasta.ua/ уже 1,5 месяца
- Rum 0.7 - https://github.com/tonsky/rum
- Foam - https://github.com/arohner/foam для Om
