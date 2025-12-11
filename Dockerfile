# ===== Etapa 1: Construcción del frontend (React + Vite) =====
FROM node:20 AS build
WORKDIR /app
COPY Frontend/package*.json ./Frontend/
WORKDIR /app/Frontend
RUN npm install
COPY Frontend/ ./
RUN npm run build

# ===== Etapa 2: Servidor con Nginx =====
FROM nginx:latest

# Limpia archivos por defecto de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia los archivos compilados desde la etapa anterior
COPY --from=build /app/Frontend/dist/. /usr/share/nginx/html/

# Exponer el puerto 80
EXPOSE 80

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"]
