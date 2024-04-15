
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

RUN npm run build ${APP}



# Use the latest Node.js version
FROM node:alpine As production

ARG ENV=production
ENV ENV=${ENV}

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./


# If you are building your code for production
RUN npm pkg delete scripts.prepare && npm ci --omit=dev
#RUN npm ci --only=production

# Bundle app source
COPY --from=development /usr/src/app/dist ./dist

EXPOSE 3000

# Add an env to save ARG
ENV APP_MAIN_FILE=dist/apps/${APP}/main 

# Define the command to run your app using CMD which defines your runtime
# Here we will use the nest command to start the server
CMD node ${APP_MAIN_FILE}