class: center

# Functional Reactive Programming & ClojureScript

.meta[Alexander Solovyov]

---

# Вводная

- Графические интерфейсы - это история про изменение состояния
  - ввод в текстовое поле
  - клик
  - асинхронный HTTP запрос

---

# Как всë обычно делается

- События
- Хендлеры
- Что-то произошло - обновили состояние

---

<!-- http://awelonblue.wordpress.com/2012/07/01/why-not-events/ -->

# Проблемы событий

- Это действие, а не результат
- Плохая компонуемость
- Неявное состояние везде
- Состояние системы **очень** хрупкое
- Тяжело противостоять ошибкам
- Приходится много планировать наперëд

---

# FRP

## Значения, изменяемые со временем

- Как в икселе
- Модель данных: формулы и зависимости
- Behavior *(Flapjax)*, Signal *(Bacon.js)*, Observable *(RxJS)*, Cell *(Javelin)*

---

# Зачем это нужно

- Легко компоновать
- Легко увидеть текущее состояние системы
- Нет зависимости от неудачного планирования

---

# Обычные вычисления

    var a = 0;
        b = a + 10;
    a = 10;
    console.log(b);
    // -> 10

---

# Реактивные вычисления

```javascript
var a = constantB(0);
var b = liftB(function(x) { return x + 10; },
              a);

a.set(10)
console.log(b.valueNow());
// -> 20
```

---

# Комбинирование

```javascript
var a = constantB(10),
    b = constantB(20),
    c = liftB(function (x, y) { return x + y },
              a, b);

console.log(c.valueNow());
// -> 30
```

---

# Но на самом деле это история о другом

![Летающий холодильник](Flying_Fridge_by_DanisMuffins.png?1)

---

# JavaScript?

- <s><span>Типы</span></s>
- <s><span>Структуры данных</span></s>
- <s><span>Зависимости</span></s>
- <s><span>Неймспейсы</span></s>
- <s><span>Полиморфизм</span></s>
- <s><span>Типовые операции</span></s>

---

# ClojureScript!

- Лиспо-образный
- Функциональный
- Неизменяемые структуры данных
- Маленький и строго определëнный
- Неймспейсы
- Leiningen

---

# Все знают Лисп, правда?

- `func(arg1, arg2)`
  - `(func arg1 arg2)`
- `obj.method(arg)`
  - `(.method obj arg)`
- `{key: "value"}`
  - `{:key "value"}`
- `if (a) { b } else { c }`
  - `(if a b c)`

---

# Ничего особенного
## Но очень, очень хорошо

- Синтаксис для структур данных
 - `(list)`, `[vector]`, `{:hash map}`, `#{set}`
- Короткий синтаксис для анонимных функций
  - `(map #(* % 2) (range 5))`
- Простой доступ в платформу
  - `(.toString (ClassName. arg1 arg2))`

---

# И теперь красота

```clojure
(def a (cell 0))
(def b (cell (+ a 10)))

(log @b) ;; -> 10
(swap! a inc)
(log @b) ;; -> 11
```

---

# Ну ок, а хтмл?

```clojure
(def form (cell {:name (input-cell "#name")
                 :password (input-cell "#password")
                 :submit (click-cell "#submit")})

(on form [:submit]
    #(log @cell))
```

---

# Ну й шо?

- А теперь можно брать и писать
- Про архитектуру я не успею рассказать
  - Ну там разделяйте на модули и всë такое
- Продолжение следует
  - Следите на https://solovyov.net/
    - (по теме там пока ничего нет)

---

# Ссылки

- http://awelonblue.wordpress.com/2012/07/01/why-not-events/
- http://flapjax-lang.org/
- https://github.com/clojure/clojurescript
- https://github.com/emezeske/lein-cljsbuild
- https://github.com/tailrecursion/javelin
- https://solovyov.net/
