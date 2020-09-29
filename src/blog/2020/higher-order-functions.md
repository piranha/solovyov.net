title: Higher-order functions are like inheritance
slug: higher-order-functions
date: 2020-09-17
tags: programming
----

[HOF](https://en.wikipedia.org/wiki/Higher-order_function) as a concept is quite simple: it's a function which takes a function as an argument. Alternatively, it's a function which returns a new function. In both cases it's a higher-order function.

Is it useful? Massively! Most sequence-processing functions take a function as an argument: `map`, `filter`, `reduce`, whatever. And the concept works well in this case.

There is another case when you define a function which returns a function. This could be a middleware in Clojure's Ring or a Python decorator:

```py
def logall(func):
    @functools.wraps(func)
    def inner(*args, **kwargs):
        print(args, kwargs)
        return func(*args, **kwargs)
    return inner
```

In this case it also works well. There is a commonality between them: the protocol of defining such functions is strictly defined. In the first case it's defined for an "argument" function, in the second case it's for writing those HOFs. In both cases, HOF is a glue between a library and business logic (library in a wider sense, could still be your application code).

But! When a HOF is used in a business logic among other functions, it's a bad thing. If you see a HOF like this:

```clj
(defn es-filters-q [filter-gen arg2]
  {:agg (filter-gen arg2)})

(defn fg1 [x] {:x x})
(defn fg2 [y] {:y y})

(defn -main []
  [(es-filters-q fg1 :wow)
   (es-filters-q fg2 :naw)])
```

In this case reading `es-filters-q` makes little sense. You'll have to start jumping around and loading stuff into your head to find out whats going on rather than just reading line by line. Even experimenting with the code in REPL is hard, because usually code ends up structured in a way where `es-filters-q` makes a lot of setup before calling `filter-gen`, and recreating all that setup takes effort.

That is not good. It took a lot of time for me to formulate what I dislike about HOFs in code given that I wrote many decorators, middlewares, and use map&friends a lot without any hesitation or negativity, but I think that's it: parametrizing your business logic with functions leads to extraneous openness and indirection, making it very hard to follow.

## Take away

One side of higher-order functions (either HOF itself or the function that is being passed) should belong to a library. Using HOFs amidst business logic needlessly complicates the code. It's exactly like [inheritance](https://solovyov.net/blog/2020/inheritance/), makes your code hard to follow, hard to reason about, hard to debug, hard to experiment with. It's a useful and a powerful tool, but it should be used with restraint and understanding.