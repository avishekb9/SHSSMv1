FROM nginxinc/nginx-unprivileged:1.27-alpine

COPY --chown=nginx nginx.conf /etc/nginx/nginx.conf
COPY --chown=nginx index.html style.css script.js /usr/share/nginx/html/

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
