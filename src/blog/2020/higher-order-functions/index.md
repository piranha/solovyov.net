---
title: Higher-order functions are like inheritance
slug: higher-order-functions
date: 2020-09-17
tags: programming
---
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

## Example 1
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

## Example 2
*(added later)*

Another example I'd like to show is a famous library called Redux. It handles state management in React applications and does that through function composition. Let's see an example.

`login/actions.js`:

```
export const login = apiActionCreator('login/api', {
    url: 'auth/login',
    method: 'post'
});
```

`login/LoginScreen.js`:
```
import {connect} from 'react-redux';
import {login as loginAction} from "./actions";

class LoginScreen extends React.Component {
  doLogin() {
    this.props.login(...).then(...)
  }
}

const mapStateToProps = createStructuredSelector({
    loading: state => state.login.loading
});

const mapDispatchToProps = dispatch => bindActionCreators({
    login: loginAction
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);
```

`login/reducer.js`:

```
import {login, logout} from './actions';

export default handleActions({
    [login.STARTED]:  (s, a) => ({...s, loading: true}),
    [login.SUCCESS]:  (s, a) => ({...s, loading: false, auth: true}),
    [login.ERROR]:    (s, a) => ({...s, loading: false, auth: false, error: a.payload}),
}, {});
```

Additionally, this reducer is being included in all reducers, and store is passed through higher-order component called `Provider`, and this `connect` call at the end of `LoginScreen.js` passes the store to `createStructuredSelector` and `bindActionCreators`.

The amount of indirection here is staggering. Another problem is that code locality here is so bad that after some time away from apps written in this way you can't find anything. The work of changing state is happening in reducers and component never imports or touches them, making the whole architecture very **surprising**. I don't like surprises, give me old-fashioned direct function calls over grepping whole codebase please.

This example is a bit of contradiction to my point, which is that higher order functions do not belong to business logic. In this case all higher-order functions are coming from libraries, but in the end it all feels like that familiar inheritance stuff — endless indirection, poor discovery and surprises everywhere.

## Take away
One side of higher-order functions (either HOF itself or the function that is being passed) should belong to a library. Using HOFs amidst business logic needlessly complicates the code. It's exactly like [inheritance](https://solovyov.net/blog/2020/inheritance/), makes your code hard to follow, hard to reason about, hard to debug, hard to experiment with. It's a useful and a powerful tool, but it should be used with restraint and understanding.
