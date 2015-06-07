FROM node:0.12

RUN mkdir /app
WORKDIR /app
COPY . /app
COPY nginx.conf /etc/nginx/nginx.conf

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
            node-uglify node-less && \
    rm -rf /var/lib/apt/lists/*

RUN sh get-gostatic /bin/gostatic
RUN gostatic config

CMD /usr/sbin/nginx
