#!/bin/sh

URL='https://highlightjs.org/download/'
PACK=hljs.zip
FN=highlight.pack.js

CONTENT=$(curl -s -i $URL)
COOKIE=$(echo $CONTENT | grep -o 'csrftoken=[^;]*')
TOKEN=$(echo $CONTENT | pup '#download-form [name=csrfmiddlewaretoken] attr{value}')

LANGS=$(cat "src/static/$FN" | grep -o 'registerLanguage("[^"]*"' | awk -F '"' '{print "-d " $2 ".js=on"}')

curl -s $LANGS -d "csrfmiddlewaretoken=$TOKEN" -H "Cookie: $COOKIE" -e $URL $URL > $PACK
unzip -q $PACK $FN
mv $FN src/static/
rm $PACK
