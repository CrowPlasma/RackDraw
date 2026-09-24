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

EXPOSE 3000

# En producción siempre aplicamos migraciones pendientes antes de levantar Node
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
