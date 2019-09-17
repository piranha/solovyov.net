FROM mhart/alpine-node:11.8

RUN apk add --no-cache nginx curl sassc && npm install -g uglify-js

RUN mkdir /app
WORKDIR /app

COPY get-gostatic /app
RUN sh get-gostatic /bin/gostatic 2.17

COPY nginx.conf /etc/nginx/nginx.conf
COPY . /app

RUN gostatic config

EXPOSE 80
CMD ["/usr/sbin/nginx"]
