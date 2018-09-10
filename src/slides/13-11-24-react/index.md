class: center, middle

# React

## успешный синтез теории и практики

.meta[Alexander Solovyov, How Far Games]

.footer[UA Web Challenge, Nov 2013]

---

# В начале было <s>Слово</s>MVC

### И MVC было у Backbone

### И MVC был Backbone

--

<br/>

# Но было ли это хорошо?

---

# Разделение интересов

- Уменьшить связанность (coupling, зв’язність)
- Увеличить связность (cohesion, пов’язаність)

---

# Связанность

Степень, в которой каждый программный модуль полагается на другие модули.

---

# Связность

Характеристика внутренней взаимосвязи между частями одного модуля.

---

# А что обычно?

- *Все разделено*
  - На шаблоны
  - И логику интерфейса
- Связанность - высокая
- И связность - тоже!

---

# Backbone

```javascript
Backbone.View.extend({
  tagName: 'li',
  events: {
    'click .icon': 'open'
  }
});
```

---

# Angular

```html
<ul>
  <li ng-repeat="todo in todos">
    {{todo.text}}
  </li>
</ul>
```

---

# MVC в JS прямо сейчас

- Разделение по технологиям, а не интересам
- Пытается решить, где твои интересы, за тебя

---

# FRP?

- Опиши отношения данных
- Расскажи, как построить UI на их основе
- Вуаля

---

# React

.center[![react](tutsplus.png)]


---

# Компоненты

```javascript
var Root = React.createClass({
  render: function() {
    return <div>{this.props.text}</div>;
  }
});

React.renderComponent(
  <Root text="hello">,
  document.body);
```

---

# JSX

```
<div attr="value">
  <span>one</span>
  <span>two</span>
</div>

DOM.div({attr: "value"},
  DOM.span(null, "one"),
  DOM.span(null, "two")
);
```

---

# Как это работает

- Иерархия компонентов
- Односторонняя привязка данных
- Виртуальный DOM

---

# Иерархия компонентов

```
Item = React.createClass({
  render: function() {
    <li>{this.props.text}</li>;
}});

List = React.createClass({
  render: function() {
    <ul>{this.props.list.map(function(x) {
      return <Item text={x}/>;
    })}</ul>
}});
```

---

# Привязка данных

- render вызывается на каждом изменении данных, как на сервере
- Никаких магических биндингов
- Никаких проверок на "грязность"
- Всë декларативно

---

# Виртуальный DOM

- На каждое изменение обновляет граф объектов
- Применяет минимальные изменения к DOM'у
- Быстро

---

# Результат

- Быстро
- Удобно
- **Просто**

---

# Еще плюсы

- Можно рисовать на сервере (react-page)
- Можно рисовать в воркере (экспериментальное)
- Удобно использовать из ClojureScript (pump)

---

class: center, middle

# Спасибо за внимание!

### Не забудьте заценить http://reactjs.org/
