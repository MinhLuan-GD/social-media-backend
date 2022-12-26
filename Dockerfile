FROM node:18.7.0-alpine3.16 As development

WORKDIR /app

COPY --chown=node:node package*.json ./

RUN npm i

COPY --chown=node:node . .

USER node

FROM node:18.7.0-alpine3.16 As build

WORKDIR /app

COPY --chown=node:node package*.json ./

COPY --chown=node:node --from=development /app/node_modules ./node_modules

COPY --chown=node:node . .

RUN npm run build

ENV NODE_ENV production

RUN npm i --only=production && npm cache clean --force

USER node

FROM node:18.7.0-alpine3.16 As production

COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist

RUN mkdir src

CMD [ "node", "dist/main.js" ]
