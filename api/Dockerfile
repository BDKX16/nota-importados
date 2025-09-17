FROM node:18.16.0-alpine

WORKDIR /api

# Copiar solo los archivos de dependencias primero
COPY package.json package-lock.json ./

# Instalar las dependencias
RUN npm install

# Crear el directorio uploads con permisos adecuados
RUN mkdir -p uploads && chmod 755 uploads

# Copiar el resto del código de la aplicación
COPY . .

# Asegurar que el directorio uploads existe y tiene permisos correctos
RUN mkdir -p uploads && chmod 755 uploads

EXPOSE 3001

CMD ["node", "index.js"]