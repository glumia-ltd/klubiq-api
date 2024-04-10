
# Use the latest Node.js version
FROM node:latest

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

# NestJS uses port 3000 by default
EXPOSE 3000

# Define the command to run your app using CMD which defines your runtime
# Here we will use the nest command to start the server
CMD [ "npm", "run", "start" ]