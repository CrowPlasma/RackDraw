FROM node:20-alpine

# Install openssl and compatibility libraries for Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

# Generar cliente prisma y compilar typescript a JS
RUN npx prisma generate
RUN npm run build
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

# Script de arranque con reintentos para asegurar conexión y sincronización con PostgreSQL
CMD ["./docker-entrypoint.sh"]
