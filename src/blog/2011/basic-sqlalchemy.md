tags: python, programming, sql, db
title:  SQLAlchemy: как втянуться
date: 2011-04-22
favorite: true
----

SQLAlchemy сейчас - очевидный лидер ORM в питоне, но у неë есть один
довольно неприятный недостаток: чтобы начать пользоваться, приходится
прочитать немало документации. Поэтому я решил написать (очень) короткий
пост-введение в алхимию.

Уровень 1: SQL руками
---------------------

Первым делом нам нужно соединение к базе, с которым можно что-то делать:

    >>> from sqlalchemy import create_engine
    >>> e = create_engine('mysql://user:pass@host/db')
    >>> for r in e.execute('select * from table where id < %s', 2):
    ...     print dict(r)
    {u'id': 1, u'info': u'first row'}

Если хочется именованных параметров, можно использовать `text()`:

```python
>>> from sqlalchemy import text
>>> result = e.execute(text('select * from table where id < :id'), {'id': 2})
```

Из объектов, которые получаются итерацией результата - `RowProxy` -
данные можно вытаскивать и индексом, и ключом, и атрибутом:

    >>> r[0] == r['id'] == r.id
        True

Нужна транзакция?

```python
>>> c = e.connect()
>>> c.begin()
>>> # work work work
>>> c.commit() # try/except: c.rollback() optionally :)
```

Это уже что-то и так можно жить, тем более что оно экранирует параметры
автоматически.

Уровень 2: SQL-выражения в питоне
---------------------------------

Можно получить объект таблицы из базы (с автоопределением колонок) и
работать с ним, если так будет удобнее:

    >>> from sqlalchemy import Table, MetaData
    >>> meta = MetaData(bind=e, reflect=True)
    >>> table = meta.tables['table']
    >>> list(e.execute(table.select(table.c.id < 2)))
        [(1, u'first row')]

Т.е. абсолютно идентичный запрос, но уже в питоне.

Уровень 3: ORM
--------------

Ну и если приятнее с объектами работать, которым можно поведение
задавать:

    >>> from sqlalchemy import orm
    >>> class Table(object):
    ...     pass
    >>> orm.Mapper(Table, meta.tables['table'])
    >>> s = orm.Session(bind=e)
    >>> s.query(Table).filter(Table.id < 2).first().info
        u'first row'

Тут уже можно использовать ORM по полной:

    >>> class Artist(object):
    ...     pass
    >>> orm.Mapper(Artist, meta.tables['artist'])
    >>> class Album(object):
    ...     pass
    >>> orm.Mapper(Album, meta.tables['album'])
    >>> class Song(object):
    ...     pass
    >>> orm.Mapper(Song, meta.tables['song'])
    >>> s.query(Song).join(Album).filter(Album.id == 10).count()
        12L
    >>> # Song первый, поэтому его нужно джоинить с альбомом
    >>> s.query(Song.name, Album.name).join(Album).join(Artist).filter(Artist.id == 2).first()
        (u'Hex', u'Inflikted')
    >>> print s.query(Song.name, Album.name).join(Album).join(Artist).filter(Artist.id == 2)
    SELECT song.name AS song_name, album.name AS album_name
    FROM song JOIN album ON album.id = song.album_id JOIN artist ON artist.id = album.artist_id
    WHERE artist.id = %(id_1)s

Еще, если использовать `Session.execute()`, то можно сразу передавать
именованные параметры:

    >>> list(s.execute('select * from table where id < :id', {'id': 2}))
        [(1, u'first row')]

Разное
------

Нужно сказать, что по умолчанию у `Engine` уже есть пул соединений, что
приятно.

Метаданные с рефлексией и ранним биндингом - не совсем принятый подход,
это только для маленьких наколенных скриптов и работы в шелле, скорее, а
так обычно `Engine` к `MetaData` добавляют где-то отдельно, в чтении
настроек, когда уже все таблицы определены (через `meta.bind = e`).

Сессия часто напрямик не используется, особенно в многопоточных
приложениях -есть [orm.scoped_session][1], который создаëт
тред-локальную сессию.

Вот в принципе и всë, дальше есть
[документация](http://www.sqlalchemy.org/docs/). :)

[1]: http://www.sqlalchemy.org/docs/orm/session.html?highlight=scoped_session#sqlalchemy.orm.scoped_session
