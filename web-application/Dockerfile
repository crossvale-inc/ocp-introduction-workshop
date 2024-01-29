FROM nginx:alpine

COPY index.html /usr/share/nginx/html
COPY index.js /usr/share/nginx/html
COPY nginx-default.conf /etc/nginx/conf.d/default.conf

RUN chmod 644 /usr/share/nginx/html/index.html
RUN chmod 644 /usr/share/nginx/html/index.js
