title: Блог

----

{{ range .Site.Pages.Children .Url }}
 - [{{ .Title }}]({{ $.UrlTo . }})
{{ end }}
