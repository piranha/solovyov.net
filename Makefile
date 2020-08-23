CACHE_DIR ?= ~/bin
GOSTATIC ?= ./gostatic-wrap $(CACHE_DIR)/gostatic 2.22 -p 1234

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
