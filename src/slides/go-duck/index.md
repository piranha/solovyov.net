<!--
Why would I tell you about some other programming language other than Python on
a conference which is dedicated to Python? Because I believe Python programmer
can benefit from knowing Go since in my opinion it is quite close to Python in
important areas while having interesting properties in others. Just give me a
bit of time and I'll try to show you how Go can be interesting for you.
-->

.center
# Go
## static duck typing
### and more...

.meta[Alexander Solovyov, PyGrunn 2012]

---

<!--
-->

# Go

* Announced on November 2009
  - Go 1 was released on 28 March 2012
* Ken Thompson, Rob Pike
  - C, Unix, Plan 9, etc
* Conservative, pragmatic

---

<!--

I really like Python's syntax so it's not a surprise I don't like curly
braces. I learned to tolerate them though.

It's imperative, which on one hand means it's easy to understand for us Python
programmers, but on another means they did not put all the nice functional stuff
there a-la map, filter and reduce.

Static typing... well, what can I say, dynamically typed languages are still
much slower.

In overall, when Go team tries to innovate somewhere, they do not do that in
hurry. They consider options and take their time.

-->

# Conservative

* `{` braces `}`
* imperative
* static typing
* "unhurried" innovativity

---

<!--

Fast compilation is actually an interesting property - it gives you ability to
write scripts in Go. In fact compilation is fast enough to have 'compile-on-run'
programs in Go finish faster than their Python counterparts.

We will get soon to type system and concurrency, standard library is smaller
than Python's but still is quite extensive - I couldn't remember from my head
what I use in Python to be not present in Go's standard library.

Encodings can be painful topic, but here it's taken care of. After all, Ken
Thompson and Rob Pike are authors of UTF-8, and Go has excellent unicode
support.

-->

# Pragmatic

* fast compilation
* garbage collection
* convenient type system
* concurrency primitives
* extensive standard library
* UTF-8

---

<!--

Here we declare an interface and a function which accepts object implementing
this interface. This can be a bit familiar.

-->

# Typing system

    type Printable interface {
        String() string
    }

    func Print(x Printable) {
        println(x.String())
    }

---

# Typing system (error)

<!--

Obvious error: we haven't done anything here to have Page behave as Printable.

cannot use page (type *Page) as type Printable in function argument:
*Page does not implement Printable (missing String method)

So what do we do then? We are not going to declare implementation of interface
or whatever, we are just going to implement it.

-->

    type Page struct {
        Text string
    }

    func main() {
        page := &Page{"test"}
        // Type error
        Print(page)
    }

---

# Typing system (fixed)

<!--

This way it works. Our Page has a String method and this is the only thing
Printable declared. Which means our Page conforms to Printable and can be used
as one.

Typing system checks actual interface implementation, not a
declaration. Practically Python's duck typing.

That's all for basic typing - there is a bit more, but this was the main part of
how Go works.

-->

    type Page struct {
        Text string
    }

    func (page *Page) String() string {
        return page.Text
    }

    func main() {
        page := &Page{"test"}
        Print(page)
    }

---

<!--

Implementation of function is irrelevant, but in function `main` we can see two
main concurrency primitives in go - channel and goroutine.

Goroutine is essentially a green thread or coroutine - any function with
prepended word 'go' is started concurrently to your current execution context.

Channel is an object for communication between goroutines.

Here you see how we create a channel of integers

-->

# Concurrency

    func fib(n int) int {
        // ...
        return result
    }

    func main() {
        ch := make(chan int)
        go func() {
            ch <-fib(5)
        }
        println(<- ch)
    }

---

# More!

    func main() {
        ch := make(chan int)
        for i := 1; i <= 10; i++ {
            go func(n int) {
                ch <-fib(n)
            }(i)
        }

        for i := 1; i <= 10; i++ {
            println(<-ch)
        }
    }

---

# Handling errors

    func main() {
        f, err := os.Open("path")
        if err != nil {
            log.Fatal(err)
        }
        defer f.Close()
        ...
    }

---

# HTTP daemon, Python

    .python
    class Responder(web.RequestHandler):
        def get(self):
            name = self.get_argument('id')
            try:
                with file(os.path.join(DIR, name)) as f:
                    content = f.read()
                    data = {"content": content}
            except IOError:
                data = {"error": "data not found"}
            self.write(json.dumps(data))

    app = web.Application([(r'/', Responder)])
    app.listen(8080, 'localhost')
    ioloop.IOLoop.instance().start()

---

# HTTP daemon, Go

    .small
    func getContent(name string) map[string]string {
        data, err := ioutil.ReadFile(filepath.Join(DIR, name))
        if err == nil {
            return map[string]string{"content": string(data)}
        }
        return map[string]string{"error": "data not found"}
    }

    func Responder(w http.ResponseWriter, req *http.Request) {
        name := req.FormValue("id")
        data, _ := json.Marshal(getContent(name))
        w.Write(data)
    }

    func main() {
        http.HandleFunc("/", Responder)
        http.ListenAndServe(":8081", nil)
    }

---

# Unscientific benchmark

httperf, 100 clients, 1000 requests each

 - Python: 1900 req/s, 11 MB
 - PyPy: 3600 req/s, 70 MB
 - Go: 6100 req/s, 4 MB

---

# Imports

    import (
        "fmt"
        "os"
        "github.com/droundy/goopt"
    )

Supports Github, Bitbucket, Google Code, Launchpad

---

# "go" tool

 - go build
 - go install
 - go get
 - go fmt
 - etc

---

# Cross-compilation

    .shell
    $ GOOS=windows GOARCH=amd64 go build $PKG

---

# Problems

 - Leaks on 32-bit systems
 - GC far from being perfect
 - Hard to search for
   - Use 'go lang' as search query

---

# Questions?

.center
![Gopher](http://golang.org/doc/gopher/frontpage.png)

[http://golang.org/](http://golang.org/)
