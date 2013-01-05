title: ImprovedImageField
date: 2008-03-02 22:52:40
tags: django, db, python, programming
----


В процессе работы над одним проектом я в очередной раз столкнулся с
тем, что джанговский ImageField меня ну никак не устраивает - в нём
отсутствует возможность ресайза при аплоаде, некак загружать картинки
в разные директории[^1], кроме как по дате, ну и динамически назвать
файлик[^2] тоже нельзя.
<!--more-->

В результате поисков готового решения для копипаста не нашлось, хотя
два готовых поля с различной функциональностью было. [Первое][1] имеет
страшный код с жуткими комментариями[^3], с готовой функциональностью,
закрывающей большую часть ТЗ и неработающее в современной Джанге. :)
[Второе][2] - умеет заливать файлики по динамически изменяющемуся
пути, но зато больше ничего не умеет.

Совмещение этих двух подходов много времени не заняло - на самом деле
написание этого поста заняло куда больше времени, чем прошло от идеи и
начала поисков до рабочей реализации (код поля приведен в конце поста).

## Разбор полётов

В функциях `fit` и `rename`, занимающихся соответственно ресайзом и
переименованием, объяснять в общем-то нечего - всё сказано в
докстрингах. :)

Сам класс начинается с изменения `init`'а, для получения параметров
ресайза. Тут же, кстати, кроется небольшой недостаток - сейчас
невозможно не указывать `upload_to` в параметрах классу, но я пока не
придумал, как проверить существование функции для динамической
установки пути `upload_to`.

Кстати, где-то не так давно прочитал, что использование
`contribute_to_class` сейчас не приветствуется, но я для себя
альтернатив в документации не нашёл - потому все три рабочие функции
подключаю именно с помощью `contribute_to_class`.

Первая - `_upload_to`, проверяет на существование у модели метода
`determine_FIELD_upload_to` (который из параметров принимает только `self`),
и при наличии такого - вызывает его для установки `upload_to` (при
отсутствии остаётся рабочим параметр, переданный в конструктор
класса).

Дальше тоже нету ничего военного - `_resize`, после проверки на
заполненность поля исправляет его размер (сразу после сохранения[^4]).

Ну и "переименовывалка" - при заполненности поля и присутствии у
модели метода `determine_FIELD_filename` переименовывает в соответствии с
ним сущестсвующий файл (а вот это происходит как раз перед
сохранением[^5]).

Использовать всё это очень просто, вот пример готовой модели:

    class UserProfile(models.Model):
        user = models.ForeignKey(User)
        avatar = ImprovedImageField(max_height=100, max_width=100, blank=True,
                                    upload_to='_')
    
        def determine_avatar_upload_to(self):
            return self.user.username
    
        def determine_avatar_filename(self):
            return 'avatar'
    
Теперь при загрузке аватаров для пользователя 'piranha' они будут помещаться в
каталог `{{ settings.MEDIA_ROOT }}/piranha/avatar.jpg`[^6].

Код самого поля:

    import os
    import shutil
    
    import Image
    from django.db.models import ImageField, signals
    from django.dispatch import dispatcher
    from django.conf import settings
    
    
    def fit(file_path, max_width, max_height):
        """Resize file (located on file path) to maximum dimensions proportionally.
        At least one of max_width and max_height must be not None."""
        if not (max_width or max_height):
            # Can't resize
            return
        img = Image.open(file_path)
        w, h = img.size
        w = int(max_width or w)
        h = int(max_height or h)
        img.thumbnail((w, h), Image.ANTIALIAS)
        img.save(file_path)
    
    
    def rename(old_path, new_name):
        """
        old_name is relative to MEDIA_ROOT
        new_name is just base name, without extension
        """
        def fp(path):
            return os.path.join(settings.MEDIA_ROOT, path)
        if not os.path.isfile(fp(old_path)):
            return old_path
        path = os.path.dirname(old_path)
        ext = os.path.splitext(old_path)[1]
        # django wants to have '/' in path
        new_path = '/'.join([path, new_name + ext])
        if new_path != old_path:
            try:
                shutil.move(fp(old_path), fp(new_path))
            except IOError:
                return old_path
        return new_path
    
    
    class ImprovedImageField(ImageField):
        """Allows model instance to specify following parameters dynamically:
    
         - upload_to, specify following method for model:
    
            def determine_FIELD_upload_to(self):
                return 'avatars/%d' % self.user.username
    
         - filename (relative to upload_to, without extension):
    
             def determine_FIELD_filename(self):
                 return self.pk
    
        Additionally field supports automatic resizing, if at least one of
        max_width and max_height supplied.
    
        Current flaws: upload_to must be specified as parameter (even if
        custom method exist, although parameter can carry useless value).
    
        Based on:
            http://code.djangoproject.com/wiki/CustomUploadAndFilters
            http://scottbarnham.com/blog/2007/07/31/uploading-images-to-a-dynamic-path-with-django/
    
        Copyright (c) 2008 Alexander Solovyov under new BSD License.
        """
        def __init__(self, max_width=None, max_height=None, **kwargs):
            self.max_width, self.max_height = max_width, max_height
            super(ImprovedImageField, self).__init__(**kwargs)
    
        def db_type(self):
            """Required by Django for ORM."""
            return 'varchar(100)'
    
        def contribute_to_class(self, cls, name):
            """Hook up events so we can access the instance."""
            super(ImprovedImageField, self).contribute_to_class(cls, name)
            dispatcher.connect(self._upload_to, signals.post_init, sender=cls)
            dispatcher.connect(self._resize, signals.post_save, sender=cls)
            dispatcher.connect(self._rename, signals.pre_save, sender=cls)
    
        def _upload_to(self, instance=None):
            """Get dynamic upload_to value from the model instance."""
            if hasattr(instance, 'determine_%s_upload_to' % self.attname):
                self.upload_to = getattr(instance, 'determine_%s_upload_to' % self.attname)()
    
        def _resize(self, instance):
            if getattr(instance, self.attname):
                real_path = os.path.join(settings.MEDIA_ROOT, getattr(instance, self.attname))
                if os.path.isfile(real_path):
                    fit(real_path, self.max_width, self.max_height)
    
        def _rename(self, instance):
            if hasattr(instance, 'determine_%s_filename' % self.attname) and getattr(instance, self.attname):
                filename = getattr(instance, 'determine_%s_filename' % self.attname)()
                new_path = rename(getattr(instance, self.attname), filename)
                setattr(instance, self.attname, new_path)
    

UPD. Наконец-то пофиксил траблу с `get_FIELD_filename`.

[^1]: А если этого не сделать, то директория быстро загрязнится кучей файлов, что в будущем вполне может привести к заметному увеличению времени поиска файлов системой.

[^2]: Это в первоначальные планы не входило, но позже обрело своё место под солнцем. :)

[^3]: В стиле `a=2+3 # Вычисляем 2+3`.

[^4]: А точнее, после вызова сигнала `post_save` у нашей модели.

[^5]: На этот раз - сигнала `pre_save`.

[^6]: Естественно, расширение зависит от типа файла. :)

[1]: http://code.djangoproject.com/wiki/CustomUploadAndFilters
[2]: http://scottbarnham.com/blog/2007/07/31/uploading-images-to-a-dynamic-path-with-django/
