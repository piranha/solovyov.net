title: Django render_to_response
date: 2007-01-28 19:26:21
tags: python, programming, django
----


Есть в Django одна очень часто используемая мной функция - шорткат `render_to_response`. По сути, её параметрами является имя темплейта и словарь передаваемых в него переменных. И вот переменные можно передать двумя путями. Либо явно указать его здесь в словаре, либо заставив рендерер использовать в качестве обработчика контекста класс `django.template.RequestContext` и в переменной `TEMPLATE_CONTEXT_PROCESSORS` в `settings` указав необходимые функции. Все переменные, которые вернут эти функции, будут видны в любом темплейте, который отрисовывается с помощью `RequestContext`'а.

<!--more-->

И вот тут начинается куча лишнего кода. Потому что каждый вызов render_to_response начинает выглядеть так:

    return render_to_response('cool/template.html',
                              {'people': people, 'things': things},
                              context_instance=RequestContext(request))

Меня реально очень раздражала необходимость писать каждый раз этот самый `context_instance`. И сегодня придумался декоратор, который делает всю нудную работу. :]

    from django.shortcuts import render_to_response
    from django.template import RequestContext
    
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

Теперь отрисовывать всё можно с помощью декоратора:

    @render_to('cool/template.html')
    def view(request):
        return {'people': people, 'things': things}

Если функция вернёт словарь - `render_to` обернёт его в `render_to_response` и отпустит на волю, а если что-то другое (к примеру, `HttpResponse` - перенаправление какое-нибудь) - то просто отпустит на волю. :] Для меня это оказалось очень удобным решением.

P.S. Ну и как водится, через минут 10 после всего я обнаружил, что в принципе изобрёл велосипед - вот [тут](http://code.djangoproject.com/wiki/CookBookShortcutsPageDecorator) уже есть подобный декоратор. Хотя мой велосипед просто проще. ;)
