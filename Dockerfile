FROM nginxinc/nginx-unprivileged:1.27-alpine

COPY --chown=nginx nginx.conf /etc/nginx/nginx.conf
COPY --chown=nginx index.html style.css script.js event-pages.css /usr/share/nginx/html/
COPY --chown=nginx events/ /usr/share/nginx/html/events/

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
