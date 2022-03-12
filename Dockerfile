FROM node:14.18.2-alpine

WORKDIR /usr/src/app

ARG REACT_APP_GA_TRACKING_ID

# Dependencies
COPY ./package.json .
COPY ./yarn.lock .
COPY ./packages/client/package.json ./packages/client/
COPY ./packages/common/package.json ./packages/common/
COPY ./packages/server/package.json ./packages/server/
RUN yarn

# Files
COPY . .

# Build
RUN BUILD_MODE=production yarn build

# Port
EXPOSE 3001

# Serve
CMD [ "yarn", "serve" ]
