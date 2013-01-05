title: Apache + mod_wsgi + Django
date: 2007-10-05 19:21:04
tags: apache, django, hosting, wsgi
----


Меня [тут][1] попросили описать то, как я запускаю джанговские приложения в апаче. Я решил не растягивать резину в долгий ящик и просто привести свой конфиг с комментариями. :)

    <VirtualHost *>
        ServerAdmin piranha@piranha.org.ua
        ServerName piranha.org.ua
        ServerAlias www.piranha.org.ua

        # директива говорит о том, что это конкретное приложение будет исполняться
        # в процессе-демоне с названием piranha
        WSGIProcessGroup piranha
        # Собственно описание этого демона. 2 процесса, максимум 1000 запросов.
        # Сайт не нагруженный, больше и не надо. :)
        WSGIDaemonProcess piranha user=piranha group=www-data threads=2 maximum-requests=1000
        # Главная, практически, директива. Файлик с описанием приложения. См. ниже.
        WSGIScriptAlias / /home/piranha/web/byteflow/byteflow/django.wsgi

        # Решил оставить, чтоб не забывали про него. :)
        # Кеширование картинок и прочих статических файлов.
        <IfModule mod_expires.c>
            <FilesMatch "\.(jpg|gif|png|css|js)$">
                ExpiresActive on
                ExpiresDefault "access plus 3 days"
            </FilesMatch>
        </IfModule>

        # Описание расположения статических файлов.
        Alias "/admin-media/" "/usr/local/lib/python2.4/site-packages/django/contrib/admin/media/"
        <Location "/admin-media/">
            SetHandler None
        </Location>

        Alias "/media/" "/home/piranha/web/byteflow/media/"
        <Location "/media/">
            SetHandler None
        </Location>

        # Логи. ;)
        LogLevel warn
        CustomLog /home/piranha/web/logs/piranha.access.log combined
        ErrorLog /home/piranha/web/logs/piranha.error.log
    </VirtualHost>

А вот тот самый файлик, в котором описывается, как запускать приложение:

    import sys
    import os
    import os.path

    sys.path.insert(0, os.path.dirname(__file__))
    os.environ['DJANGO_SETTINGS_MODULE'] = 'settings'

    from django.core.handlers.wsgi import WSGIHandler
    application = WSGIHandler()

Кратко и незамысловато. Годится для любого проекта в силу независимости от места расположения. :)

Вот и всё. Файлик django.wsgi лежит в директории проекта, джанга лежит в пути `Python`'а 
(у меня вот в `/usr/local/`, потому как последний trunk и пакета для него, естественно, нету),
всё работает прекрасно.

P.S. И, естественно, апач надо релоадить (`apache2ctl graceful`) после изменений в конфиге или в питон-коде приложения.

[1]: http://piranha.org.ua/blog/2007/09/17/modwsgi/#c99
