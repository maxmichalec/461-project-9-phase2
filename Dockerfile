FROM node:18

WORKDIR /app

COPY package*.json ./

COPY . .

RUN npm install

RUN npm run build

EXPOSE 9000

CMD [ "node", "dist/src/app.js" ]
