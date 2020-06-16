NETLIFY_CACHE_DIR ?= _bin
GOSTATIC ?= ./gostatic-wrap $(NETLIFY_CACHE_DIR)/gostatic 2.20 -p 1234

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

open: compile
	open www/index.html

hook:
	cd .git/hooks && ln -s ../../post-receive
