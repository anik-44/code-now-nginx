FROM node:20
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npx prisma migrate deploy
USER node
CMD ["npm", "start"]
