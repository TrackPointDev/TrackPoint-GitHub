FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --production && npm cache clean --force && npm install -g typescript

COPY . .

RUN npm run build

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "lib/index.js"]

