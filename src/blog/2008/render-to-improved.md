title: render_to improved
date: 2008-03-22 15:11:34
tags: django, python, programming
----


*[UPD от 12 ночи]*

Чуть больше года назад, когда меня окончательно задолбало писать
`render_to_response` c кучей параметров, я себе написал маленький декоратор
[render_to][rt], который заметно уменьшал количество писанины.

Но вот не так давно обсуждали его в джаббер-конференции pythonua@c.j.r
(кстати, официальная конференция [python.com.ua](http://python.com.ua)), где появилась идея слегка
его проапгрейдить до возможности задавать темплейт из view (когда одна вью
может выдавать различные странички). В принципе, идея усложнения декоратора
мне не особенно нравится (да и потом, кому надо - может переделать себе,
благо несложно), но по размышлении я увидел, что особенного усложнения нету,
плюс сохраняется обратная совместимость полностью (что важно, потому как мне
есть и где использовать новую фичу, но не очень хочется ломать все вьюхи,
использующие старую версию ;).

<!--more-->

Однако первая версия, с дополнительным параметром (именем ключа из
возвращаемого словаря), имеет явно менее питоновский привкус, чем вариант,
[предложенный][2] в комментариях. Теперь можно возвращать дополнительно к
словарю ещё и имя темплейта, в который он должен отрисовываться:

    @render_to('some/thing_detail.html')
    def thing_detail(request):
        ...
        return {'obj': obj}, 'other/thing.html'

Есть один небольшой момент: если возвращается тупль, то первый аргумент не
проверяется на свою словарность - для определения типа это не нужно, а
программист пускай по своим граблям шагает смело. ;)

    def render_to(template):
        """
        Decorator for Django views that sends returned dict to render_to_response function
        with given template and RequestContext as context instance.
    
        If view doesn't return dict then decorator simply returns output.
        Additionally view can return two-tuple, which must contain dict as first
        element and string with template name as second. This string will
        override template name, given as parameter
    
        Parameters:
    
         - template: template name to use
        """
        def renderer(func):
            def wrapper(request, *args, **kw):
                output = func(request, *args, **kw)
                if isinstance(output, (list, tuple)):
                    return render_to_response(output[1], output[0], RequestContext(request))
                elif isinstance(output, dict):
                    return render_to_response(template, output, RequestContext(request))
                return output
            return wrapper
        return renderer

P.S. Явно в этот раз я из всей работы только то и сделал, что в блог
написал... Ну да это мелочи, главное - удобно получилось. :-)


[rt]: https://solovyov.net/blog/2007/django-render_to_response/
[1]: http://hrundel.eth0.net.ua/
[2]: https://solovyov.net/blog/2008/render-to-improved/#c722
