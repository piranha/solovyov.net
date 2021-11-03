#!/bin/sh

test -z "$(git status --porcelain -uno)" && exit 0
git diff
git config --global user.email "a+bot@solovyov.net"
git config --global user.name "Actions Bot"
git commit -am "Updated content"
git push
