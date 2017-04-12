FROM node:7.5

WORKDIR /app

RUN npm install -g yarn typescript

COPY . .

RUN yarn install

RUN tsc

CMD ["npm", "run", "debug"]

EXPOSE  9653
