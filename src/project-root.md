title: project-root.el
----

# project-root.el

<dl>
  <dt>Repository</dt>
  <dd><a href="http://hg.piranha.org.ua/project-root/">project-root</a></dd>

  <dt>Latest change</dt>
  <dd id="latest">determining...</dd>

  <dt>Emacs Wiki</dt>
  <dd><a href="http://www.emacswiki.org/ProjectSettings#toc3">project-root at emacswiki</a></dd>
</dl>

Project-root is a simple project management tool for Emacs, which provides
certain flexibility when defining projects. Instead of opening projects by
path, you could just define remarkable files which are definitive for certain
type of project. Example:

    (setq project-roots
          `(("Django project"
             :root-contains-files ("manage.py")
             :filename-regex ,(regexify-ext-list '(py html css js sh))
             :exclude-paths '("contrib"))))

This declaration means that project-root will traverse directories starting
from current to root searching for file `manage.py`. And finding such will
mean that you're in a Django project.

This will allow you to use several predefined helper functions, usually bound
like that:

    (global-set-key (kbd "C-c p f") 'project-root-find-file)
    (global-set-key (kbd "C-c p g") 'project-root-grep)
    (global-set-key (kbd "C-c p a") 'project-root-ack)
    (global-set-key (kbd "C-c p d") 'project-root-goto-root)
    (global-set-key (kbd "C-c p l") 'project-root-browse-seen-projects)

`find-file` provides interface to opening files from project similar to
`ido-switch-buffer`, `grep`/`ack` run appropriate program at project root,
`goto-root` opens dired at project root, and `browse-seen-projects` opens
buffer in [org-mode][] with list of previously opened projects (it's autosaved
on opening new project and autoloaded when project-root is used first time
after Emacs start).

There is a more generic macro: `with-project-root`, which allows you to wrap
any command, setting default directory to project root. For example, to open a
shell at current project root:

    (global-set-key (kbd "C-c p s")
                    (lambda () (interactive)
                      (with-project-root
                          (ansi-term (getenv "SHELL")
                                     (concat (car project-details) "-shell")))

[org-mode]: http://orgmode.org/

<script type="text/javascript">
setTimeout(function() {
  JSONP.get(
    "http://api.bitbucket.org/1.0/repositories/piranha/project-root/changesets",
    {limit: 1},
    function (response) {
      var cset = response.changesets[0];
      var date = new Date(cset.timestamp);
      var link = "http://hg.piranha.org.ua/project-root/commits/" + cset.raw_node;
      var a = '<a href="{href}">{title}</a> <time datetime={iso}>({date})</time>';
      byId('latest').innerHTML = a.format({
          href: link,
          title: cset.message.split('\n')[0],
          iso: date.toISOString(),
          date: date.format('{FullYear}, {MonthShort} {Date}')
      });
    });
});
</script>
