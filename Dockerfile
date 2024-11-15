FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --production && npm cache clean --force

COPY . .

ENV NODE_ENV=production

RUN npm run build


ENV PORT=8080

EXPOSE 8080

CMD ["node", "lib/index.js"]

