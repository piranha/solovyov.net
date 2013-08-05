GOSTATIC ?= gostatic

compile:
	$(GOSTATIC) config

w:
	$(GOSTATIC) -w config

f:
	$(GOSTATIC) -f config

update:
	git pull
	$(GOSTATIC) config
	curl -s "http://www.feedburner.com/fb/a/pingSubmit?bloglink=http://feeds.feedburner.com/AmazonByteflow" > /dev/null

open: compile
	open site/index.html
