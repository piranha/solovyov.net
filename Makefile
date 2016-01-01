GOSTATIC ?= gostatic -p 1234

compile:
	$(GOSTATIC) config

w:
	$(GOSTATIC) -w config

f:
	$(GOSTATIC) -f config

wf:
	$(GOSTATIC) -f -w config

update:
	git pull
	$(GOSTATIC) config
	curl -s "http://www.feedburner.com/fb/a/pingSubmit?bloglink=http://feeds.feedburner.com/AmazonByteflow" > /dev/null

open: compile
	open www/index.html

gostatic:
	./get-gostatic /opt/build/cache/gostatic

netlify: gostatic compile
