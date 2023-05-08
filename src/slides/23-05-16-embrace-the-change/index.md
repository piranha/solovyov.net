class: center, middle

# Embrace the Change

.meta[<p>Alexander Solovyov</p>]

???

Hey everyone, today we're going to be talking about building change-resilient
systems.

---

# Change is the way

- World is ever-changing
- And businesses too!

???

Every business book or a course will tell you that the most important thing to
optimize for business is the speed of change it can sustain. If you can't adapt
to the world's changing needs faster than your competitors, compound interest of
that difference will crush the business in a few years.

---

# Main goal of the CTO

- Writing good code?
- Building great architecture?
- Making others do that? A.k.a. building a team?

???

It's surprising, but I now think that while building a team, growing your system
and nurturing good code is important, it's not the main goal of a good CTO. What
is it though? Listen on! :)

---

# How do I know?

- CTO @ kasta.ua for 8 years
- Full rewrite
- Two complete business model changes
- Total front-end turnaround

???

Kasta.ua is a leading fashion online marketplace in Ukraine and during my tenure
we changed so much it's hard to even start. We were not the biggest shop or
marketplace and so had to run fast to even survive and we did. Right now Kasta
has culture and abilities to change extremely swiftly, thanks to the our
efforts.

---

# Sources of change

- Hard to predict
- Technical
- People and processes

???

If you want to build something to last, you can't predict what's going to
change. Could be anything! The market can change, your perception of that market
can change, your assumptions about user behavior could be wrong, a war could
happen, like, anything!

We still can categorize concerts into technical and non-technical.

---

class: center, middle

# Technical

---

# Data

- Data is company's blood
- Data layout = life's quality

---

class: center, middle

<img src="img/4-mdp-bi.png">

???

Just a small example, let's imaging we have this as a part of our DB schema. I
don't think I have enough time to delve deep inside the logic of that schema -
it took me three weeks to understand what's going on here. So you'll have to
believe me what would simplification of that look like...

---

class: center, middle

<img src="img/5-sku.png">

???

It's just that! Just a product, variation and an item in a basket. Obviously a
schema like that can sustain much more damage: we transitioned from a flash sale
to a general merchandise, and then to a marketplace - and both those transitions
have changed company through and through, and our little schema grew with
us. And we've spent quite a bit of time keeping it simple. 

---

# Data

- Love your data
- Nurture its layout

???

Not always the change we've designed was the most efficient we could have
done. But it takes time to see the problem clearly and you don't always have
that time.

So what we did? Obviously - we fixed our problems. Sometimes it took years to
get layout into a satisfying state of simplicity and synchronize it clearly with
business needs, but that state was good as a launchpad for further changes.

---

# Architecture

- Keep it simple
- Complex solutions - slow to change

???

This one is obvious in my opinion, but skipping it is not an option. :-) When
all you have is a single process, changes are really easy. When you decided to
build that microservices architecture, suddenly all your processes become coded
into a distributed network and that stuff is really resistant to change.

---

# John Gall's law

> A **complex** system that works is invariably found to have **evolved** from a **simple** system that works.<br>
> The inverse proposition also appears to be true: A **complex** system designed **from scratch never works** and cannot be made to work.

???

So, John Gall said and everyone agrees that you can't create complex system from
scratch. I want to add that simplifying existing system before critical changes
could be much easier than changing complex system.

---

# Tools

- Programming language and runtime
- The way you code
  - Indirection makes change harder
  - Modularization makes it easier
- "Simple made easy" and "Design in Practice" (2023!) by Rich Hickey

???

Let's get into an imaginary situation. Suppose you want to migrate from
Elasticsearch to Vespa (from one data storage to another), and your
implementation is in Clojure on JVM. There are no bulk indexing like in ES, but
you can send documents over HTTP/2 and Vespa claims it's just as good. So you
take a little ThreadPoolExecutor and get multi-thread indexing work in an hour
for performance north of 1 thousand documents per second.

Or you are writing Ruby and you struggle for a week since GIL and Ruby's
performance and stuff and it's still around 100 documents per second. So you
write an indexing extension in Rust, controlled from Ruby.

What would be easier to change if a need arises? Poor performance impacts your
ability to build simple systems. It's not to say that your system will be easier
if it's built in Rust, but there is certainly a spectrum you can choose from.

Or let's take OOP. If you take Django and implement most of your logic in Model
methods, you're going to get big hairy ball of mud as your architecture, closely
tied to schema with limited ability to change.

God bless you if you're using inheritance instead of interfaces. Watch Rich
Hickey's talks "Simple made easy" and "Design in Practice".

---

# Backward Compatibility

- Hinders change
- Largely cultural
- Not binary
- Do not break without planning

???

I'm quite convinced that backward compatibility is utterly important. If people
are dependendent on results of your work, do not make them work more just
because a new name for a database column is better than previous name.

In times of change, however, coordinate to migrate to a new APIs, to a new data
layout, new data exchange patterns.

It's a fine balance between creating additional work without the necessity and
keeping your system simple, but you'll have to learn. And it's somewhat a
culture to learn breaking compatibility in a nice and controlled way.

---

class: middle, center

# People

---

# Why are you CTO?

- Leverage
- Impact
- Bringing ideas to life faster

## .center[That's all done by other people!]

---

# People are critical

- Grow and educate them
- Know them
- Fire wrong people

???

This one is also obvious, so I'm not going to dive in too much. But still, make
them feel appreciated - even if this means firing an underperformer. That one is
still mind-blowing to me, but firing wrong person can make a team twice as fast.

---

# Train with them to make changes

- Increase level of change step by step
- Grow until the team is not afraid of any changes
- Push them!

???

When I just started working at Kasta, the team there did not track db
migrations. The reason is simple - they never changed the database. And, among
other problems, password restore page wasn't working: regexp for that url
pattern was broken. So we started with fixes like that and implemented db
migration tracking, then progressed to fix db schema and long-standing issues
like overselling, and then in just a year we changed business model.

On one hand, you can't just woke up one morning and do big changes with an
inexperienced team. On the other, it's amazing how fast people are going to
learn if you push them.

And you should push them. Some are afraid of change, some hate being out of
comfort zone, there are various reason - but most people study faster and feel
more accomplished if you push them.

---

# So what's the main goal of the CTO

- The goal is to build a resilient system
- It's a team than can build fast with a quick resolve
- And a codebase which is complex enough to support business, but simple enough
  to absorb changes

---

class: middle, center

# Thanks!
