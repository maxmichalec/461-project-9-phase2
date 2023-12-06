FROM node:18

WORKDIR /app

# Install Angular CLI globally (if not already installed)
RUN npm install -g @angular/cli

COPY package*.json ./

COPY . .

RUN npm install

RUN export LOG_FILE=log.txt
RUN export LOG_LEVEL=2

RUN npm run build

EXPOSE 9000

CMD [ "node", "dist/app.js", ">>", "console_log.txt" ]
