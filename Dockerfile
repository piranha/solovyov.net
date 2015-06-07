FROM node:0.12

RUN mkdir /data /app
WORKDIR /data
COPY . /data
COPY nginx.conf /etc/nginx/nginx.conf
COPY CHECKS /app/CHECKS

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
            node-uglify node-less && \
    rm -rf /var/lib/apt/lists/*

RUN sh /data/get-gostatic /bin/gostatic
RUN gostatic config

CMD /usr/sbin/nginx
