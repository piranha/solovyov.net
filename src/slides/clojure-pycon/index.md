class: center

![face](poker-face.jpg)

---

class: center

# Clojure

---

# Функциональный

- map, reduce, filter, partial...
- mapcat, reductions...
- juxt, complement, partition-by, group-by...
- ...

---

class: center

# Простой (vs сложный)

(не факт, что лëгкий :)

---

# Либеральный

- Лисп с разными скобочками
- Макросы
- +коммьюнити относительно консервативное

---

class: center

# Steve Yegge
# ОШИБСЯ

---

# Крутой

- Быстрые неизменяемые структуры данных
- Конкурентное программирование
- Многоплатформенный (JVM, .Net, Python, JS, ...)

---

# Подслащенный лисп

- Синтаксис для структур данных:
  - `(list)`, `[vector]`, `{:hash map}`, `#{set}`
- Короткий синтаксис для лямбд
  - `(map #(mod % 2) (range 5))`
- Деструктуризация (более продвинутые \*args, \**kwargs)

---

# Инфраструктура

- Namespaces
```
  (ns ^{:doc "Google Maps interface"}
    locations.google
    (:use-macros [locations.macros :only [doasync]])
    (:use [locations.utils :only [log]]
          [locations.map :only [Map locate]])
    (:require [clojure.browser.dom :as dom]
              [goog.net.Jsonp :as Jsonp]))
```

- Leiningen

---

# Немає часу, панове
## Капець

---

# Datomic

---

# Истчо

- clojure-doc.org - туториалы
- clojuredocs.org - референс
- 4clojure.org - упражнения

# Гудлак!
