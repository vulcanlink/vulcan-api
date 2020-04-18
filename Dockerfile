FROM node:12.14-slim

RUN apt-get -qy update && apt-get -qy install openssl

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN npm prune --production

EXPOSE 4002

CMD [ "npm", "run", "start"]