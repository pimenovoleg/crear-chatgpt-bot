ARG BASE=node:lts-slim

###################################################
FROM ${BASE} AS dependencies

RUN apt-get update \
    && apt-get install --no-install-recommends -y openssl

WORKDIR /app

COPY package*.json package-lock.json ./

RUN npm ci --production=true --frozen-lockfile \
  && cp -R node_modules prod_node_modules \
  && npm ci --production=false --prefer-offline

###################################################
FROM ${BASE} AS builder

WORKDIR /app

COPY . .
COPY --from=dependencies /app/node_modules ./node_modules

RUN npm run build

###################################################
FROM ${BASE} AS runner

WORKDIR /app

COPY --from=dependencies /app/prod_node_modules ./node_modules
COPY --from=builder /app/dist .

USER node

# Start the app
EXPOSE 80
CMD ["npm", "run", "start:prod"]
