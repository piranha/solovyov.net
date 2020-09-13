title: Higher-order functions
date: 2020-09-13
tags: programming
draft: true
----

[HOF](https://en.wikipedia.org/wiki/Higher-order_function) as a concept is quite simple: it's a function, which takes a function as an argument. Alternatively, it's a function, which returns new function. In both cases it's a higher-order function.

Is it useful? Massively! Most sequence-processing functions take a function as an argument: `map`, `filter`, `reduce`, whatever. And the concept works really well in this case.

There is another case, when you define a function, which returns a function. This could be a middleware in Clojure's Ring, or a Python decorator:

```py
def logall(func):
    def inner(*args, **kwargs):
        print(args, kwargs)
        return func(*args, **kwargs)
    return inner
```

In this case it also works well. There is a commonality between them: the protocol of defining such functions is strictly defined. In first case it's defined for an "argument" function, in second case it's for writing those HOFs. In both cases HOF is a glue between library and a business logic (library in a wider sense, could still be your application code).

But! When a HOF is used in a business logic among other functions, it's a bad thing. It's actually a code smell - if you see a HOF like this:

```clj
(defn es-filters-q [filter-gen arg2]
  {:agg (filter-gen arg2)})

(defn fg1 [x] {:x x})
(defn fg2 [y] {:y y})

(defn -main []
  [(es-filters-q fg1 :wow)
   (es-filters-q fg2 :naw)])
```

That's not good. It's a little hard to compress code in a little example, but idea is following: both `es-filters-q` and `filter-gen` contain business logic. Parametrizing your business logic with functions leads to extraneous openness and indirection, making it very hard to follow.

## Take away

One side of higher-order functions (either HOF itself or the function that is being passed) belongs to a library side. Using HOFs in a middle of business logic needlessly complicates it and is a code smell.