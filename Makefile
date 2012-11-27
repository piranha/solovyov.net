all:
	gostatic config

w:
	gostatic -w config

open: all
	open site/index.html
