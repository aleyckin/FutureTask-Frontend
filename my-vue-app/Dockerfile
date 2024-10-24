# Используем Node.js для сборки приложения
FROM node:20 as build-stage

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json для установки зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь проект в контейнер
COPY . .

# Собираем Vue.js приложение
RUN npm run build

# Создаем новый stage для сервера Nginx
FROM nginx:alpine as production-stage

# Копируем собранное приложение в папку, которую обслуживает Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Экспонируем порт
EXPOSE 80

# Запускаем Nginx
CMD ["nginx", "-g", "daemon off;"]
