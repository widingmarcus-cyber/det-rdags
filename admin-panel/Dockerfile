FROM node:20-alpine AS builder

WORKDIR /app

# Installera beroenden
COPY package.json .
RUN npm install

# Kopiera källkod
COPY . .

# Bygg för produktion
RUN npm run build

# Produktion med nginx
FROM nginx:alpine

# Kopiera byggda filer
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx-konfiguration för SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
