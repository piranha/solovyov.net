GOSTATIC ?= gostatic

compile:
	$(GOSTATIC) config

w:
	$(GOSTATIC) -w config

update: compile
	curl "http://www.feedburner.com/fb/a/pingSubmit?bloglink=http://feeds.feedburner.com/AmazonByteflow" > /dev/null

open: compile
	open site/index.html
