FROM node:18.12

RUN yarn global add nodemon
WORKDIR /src
ADD package.json /src
RUN yarn install 

COPY . . 

CMD ["node", "index.js"]


