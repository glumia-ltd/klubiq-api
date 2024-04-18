
# Use the latest Node.js version
FROM node:alpine As development

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .



# BUILD STAGE
FROM node:alpine As build

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN echo $NODE_ENV

WORKDIR /usr/src/app


COPY --chown=node:node package*.json ./

COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

RUN npm run build

# If you are building your code for production
RUN npm pkg delete scripts.prepare && npm ci --omit=dev && npm cache clean --force

USER node


# PRODUCTION STAGE
FROM node:alpine As production


# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
