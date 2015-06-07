FROM node:0.12

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
            nginx-light node-uglify node-less && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir /app
WORKDIR /app
COPY . /app
COPY nginx.conf /etc/nginx/nginx.conf

RUN sh get-gostatic /bin/gostatic
RUN gostatic config

EXPOSE 80
CMD /usr/sbin/nginx
