class: center

# ClojureCup 2013

## fun+React+ClojureScript

.meta[Alexander Solovyov, How Far Games]

---

# ClojureCup 2013

## 28-29 сентября

- 29 часов подряд
- но мы 8 часов спали! :)
- Стопицот человекочасов реально

---

# React

```javascript
var X = React.createClass({render: function() {
    return <div>{this.props.name}</div>
}});

React.renderComponent(
    <X name="test"/>,
    document.body);
```

---

# ClojureScript

```
(defr X [{:keys [name]}]
    (div name))

(render (X "test"))
```

---

# Размеры

- CLJS 877 loc, Clojure 515 loc, общего 111 loc
- React 430kb, приложение 1.2mb
- Min: React 57kb, приложение 300kb (68kb gzip)
    
---

# Сцылочки

- http://facebook.github.io/react/
- http://facebook.github.io/react/blog/2013/10/03/community-roundup-9.html
- http://github.com/piranha/pump/
- http://piranha.github.io/slides/clojurecup/
