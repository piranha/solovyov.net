title: Inheritance considered harmful
date: 2020-05-10
tags: programming, python, clojure
----

Many years ago I was a Python developer. That is, the only language I knew well was Python. I had some perspective though - via Perl, Elisp, C# and bits of others. And it's not like I didn't see any problems, but I embraced Python by heart and accepted these problems as a payment for being able to enjoy its benefits. That's the way to live though! :)

### Pain-oriented coding

Some ten years ago I wrote [a library](https://github.com/piranha/nomad/) to handle db migrations. It was an automation of a process we had at a company I worked at the time. I wrote it in my evenings - it is not an example of code written in haste. I knew pretty well the use case, had an image of what I wanted in my head and nobody was behind my shoulder telling to speed up. It's an open source application written to be a good code. 

Three years ago I looked at one of the places and couldn't figure out where does `self.connection` come from:

```
class SAEngine(BaseEngine):
    def query(self, statement, *args, **kwargs):
        statement = self.prepare(statement, kwargs.pop('escape', False))
        try:
            return self.connection.execute(statement, *args, **kwargs)
        except exc.SQLAlchemyError as e:
            raise DBError(str(e))
```

There is nothing about `self.connection = ...` or anything in that class. Of course, I go to base class (which is in another file) and it says:

```
class BaseEngine:
    @property
    def connection(self):
        if not self._connection:
            self._connection = self.connect()
        return self._connection
```

Okaaaay... what's `self.connect` doing? Ah, it raises `NotImplementedError`. Makes sense, back to `SAEngine`:

```
class SAEngine(BaseEngine):
    def connect(self):
        return create_engine(self.url)
```

Of course, the library is small, so it took me few minutes to understand what's going on. But the problem is obvious: inheritance is something that makes your code hard to understand. Unlike function, which you can read just line by line, code with inheritance can play "go see another file" golf with you for a long time. I once spent few hours understanding Java client for memcached. I mean, it's memcached, there were nothing inherently hard about this code, it's just a pile of classes each inheriting previous, which made reading highly nonlinear and painful.

### Class-based lie

Take Django's class-based views. I remember participating in hot debates back when they were discussed for inclusion - and I am happy I left Django world behind me not long after so I did not have to suffer. But it is an example of an API you can't just see used: you have to read documentation so many times you'll remember what happens inside. In other case you just will not understand what is going on with code. It's even worse than that, documentation will not help you with small details and you'll have to read source code. But because that code is calling yours you can't just read it once and see it used. No, it'll actively coexist with your code, forcing you to read and study this code more and more times, until you just know that stuff inside out. Which is agaist the whole point of having a separate library!

If that was the only problem! Let's not forget that now your base class internal implementation is your API now. For every child class! Change something in the base class and risk whole codebase being derailed with bugs. 

In my opinion, object oriented programming is a lie. But other parts of it at the very least are not actively harmful. Inheritance is.

### Brave new world

What to do then? Well, I write in Clojure now and let me tell you that most of the time using functions is actually okay! If you're doing Python, try to use more NamedTuples, dataclasses and similar: this way you're developing with data and not with objects.

Also, ban multiple inheritance in codebase for good. Yes, it can save some time. No, it's never worth it, it'll return and bite your ass. Also, if you can, ban inheritance completely! Abstract base classes are okay though: those are interfaces and contain no code to be harmful. Programming against declared interfaces, despite being similar to inheritance, makes program more understandable. It's because you're having more of "same stuff" things (because they have similar API), which is easier for humans (and computer languages) to manage. And less of let me call this method from base class which calls another method which I just overriden and then another sorry I forgot what's the order again?

I think it can be declared that it's the inversion of control is what complicates understanding: it's the same for frameworks! Framework is by definition hard to understand without reading all the code (or documentation), since it calls in your code rather than you calling a library API. Same thing with inheritance. Inversion of control is bad because of one simple reason: it makes reading code non-linear. Ugh.
