CACHE_DIR ?= ~/bin
GOSTATIC ?= bin/gostatic-wrap $(CACHE_DIR)/gostatic 2.35 -p 1234

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
	cd .git/hooks && ln -s ../../bin/post-receive

clean:
	rm -rf www
