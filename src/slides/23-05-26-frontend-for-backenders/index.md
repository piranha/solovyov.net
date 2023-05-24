class: center, middle, full-width, invert
background-image: url("https://images.unsplash.com/photo-1560964645-5296b5099677?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80")

<!--body
<script src="https://cdn.jsdelivr.net/npm/xhr-mock@2.5.1/dist/xhr-mock.js"></script>
<script src="https://twinspark.js.org/static/twinspark.js"></script>
<script>
  XHRMock.setup();
  window.addEventListener('remark-init', () => {
    twinspark.activate(document.body);
    for (var script of document.querySelectorAll('.remark-slide-container script')) {
      let el = document.createElement('script');
      el.appendChild(document.createTextNode(script.innerHTML))
      script.replaceWith(el);
    }
  });
</script>
-->

# Frontend for Backenders

.meta[<p>Alexander Solovyov</p>]
.footer[Photo from [Unsplash](https://unsplash.com/@aleksandr_barsukov)]

???

- SPAs are everywhere
- Why
- What do I know
- Complexity is through the roof
- Performance also sucks
- Do we need to go back to jQuery?
- TwinSpark approach
- TwinSpark tech details
- Demo
- What it means for backenders
- What about big projects? kasta.ua
- Results
- Alternatives

---

class: center, middle

# SPAs suck

## Stop doing them

---

background-image: url(img/trollface.png)
class: center, middle

# Questions?

---

background-image: url(img/kasta.jpg)

???

Some progressive-minded person decided this is going to be an SPA

---

# Reasons for an SPA

- Composability
- Long-term maintenance
- Components
  - Rather than split-by-tech
- `ui = f(state)`
- Unified API
- Faster development

---

# 6 years later...

- **2.5Mb** .min.js
- Old devices just give up
- Performance? What performance?
- Faster development is a joke 🤣

---

# Performance

.center[![](img/pagespeed-bad.png)]

# (╯°□°）╯︵ ┻━┻

---

# Negative sides of SPA

- Performance is bad
- Complexity is through the roof
- Display logic creeps into app logic
- Business logic creeps into clients
- Codebase is split
- Tech split makes people helpless

---

# Back to jQuery?..

<p><span class="center"><img src="img/no-god.jpg" style="height: 60vh"></span></p>

---

# jQuery

- Code is a mess after 2 years
- Logic spreads thinly everywhere
- Composability non-existent

---

# Let's think from the first principles

- Need: a modern interactive site
- Want
  - Composability
  - Understandability
  - Server HTML rendering and minimum of JS
  - Empower backend developers

---

# What if we could update a part of the page

```
<a href="/fragment" ts-req>Update me</a>
```

<a href="/fragment" ts-req>Update me</a>

<script>
var clicks = 0;
XHRMock.get("/fragment", (req, res) => {
  clicks++;
  return res.status(200).body(`<a href="/fragment" ts-req>Updated ${clicks}</a>`);
})
</script>

---

# What if we could do that with any element

```
<div ts-req="/fragment">Update me!</div>
```

<div ts-req="/fragment">Update me!</div>


---

# What if we could do that on any event

```
<div ts-req="/fragment" ts-trigger="mouseenter">
  Hover me
</div>
```

<div ts-req="/fragment" ts-trigger="mouseenter">
  Hover me
</div>


---

# Organized fragment replacement

- Low complexity: minimal implementation ~200 LoC
- Lightweight
- Composable: it's all your templates
- Understandable: logic is right here
- Limited, like Python in "Python vs C++"

---

# TwinSpark.js

- Just **8Kb** `.min.gz` (2k LoC)
- Extensible
- Practical: lots of what we needed in real life

---

# Result

.center[![](img/pagespeed-good.png)]

---

# More results

- HTML page is **2.5x** smaller
- JS is **80x** smaller
- Turns out browsers are fast!

---

# For Backenders

- No weird state management
- Simple request/response model
- Add interactivity with no JS

---

class: center, middle

# Examples

---

# Downsides

- Front-end developers hate being forced out of the job
- Keeping the same API for web and apps is harder
- Figuring out patterns takes time
- Complex multi-step behaviors are harder than in React

---

# All in all

- It's approachable
- It's fun
- It's fast
- It's less work

---

# Alternatives

- Same idea
  - htmx: much bigger community
  - Unpoly: much bigger (50Kb `.min.gz`)
- Live View: Phoenix, Laravel, Rails
  - Compelling DX
  - State kept on server in-memory
  - Behavior under load questionable
  
---

class: center, middle

# Questions?

[solovyov.net](https://solovyov.net)
<svg style="width:1em; height: 1em; position: relative; top: 0.125rem"><use href="../../static/icons.svg?v=cebe2de5#twitter"></svg> [@asolovyov](https://twitter.com/asolovyov)
