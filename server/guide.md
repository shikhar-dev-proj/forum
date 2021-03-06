### Initial Setup
npm init -y
Have node, npm/yarn
yarn add -D @types/node typescript

#### Run local server after compilation
OPTION 1 (ts-node ---- slower) -> (start2 script)

yarn add -D ts-node
Check start2 script in package.json.

OPTION 2 (watch and node) -> (watch, start)

OPTION 3 (nodemon) -> (dev, dev2)
yarn add -D nodemon

#### microORM - SETUP
yarn add @mikro-orm/cli @mikro-orm/core @mikro-orm/migrations @mikro-orm/postgresql pg
Note: @mikro-orm/postgresql pg are optional and should be added if db of type postgres.

Visit mikro-orm.io for complete setup and migration scripts.

#### server setup
yarn add express apollo-server-express graphql type-graphql

db -> express
nice graphql endpoint -> apollo-server-express
schema -> graphql type-graphql

yarn add -D @types/express

The types don't come built in so install that for express.

yarn add reflect-metadata

visit localhost:port/graphql to see graphql toolkit

#### handling sessions with cookies

yarn add redis connect-redis express-session
yarn add -D @types/redis @types/express-session @connect-redis

run server with command:
redis-server

Remember to set request.credentials to 'include' to graphql playground to test this

We'll have a library for sessions, i.e. express-session. 
We'll use redis to store cookies (coz its fast) and the middleware supporting it is connect-redis

By setting userId to session object here: ""req.session.userId = user.id"": 
1. a KV is stored in redis
2. express-session sets a cookie to the browser using K in redis (signed version)
3. cookie goes in user's http request
4. browser unsigns the cookie to K using secret specified in config in index.ts
5. this K is then sent to redis to update probably.


#### CORS Middleware

yarn add cors
yarn add -D @types/cors

#### Nodemailer for forgot password

yarn add nodemailer
yarn add -D @types/nodemailer

checkout utils/sendEmail

For change-password url token, we'll rely on uuid:

yarn add uuid ioredis
yarn add -D @types/uuid @types/ioredis

We can remove redis from package.json by:

yarn remove redis


#### TypeORM Setup

yarn add typeorm

To create migrations:
npx typeorm migration:create -n FakePosts -d src/migrations 


#### SQL big query vs cached, batched fieldresolver queries using DATALOADER

yarn add dataloader

checkout server/utils/createUserLoader.ts
then see fieldResolver creator in Post resolver
it would cache and batch multiple userIds sent in request and query them in single SQL query.


#### env vars

checkout .env file for postgres url, redis url and port

yarn add dotenv-safe

create a .env.example file specifying the env params required. The above lib should be imported so that it throws error if any env param not present in .env that is there in example.

yarn add -D gen-env-types

Add a script to package.json to run: yarn <script-name>
This will generate env.d.ts file having types for the env params

Setting migrations for prod:

set synchronize to false in createConnection
comment previous migrations and do:

Setup ormconfig file:


npx typeorm migration:generate -n Initial

