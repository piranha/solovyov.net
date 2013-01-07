title: Блог

----

{{ range .Site.Pages.Children .Url }}
{{ if changed "year" .Date.Year }}
 - {{ .Date.Year }}
{{ end }}
 - [{{ .Title }}]({{ $.UrlTo . }})
{{ end }}
