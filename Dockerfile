FROM mhart/alpine-node

RUN apk add --no-cache nginx curl && npm install -g uglify-js less

RUN mkdir /app
WORKDIR /app
COPY . /app
COPY nginx.conf /etc/nginx/nginx.conf

RUN sh get-gostatic /bin/gostatic
RUN gostatic config

EXPOSE 80
CMD /usr/sbin/nginx
