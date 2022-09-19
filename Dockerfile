FROM node:18.7.0-alpine3.16

COPY . ./app

WORKDIR /app

RUN npm ci

CMD ["npm", "run", "start:docker-dev"]
