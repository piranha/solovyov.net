title: Пара слов о декораторах
date: 2007-11-16 12:15:39
tags: python, programming
----


Всем известна одна особенность декораторов - если просто, без всяких ухищрений,
написать декоратор и применить его к функции, то любые способы определить имя
функции, посмотреть её документацию и т.д. окажутся бесполезными - декоратор их
заменяет своими. Для примера возьмём таки начавший понемногу расходиться по
проектам `render_to`:

    def render_to(tmpl):
        def renderer(func):
            def wrapper(request, *args, **kw):
                output = func(request, *args, **kw)
                if not isinstance(output, dict):
                    return output
                return render_to_response(tmpl, output, 
                       context_instance=RequestContext(request))
            return wrapper
        return renderer

Конечно, можно дописать пару строк к возврату враппера и получить в принципе
работающий механизм:

            wrapper.__name__ = func.__name__
            wrapper.__doc__ = func.__doc__
            return wrapper

Но на самом деле это не самый красивый метод. Куча всяких руководств для начинающих
по написанию декораторов всегда рекомендует юзать модуль Мишеля Симионато -
[decorator][1]. В принципе, всё конечно просто отлично, но есть у него огромный
недостаток - это дополнительная библиотека, в то время как есть отличное решение
из стандартной библиотеки - `functools.wraps`. Его использование ничем не
отличается от использования `decorator`'а:

    from functools import wraps
    
    def render_to(tmpl):
        def renderer(func):
            @wraps(func)
            def wrapper(request, *args, **kw):
                output = func(request, *args, **kw)
                if not isinstance(output, dict):
                    return output
                return render_to_response(tmpl, output, 
                       context_instance=RequestContext(request))
            return wrapper
        return renderer

И всё становится белым и пушистым. :-) Один момент непонятен - почему его не
пишут во всех этих руководствах для начинающих? Ведь эти начинающие с течением времени становятся продолжающими и точно так же не знают о простой и приятной штуке прямо в `stdlib`'е.

[1]: http://www.phyast.pitt.edu/~micheles/python/documentation.html
