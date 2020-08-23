title: Translating in-browser applications
date: 2013-04-24
tags: i18n, javascript
favorite: true
alternate: <link rel="alternate" hreflang="ru" href="https://solovyov.net/blog/2013/i18n/" /> <link rel="alternate" hreflang="en" href="https://solovyov.net/blog/2013/i18n-en/" />
----

Earlier or later, if an application is not targeted on an English-speaking
market exclusively, you're going to work on localization. Such a moment happened
for us a few weeks ago: when there are no more excuses left and something
had to be done. :)

And I started seeking for a library, which I could use for translations. Main
requirements were jQuery-less-ness, GNU gettext compatibility, compact
implementation, support for pluralization, and overall ease of use.

I found some. Some had dependency on jQuery (you can't even calculate 2 + 3
nowadays without it), some haven't been updated for many years and I had a lot
of doubts about their workability, some had other issues. Closest to a winning
library is called [Jed](http://slexaxton.github.io/Jed/).

It's not bad, but I didn't like its size (more than a thousand lines), obscure
relationship with jQuery and lack of the infrastructure.

Obviously, I couldn't live with those outrageous problems and I had to write a
new library. It's called [puttext](https://github.com/piranha/puttext) and has
API which looks completely unlike gettext (I don't think anybody is worried
about that).

*Little digression*. Among the features of gettext I didn't implement domains
(it's easy to solve with separate files in my opinion) and contexts (I'm still
thinking about them). If you don't know what's that, there is no need to worry,
everything's fine. :)

## What's that

It's a small (version 1.0.1 is only 1713 bytes after UglifyJS), but very useful
(natural modesty makes it impossible to rephrase) library for translating static
text.

Main problems: which string to translate, how to change position of variables
inside of this string, and what to do with plural forms.

### Which string should be translated

That's simple:

```javascript
__('String to translate')
```

If you have a translation for a string, you will get it instead of this
string. If you don't have a translation, you will receive original string.

### What about variables in strings?

Nothing complex again, just some simple syntax for variable substitution:

```javascript
__('{name}, how are you?', {name: document.body.tagName})
```

If you want to output a curly bracket, escape it: `__('\\{ - works!')` - two
backslashes because substitution function needs two symbols - a backslash and a
curly bracket.

### How to handle plurals

When you have a string with a number inside, you might want to change it based
on an actual number given.

You have to have two strings in English (for singular and plural cases), a
number to choose between strings and a context for string formatting. Context is
not necessary, of course, if "one/many" string output is enough for you. :)

```javascript
__('one item left', '{num} items left', n, {num: n})
```

Of course, you have to think a bit about pluralization in other language. For
that gettext has a special header string `Plural-Forms` and GNU gettext
[documentation][1] has all possible cases.

[1]: http://www.gnu.org/software/gettext/manual/html_node/Plural-forms.html

## Infrastructure

### Extracting translatable strings

Having client library is good, but you have to have translations prepared
beforehand. Distribution contains `xgettext.js` for extracting strings from
JavaScript files. By default it looks for all strings which are wrapped in `__`
function call (e.g. `__('string')`). There is a possibility to change behavior
by supplying one or more wrapping function names:


```shell
$ ./xgettext.js -m __ -m env.__ path/to/source
```

`xgettext.js` exists because `xgettext` from GNU gettext distribution does not
support JavaScript syntax, and the most recommended one for the task - Python
syntax - often fails.

### Creating source translation file

`xgettext.js` attempts to avoid replication of functionality of GNU gettext
suite, and for full-fledged usage of gettext we have to prepare `.po` file with
a header:

```shell
$ echo '' | xgettext -C --force - -o -
```

This will output a draft for a `.po` file, where you have to change charset (to
`UTF-8`) and `Plural-Forms` to [what your target language needs][1].

### Moving forward

In addition there is a shell script `i18n-collect`, which automates string
extraction and merging new and translated strings. It's very simple and I think
that the best way is to copy it to your code and change if you need some
customization.

### Can I haz JSON

In the end, you have to compile `.po` to JSON to use it in a client-side
application. `po2json.js` is included, so it's not a problem:

```shell
$ ./po2json.js [path/to/lang.po] > [path/to/lang.json]
```

## Why do all this

Why bother with `.po` files and all this stuff, when it's possible to extract
strings from JS and write them in JSON, which then translators would edit?
Because in that case you would have to write merge logic and you won't have all
that delicious gettext infrastructure, like PoEdit, Emacs' `po-mode`, and other
editors. Being compatible with de-facto standard is simply convenient. Even if
you spend a bit of time once for configuration.

## What's next

Get the necessary files from [repository][puttext] or install `puttext` package
from NPM, add `puttext.js` to your application, mark all strings, generate
source `<lang>.po`, send it to translators (well, you could translate yourself,
if you know any other languages - it's useful to check if all strings are
marked), and then compile translated file to `.json`, which you can load
based on user settings.

The project has a README, which contains API description, but if that isn't
enough, ask questions here, or on Github, or mail me. Enjoy!

## Link one more time

Just in case you grasped idea from the beginning of this post and skipped rest,
**link to repository**: [puttext][].

[puttext]: https://github.com/piranha/puttext
