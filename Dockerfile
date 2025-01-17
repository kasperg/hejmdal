ARG NODE_BASEIMAGE=docker.dbc.dk/node10:latest
# ---- Base Node ----
FROM  $NODE_BASEIMAGE AS build
# set working directory
WORKDIR /home/node/app
# copy project file
COPY . .

# install node packages
RUN npm set progress=false && npm config set depth 0 && \
  npm ci --only=production && \
  mkdir prod_build && \
  cp -R node_modules prod_build/node_modules && \
  npm ci

# build statics
RUN npm run build:prod && \
  cp -R static prod_build/static && \
  cp -R src prod_build/src && \
  cp -R migrations prod_build/migrations && \
  cp -R .babelrc prod_build/.babelrc && \
  cp -R package.json prod_build/package.json

# Run unit and lint test
RUN npm run lint:checkstyle && \
  npm run test

#
# ---- Release ----
FROM $NODE_BASEIMAGE AS release
WORKDIR /home/node/app
COPY --chown=node:node --from=build /home/node/app/prod_build ./
USER node
CMD node src/main.js