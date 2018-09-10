class: center

# ClojureScript

.meta[Alexander Solovyov, kiev::fprog Sep 2012]

---

# Clojure

- Лиспо-образный
- Функциональный
- Многоплатформенный (JVM, .Net, Python, JS, ...)
- Конкурентное программирование

---

# Подслащенный лисп

- Синтаксис для структур данных:
  - `(list)`, `[vector]`, `{:hash map}`, `#{set}`
- Короткий синтаксис для лямбд
  - `(map #(mod % 2) (range 5))`
- Синтаксис для метаданных
  - `(def ^{:meta data} name)`
- Простой доступ в платформу
  - `(.toString (ClassName. arg1 arg2))`

---

# Еще сахара!

- Перегрузка арности
- Деструктуризация

```
((fn [{op :op arg1 :arg} [arg2 arg3]]
    (op arg1 arg2 arg3))
  {:op + :arg 1} [2 3])
```

---

# Разные скобочки

```lisp
(defun cut-line ()
  (let ((cutted-line (apply 'buffer-substring (whole-line))))
    (apply 'delete-region (whole-line))))
```

vs

```
(defn cut-line []
  (let [cutted-line (apply buffer-substring (whole-line))]
    (apply delete-region (whole-line))))
```

---

class: custom-with-image

# Неизменяемые коллекции

![Tree](purely_functional_tree_changed.svg)

- Новая копия при изменении
- Меняется только изменëнная часть
- Производительность сравнима с обычными

---

# Протоколы

- Динамический полиморфизм
  - А-ля интерфейсы, но можно расширять типы в рантайме
- Быстрые
- `defprotocol` - определяет протокол
- `defrecord` - новый тип данных
- `extend-record` - имплементирует протокол

---

# Средства для конкурентного программирования

- Clojure разделяет концепции состояния и имени
- Примитивы синхронизации (ссылки, агенты, атомы)
- Фьючерсы, pmap, promise, delay
- Akka/Okku (Erlang-подобные акторы)

---

# ClojureScript

- Подмножество (большое) Clojure
- Нет вычисления кода в run-time
- Нет Java-специфичных вещей
- Меньшее количество примитивов параллельного программирования
- Interop прекрасный!
- Основан на Google Closure

---

# Зачем

- Не просто Лисп
- Немутабельные структуры данных
- Маленький, разумный язык
- Надëжный
  - Property yourNiceMethod is undefined FTW!

---

# Чего хорошего

- Код на 100% совместим с Closure Compiler advanced mode
- В результате - неиспользуемый код выбрасывается
- Все типы данных Clojure (sequences, keywords, symbols, etc)
- Макросы!

---

# Победа над лапшой?

```javascript
new Google().init("map", function(map) {
    log("map initialized");
    map.setCity("Kyiv, Ukraine", function() {
        $("#search").bind("click", map.listener.bind(map));
    });
});
```

vs

```
(doasync
  map [maps/init (Google.) "map"]
  _ (log "map initialized")
  _ [maps/set-city map "Kiev, Ukraine"]
  _ (listen! (sel "#search") :click (maps/listener map)))
```

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

# Но оно ж новое

- Стабильное
- Используется в продакшене
- А шо делать?

---

# Минусы

- Дебаг
- Тяжеловесность окружения (JVM)
- Нет общепринятых приëмов хорошего поведения

---

### Чуть не забыл

# Light table

---

# Куда б еще посмотреть

- http://clojure.org/rationale (и сам http://clojure.org)
- https://github.com/clojure/clojurescript/wiki/Rationale
- http://alexott.net/ru/clojure/video.html
- http://4clojure.com/

# Zee end
# Qweschenz?
