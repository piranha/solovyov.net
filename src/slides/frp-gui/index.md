class: center

# Написание реактивных UI на ClojureScript

.meta[Alexander Solovyov]

---

# Проблема

- Интерфейс - это тяжело
- Состояний много, условий много
- События / хендлеры

---

<!-- http://awelonblue.wordpress.com/2012/07/01/why-not-events/ -->

# А что не так с событиями?

- Это действие, а не результат
- Плохая компонуемость
- Тяжело противостоять ошибкам
- Состояние системы **очень** хрупкое
- Неявное состояние везде
- Приходится много планировать наперëд

---

# FRP

## Значения, изменяемые со временем

- Модель данных: формулы и зависимости
- Как в икселе
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

- <s>Типы</s>
- <s>Структуры данных</s>
- <s>Зависимости</s>
- <s>Неймспейсы</s>
- <s>Полиморфизм</s>
- <s>Типовые операции</s>

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
- Простой доступ в платформу
  - `(.toString (ClassName. arg1 arg2))`
- Короткий синтаксис для анонимных функций ;)
  - `#(fn % arg2)` -> `(map #(* % 2) (range 5))`

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

# Демка!

---

# Ссылки

- http://awelonblue.wordpress.com/2012/07/01/why-not-events/
- http://flapjax-lang.org/
- https://github.com/clojure/clojurescript
- https://github.com/emezeske/lein-cljsbuild
- https://github.com/tailrecursion/lein-hlisp
- https://github.com/tailrecursion/javelin
- https://solovyov.net/
