title: Блог

----

{{ range .Site.Pages.Children .Url }}
{{ if HasChanged "year" .Date.Year }}
 - {{ .Date.Year }}
{{ end }}
 - [{{ .Title }}]({{ $.UrlTo . }})
{{ end }}
