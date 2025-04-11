<p align="center">
  <a href="http://devapi.klubiq.com/" target="blank"><img src="https://bucket.mailersendapp.com/neqvygmrw5l0p7w2/z3m5jgrm6nx4dpyo/images/9be53249-1ae4-48a9-be3f-ad58c19f2dcf.png" width="200" alt="Klubiq Logo" /></a>
</p>


## Description

[Klubiq](https://github.com/glumia-ltd/klubiq-api) API repository written with [NestJS](https://github.com/nestjs/nest) Framework.

## Project Structure

We are using a monorepo nestjs structure. These are important folders to take note of:
- .github (Here we have our github actions for CICD)
- apps (Here we have our core applications running NestJs)
  - klubiq-dashboard (This is our standalone main api project running in port: 3000)
  - klubiq-queue (This is our standalone jobs and queue project using BullMQ running in port: 3001)
- klubiq-db (This is a different project for database-TypeOrm. This project is not running live, it's used to track database changes for database migrations)
- libs (This is our library folder with different libraries that are shared across our projects)
  - auth => for auth business logics
  - common => for common business logics used across our apps
  - notifications => for notification business logics
  - schedulers => for scheduled jobs

## Getting your workspace ready
The following steps are required before you can start the application. 
 1. Make sure to have postgresql and PgAdmin installed on your PC.
 2. Create the following on your local instance:
  - Database: klubiq
  - Schemas: kdo, and poo.
  - Create a login user for your database. You will need this for the environment variables
 2. Create ```config.json``` and ```.env``` file at the root folder of the project 
 3. Retrieve environment variables, config values and other SQL scripts needed from your lead
 4. If you don't have redis running locally on your PC, download [docker dektop](htps://www.docker.com/products/docker-desktop/) so you can run redis in docker
 5. Create a ```docker-compose.yaml``` file at the root folder of the project. This is to run redis locally. Add the following scripts to the file:
  ```
  services:
    redis:
      container_name: cache
      image: redis
      ports:
        - 6379:6379
      volumes:
        - redis:/data
  volumes:
    redis:
      driver: local
  ```
  then execute this command: ```docker compose up -d```

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development mode - dashboard  project only
$ npm run start:dashboard

# development mode - queue  project only
$ npm run start:queue

# watch mode - both queue and dashboard project will run together
$ npm run start:allDev

# production mode - dashboard project
$ npm run start:prod

# production mode - Queue project
$ npm run start:queue:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

