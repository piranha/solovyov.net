title: API pagination design
date: 2020-10-13
tags: programming
draft: true
----

Returning all results for a given query could be a challenge for an API, especially if there are thousands of results. It puts a load on a server, on a client, on a network, and often is unnecessary. Thus people invented pagination.

The usual way to paginate is an offset or a page number. So you make a request like that:

```
GET /api/products?page=10
{"items": [...100 products]}
```

and to continue you make a request like that:

```
GET /api/products?page=11
{"items": [...another 100 products]}
```

In case of a simple offset it'll look like `?offset=1000` and `?offset=1100` — it's the same old soup, just reheated. It'll either go straight into SQL query like `OFFSET 1000 LIMIT 100` or will be multiplied by page size (that `LIMIT` value). In any case, it's a suboptimal solution, since every database has to skip that 1000 rows. And to skip them it needs to identify them. It does not matter if it's PostgreSQL, or ElasticSearch, or MongoDB, it'll have to order them, count them, and throw them away.

This is a kind of work which no one needs. But it repeats over and over again since it's *easy* to implement — you directly map your API onto your query to a database.

What do you do then? We could look at what databases do! They have this concept, called [cursor](https://en.wikipedia.org/wiki/Cursor_(databases)) — it's a pointer to a row. So you can say to a database "return me 100 rows after **that** one". And it's much easier for a database to do since there is a good chance that you'll identify the row by a field with an index. And suddenly you don't need to fetch and skip those rows, you'll go directly past them.

An example:

```
GET /api/products
{"items": [...100 products],
 "cursor": "qWe"}
```

API returns an (opaque) string, which you can use then to retrieve the next page:

```
GET /api/products?cursor=qWe
{"items": [...100 products],
 "cursor": "qWr"}
```

Implementation-wise there are many options. Generally, you have some ordering criteria, for example, product id. In this case, you'll encode your product id with some reversible algorithm (let's say [hashids](https://hashids.org/)). And on receiving a request with the cursor you decode it and generate a query like `WHERE id > :cursor LIMIT 100`.

Of course, nobody orders products by an id — you usually order them by some relevancy (and then by id as a [tie breaker](https://stackoverflow.com/a/17330992/46854)). In the real world, you'll have to look at your data to determine what to do. Orders can be ordered by id (as it's monotonically increasing). Wishlist items can be ordered like that as well — by wishlisting time. In our case products come from ElasticSearch, which naturally supports this cursor stuff.

One deficiency you can see is that it's impossible to generate a "previous page" link with a stateless API. So in case of a user-facing pagination, if it's important to have prev/next and "go directly to page 10" buttons there is no way around this offset/limit stuff. But in other cases using cursor-based pagination can greatly improve performance, especially on really big tables with really deep pagination.