class: middle, center

# SQLAlchemy
## a better ORM

---
# Who am I
# Alexander Solovyov

* Python developer for 5 years
* solovyov.net
* @asolovyov
* github.com/piranha
* love open source

---
# Why?

???

Why is a broad question. Why are you here? Because you had no
alternative. Why am I here? Because I believe that more people should know
that...

---
# SQLAlchemy > Django ORM

???

And now I'll show you why

---
# Main differences

* Few layers of APIs
* Data Mapper vs Active Record

???

Those are the main differences so let's stop for a bit on them.

---
# SQLAlchemy APIs

* DB-API wrapper
* SQL-like DSL
* ORM

???

Basically alchemy provides you consistent interface instead of slightly
different db api implementations by various db drivers, then DSL with select,
insert, where, like and other functions which imitate SQL and then complete ORM,
which blows competition away.

---
class: center
# Data Mapper

## Session and friends

???

Django ORM implements Active Record pattern, which is quite simple idea
that on every call to ORM it just proxies your query to a database, usually
immediately. SQLAlchemy works in a bit different way - you have a Session, which
tracks changes you're making to objects, and then saves them in the end of
transation. Basically it serves as a transaction wrapper and some sort of
lightweight cache, since it tracks objects by primary key and few requests for
the same objects won't be passed to a database.

---
# What does it look like

```python
users = (User.query
         .join(Group)
         .join(Permission)
         .filter(Permission.level >= 30))
```

???

Looks pretty understandable to anyone who wrote at least few lines of SQL
in his life, right? You're joining here and querying database for specific
stuff. But then let's...

---
# Compare to Django

```python
(User.query.join(Group).join(Permission)
 .filter(Permission.level >= 30))

# vs

User.objects.filter(
    groups__permissions__level__gte=30)
```

???

Most of you who are writing for Django are already used to this. But is
this nice? No. What is not nice except that it looks ugly? Implicitness. You're
totally implicit here comparing to alchemy, where you import actual models to
join them. Your syntax code analyzers will tell you about problems. You're using
PyFlakes, aren't you? :)

---
# select_related

```python
Room.objects.select_related('building')
# Fail!
Building.objects.selected_related('rooms')

# vs

Building.query.options(
    joinedload(Building.rooms))
# or
Building.query.options(
    subqueryload(Building.rooms))
```

???

Django just can't do backward select_related. Also, please note that
there is no strings here, which means that everything is going to be
autocompleted in IPython! :) The main difference between joined/subquery load is
that second will perform two queries.

---
# more related queries

    (session.query(User, Permission)
     .join(Group).join(Permission))

    # =>

    [(<User 1>, <Permission 1>),
     (<User 1>, <Permission 2>),
     (<User 2>, <Permission 1>)]

???

You'll get pairs of users and permissions here for all interconnected
users and permissions. Why have I displayed that? Because, you know, Django
can't do that.

---
# Aggregates

    from sqlalchemy import func
    print (session.query(User.age,
                         func.count(User.id))
           .group_by(User.age))

???

Just a simple example, you can see that alchemy is quite consistent in
its API. Also note 'func' object, it generates function objects which are mapped
to sql directly.

---
# Composite primary key

    class Test(Base):
      id1 = Column(Integer, primary_key=True)
      id2 = Column(Integer, primary_key=True)

???

Do you know Django issue 373? It exists for 6 years and asks for
composite primary keys. Guess what? It's in alchemy for ages.

---
# Using raw SQL

    (User.query
     .filter("id < :value and name = :name")
     .params(id=10, name="Guy"))

    # create objects from SQL!
    (User.query
     .from_statement("SELECT * FROM users"))

???

Not to forget excellent support for raw SQL. Have you ever worked with
raw SQL in Django which is used as an argument against "you can't do much with
django orm"? It won't construct objects for you. SQLAlchemy will do that for
you.

---
# SQL to attributes

    class User(Base):
        firstname = Column(String)
        lastname = Column(String)
        fullname = column_property(
            firstname + ' ' + lastname)

???

Even more 'no more raw SQL' for you - and it supports complex queries
here, this example is just an example. ;-)

---
# Subqueries

    c = func.count(Song.id).label('count')

    sq = (session.query(Album.id, c)
          .join(Song)
          .group_by(Album.id)
          .subquery())

    (Album.query
     .join(sq, Album.id == sq.c.id)
     .filter(sq.c.count > 10).count())

???

All in all ORM works with statements (columns, objects), unlike Django,
which works only with models.

---
# Relationships

* lazy
* dynamic
* immediate
* joined
* subquery
* noload

???

lazy - on request loads list of related object. dynamic works like
relationship managers in Django, just generating another query object. Immediate
loads related objects immediately using separate select, joined joins them,
subquery loads via a subquery and noload is a write-only relationship. So you're
quite flexible deciding how your relations should work.

---
# Model mapping

* Single table
* Multiple tables
* Arbitrary select

???

You can map your model to a single table, to a multiple tables, even to
an arbitary select - no restrictions here.

---
# Inheritance

* Joined table
* Single table
* Concrete table

???

You can store inheritance in database in any way you like - one table for
parent and one for child, one table for all children or a single table for
everyone.

---
# Sharding

* Vertical: `Session.configure(binds={User:engine1, Account:engine2})`
* Same model can be bound to different databases
* ShardedSession as a battery
* Sharding is completely transparent

???

As you can see, vertical sharding is totally simple - you just specify
which model goes where. Same thing with horizontal - ShardedSession takes a
function, which should decide on which server current model is going
to. Sharding is completely transparent to a user.

---
# Moar

* Tracks changes to object
* Partial read to object
* Reflection for existing tables
* Validation on assignment
* ON DELETE/UPDATE CASCADE

???

alchemy tracks changes, writing to database only fields which have
changed - what a great feature, isn't it? It also makes it able to write
auditing extensions, saving in history what user have done in his interface. You
can defer loading of some fields - and this will return you proper object, which
will lazily load deferred fields. You can skip definition of tables in your
python code, alchemy will guess fields. You have validation, and you can
actually change primary key of an object - on update cascade works perfectly.

---
# So, why?

???

So why you should use SQLAlchemy? When you're starting a project, all
your queries are going to be simple and you can use anything without any
problems - django orm, mongodb, couchdb, any other buzz word. But then your
queries start to be more complex, application requires more and this is where
SQLAlchemy shines - it makes everything nice and complex possible!

---
# Links

* http://www.sqlalchemy.org/docs/
* http://lucumr.pocoo.org/2011/7/19/sqlachemy-and-you/
* https://solovyov.net/en/2011/04/23/basic-sqlalchemy/

---
class: center

# Questions? ;-)

![face](face.png)
