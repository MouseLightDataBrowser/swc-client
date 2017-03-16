FROM node:7.5

WORKDIR /app

# Bundle app source
COPY . .

# Install production app dependencies
RUN npm install -g yarn typescript@2.1.6
RUN yarn install

RUN tsc

EXPOSE  9673
