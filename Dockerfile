FROM node:18.12.1-alpine As development

WORKDIR /app

COPY --chown=node:node package.json .

RUN yarn

COPY --chown=node:node . .

RUN yarn build

USER node

FROM node:18.12.1-alpine As production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

COPY --chown=node:node --from=development /app/package.json ./package.json

RUN yarn install --only=production

COPY --chown=node:node --from=development /app/dist ./dist

CMD [ "node", "dist/main" ]
