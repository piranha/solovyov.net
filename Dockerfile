FROM mhart/alpine-node

RUN echo "@testing http://nl.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories
RUN apk add --no-cache nginx curl sassc@testing && npm install -g uglify-js

RUN mkdir /app
WORKDIR /app
COPY . /app
COPY nginx.conf /etc/nginx/nginx.conf

RUN sh get-gostatic /bin/gostatic
RUN gostatic config

EXPOSE 80
CMD /usr/sbin/nginx
