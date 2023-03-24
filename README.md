## Installation

```bash
$ yarn install
```
#### Create a .env file in the root directory and add the following variables
##### create .env.test file in the root directory and add same variables as .env file
```bash
DATABASE_URL="postgresql://{POSTGERS_USER}:{POSTGRES_PASSWORD}@localhost:5434/nest?schema=public"
ACCESS_TOKEN_SECRET
REFRESH_TOKEN_SECRET
POSTGERS_USER
POSTGRES_PASSWORD
```
## Running the app

```bash
# create database in container and run migrations
$ yarn db:dev:restart


# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash

# e2e tests
# create database in container and run migrations
$ yarn db:test:restart

$ yarn run test:e2e

```
