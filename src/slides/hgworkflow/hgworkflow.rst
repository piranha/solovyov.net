.. header:: Mercurial in complex workflows
.. footer:: Alexander Solovyov, PyGrunn, 2011 | solovyov.net

Mercurial
=========

in complex workflows
--------------------

.. image:: droplets.svg

.. This talk intends to present a view on a workflow which you can approach with
.. mercurial and a bit of exposure of mercurial itself

Who I am
========

Alexander Solovyov
------------------

- Paylogic employee
- Python developer for 5 years
- Mercurial contributor for 3 years
- ...and author and contributor to several other projects

.. during my career I participated in quite high amount of different projects
.. and had exposure to significant amount of different workflows so I'd like to
.. share with you some thoughts on what I think is one of nicest workflows


Traditional workflow
====================

- Everybody has write access to central repository
- Code review post factum
- Centralized VCS, linear history

.. Here we have a workflow used by thousands of companies in the world. It's
.. quite easy to understand, quite natural to start with and overall it's still
.. not that bad if you compare that to working without version control at
.. all. This is typical to work like that when you use subversion.

What's wrong
============

- Too much conflicts
- Post factum never works
- Unfinished work hard to manage

.. But it obviously has problems. When a developer works on some problem, it's
.. natural to commit to save some intermediate state. And when your team starts
.. to grow (or you have big amount of problems in same place of code and
.. everybody is focusing there) you start experiencing a lot of conflicts. This
.. is really unpleasant with centralized VCS, since you haven't committed yet
.. and any mistake can turn out in lost code.

.. Also, post factum doesn't work that good anyway. Even if you do a code
.. review, you have some impedance to changing code, since "it already works,
.. this is not big deal, I'll change later".

.. And it is not that rare to have some sort of problem in development, in
.. half-finished state, when you suddenly need to put it aside in a patch to
.. hack on small fix since doing separate checkout takes ages. And managing
.. patches can be quite a burden.


Where to look
=============

.. class:: center

  World has invented a great model for developer interaction:

Open Source
-----------

.. Not open source by itself, but rather development model, used by popular
.. projects. Popular in meaning 'big enough to attract strangers which want to
.. commit'.


Open Source
===========

- Core team (gatekeepers)
- Contributors (developers)
- Disconnected development

.. They basically have some kind of quality control to prevent bad code
.. appearing in repository.


Workflow
========

- Developers submit changes
- Gatekeepers review them
- Changes are merged in main line

.. So how does it work in the end? Developers submit changes in any way which is
.. suitable for you. With subversion projects this happened by using patches
.. sent by mail.

.. Then gatekeepers reply to mail or comment in code review tool. This really
.. needs to be disconnected from submitting code since you don't really want to
.. interrupt someone in a loop. Your developers could be gatekeepers for their
.. colleagues, actually. And it can be really annoying when somebody asks you to
.. review code when you are working on something else, of course.

.. When gatekeeper has no questions to code, code gets in your main repository
.. and everybody is happy. Sometimes. :)

.. You will end with a history which has much smaller amount of mistakes,
.. clearly wrong solutions and similar stuff. Hopefully.


What's the point
================

- Experience exchange
- Prevent sad code
- Collective code ownership

.. The idea is that new contributors have feedback loop with old contributors
.. (and gatekeepers) on how their code should be written. It works pretty the
.. same with developers - you could assign gatekeepering on developers who know
.. particular part of application better.

.. And of course we're all humans and occasionally can write something
.. mind-blowing. When you work on some part of the system for few hours in a row
.. you could write some awful code just to escape from there. Which is were
.. happy gatekeeper comes and asks you to remove sadness from code.

.. Also your team ends up with knowing different parts of code better since they
.. see it all the time.

.. This workflow is simple enough to use it with any tools, starting even with
.. simple patches - that's how Linux kernel was developed for years. But this is
.. where distributed VCS really shine.


DVCS
====

- Changesets in repository instead of patches
- Zero effort branching and merging
- Full history of development
- Total control of situation

.. If you have centralized VCS, to be able to gatekeeper changes, you'll have to
.. send them as patches. This case is much better with DVCS - you're going to
.. store them as commits in your local repository. With pushing and pulling all
.. the way around. Free backups, no more broken merges and lost code, happy
.. life. :)

.. And your repository is local, so creating a branch doesn't involve any hassle
.. and nobody will notice until you want them to. Also, merge will work only
.. with new differences - changesets know their history and have context to
.. prevent conflicts of already merged changes.

.. And you never lose idea when exactly this bug was introduced, you still have
.. your changesets. Also, with local repository, you'll be happy to research
.. history since it's easy and fast. :)

.. You can easily pull changes in your repo and review how they affect overall
.. code, you can accept only certain changesets - because you have separate
.. commits and not a single patch, etcetera.


Mercurial
=========

- Started in April 2005
- Very fast
- 94% Python, 6% C (30k lines)
- Simple and clean Python API for extensions

.. Mercurial started as response to Bitkeeper license withdrawn, same week as
.. git (this is an amusing story).

.. It's really fast, actually second fast on the market behind git maintaining
.. same order of magnitude of performance. Python introduces a bit of penalty
.. here.

.. It handles nice property of having highest feature/sloc ratio, which I think
.. is property of a project where people actually care about code. For
.. comparison, Bazaar has 85k lines of code and git 250k lines of code. Darcs is
.. also nice to mention, since it's 26k lines of code in Haskell. :)

.. And having nice API is really important thing, since in this case system will
.. have a lot of extensions. Which is the case with Mercurial, wiki page lists
.. more than hundred of 3rd-party extensions.


How it applies
==============

- Track features with branches in a single repository
- Have developers' repositories on a server
- Tag branches with bookmarks (or use named branches)
- Use all hg's power to help you

.. Main idea is that you implement every feature in separate branch. Each of
.. those branches starts at actual location where you need them. If we will look
.. on next slide, you can see that hotfix was done on a stable branch, while
.. features are being done on a default branch.

.. You track your branches with bookmarks or named branches, developers publish
.. their changes to their own repositories (not using central one in this case),
.. gatekeepers use this repositories to pull changes from.

Branching
=========

.. aafigure::
  :scale: 2

  stable      -o-----o-->
             /  \   /
  hotfix    /    -o-
           /
  default o------o--o->
           \    /  /
  feature   +-o-  /
            |    /
  another   +-o--


hg serve
========

- Embedded web-server for viewing and sharing
- Zero configuration

.. sourcecode:: bash

  project> hg serve
  listening at http://hostname:8000/ (bound to *:8000)

  # this requires zeroconf extension enabled
  ~> hg paths
  zc-hostname-project = http://192.168.1.2:8000/

.. Basically you have free peer-to-peer sharing. No configuration, no hassle, it
.. just works out of the box. It has support for zeroconf, which means you don't
.. need to tell ip addresses out loud. :)

Revision sets
=============

- What do I have in my branch?

.. sourcecode:: bash

  project> hg log -r 'ancestors(branchname) - ancestors(master)'

- What is not merged yet?

.. sourcecode:: bash

  project> hg log -r 'bookmark() - ancestors(master)' --template '{bookmarks}\n'

- Much more powerful than that: http://selenic.com/hg/help/revsets

.. Essentially a functional language to query your history
.. You can query for changes on stable branch since last release, you can query
.. what new changes you got in your new release. And a lot of other
.. stuff. Invent meaningful query and it's probably possible.


Transplant
==========

- Suddenly need a fix in an older release?
- Use hg transplant!
- Merge will take care

.. This is quite common use case - you just need some fix from your main line
.. backported to stable branch. You always can resort to regular patches, but hg
.. has extension which will give hints to merge mechanism later.


Other stuff
===========

- color
- pager
- progress
- schemes (url shortcuts)
- rebase (uh-huh)

.. Color, pager and progress add some nice properties to output. It's always
.. nice when something makes it easier to read console output easier. :)

.. Of course, amount of nice things is a bit overwhelming for this talk, so
.. let's move on. :)

Mercurial API
=============

- Very simple and clean
- Extensive

  - hooks
  - helpers for wrapping functions
  - adding commands

- Improve your workflow with writing extensions

.. VCS is actually your second most important instrument after your editor,
.. you are using it a lot, and Mercurial allows you to automate anything which
.. happens to be repetetive and boring in a very simple way


Bookmarks pushing
=================

.. sourcecode:: python

  def bookpush(orig, ui, repo, dest=None, **opts):
      if '.' in opts.get('bookmark', ()) and repo._bookmarkcurrent:
          n = opts['bookmark'].index('.')
          opts['bookmark'][n] = repo._bookmarkcurrent
      return orig(ui, repo, dest, **opts)

  def uisetup(ui):
      extensions.wrapcommand(commands.table, 'push', bookpush)

And suddenly you don't need to copy-paste:

.. sourcecode:: bash

  > hg push -B . # instead of "-B bookmark-name"


What do we have
===============

- check you're in the right branch
- check you're not resolving file with conflicts
- start working on a case
- stop working on a case, merge with target branch, submit changes


Make life easier
================

Bring automation and structure there
------------------------------------


Questions
=========

It's the time for them. :)
