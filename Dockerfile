FROM mhart/alpine-node:8.2.1

RUN echo "@testing http://nl.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories
RUN apk add --no-cache nginx curl sassc@testing && npm install -g uglify-js

RUN mkdir /app
WORKDIR /app

COPY get-gostatic /app
RUN sh get-gostatic /bin/gostatic 2.11

COPY nginx.conf /etc/nginx/nginx.conf
COPY . /app

RUN gostatic config

EXPOSE 80
CMD /usr/sbin/nginx
