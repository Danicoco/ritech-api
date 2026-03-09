FROM node:20-alpine

WORKDIR /frontend

COPY package.json /frontend
RUN npm install -g npm@latest

COPY . .

RUN npm install --legacy-peer-deps

RUN npm run build

EXPOSE 8080

CMD [ "npm", "start" ]
