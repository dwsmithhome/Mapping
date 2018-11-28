FROM node:carbon-alpine

WORKDIR /usr/src

RUN apk add --no-cache --virtual .gyp \
        python \
        make \
        g++

RUN npm install -g nodemon mocha

COPY ./package.json .

RUN npm install

COPY ./app ./app

COPY ./version .

CMD ["npm", "start"]
