FROM node:18

WORKDIR /app

# Install Angular CLI globally (if not already installed)
RUN npm install -g @angular/cli

COPY package*.json ./

COPY tsconfig.json ./

COPY src ./

RUN npm install

ENV LOG_FILE=log.txt
ENV LOG_LEVEL=2

RUN npm run build

EXPOSE 9000

# Redirect any console.log()s to a file
CMD [ "/bin/sh", "-c", "node dist/app.js > console_log.txt 2>&1" ]
