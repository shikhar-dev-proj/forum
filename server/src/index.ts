import 'reflect-metadata';
import express from 'express'; 
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql'; 
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { isProd, COOKIE_NAME } from './constants';
import cors from 'cors';
import {createConnection} from 'typeorm';
import { Post } from './entities/Post';
import { User } from './entities/User';

const RedisStore = connectRedis(session);
const redis = new Redis();

const main = async () => {
  const connection = await createConnection({
    type: 'postgres',
    database: 'boilerplatedb',
    username: 'shikharsharma',
    logging: true,
    synchronize: true,   // creates tables automatically, no need to run migrations
    entities: [Post, User]
  });

  // const post = orm.em.create(Post, { title: 'first post' });
  // await orm.em.persistAndFlush(post);
  const app = express();

  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
  }));

  // before setting apolloServer intentionally
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({ 
        client: redis,
        disableTTL: true,
        disableTouch: true    // set it to false in case you wanna add TTLs to cookies
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,    // 10 years
        httpOnly: true,
        sameSite: 'lax', // csrf, look it up
        secure: isProd // cookie only works in https
      },
      saveUninitialized: false,
      secret: 'xfcgvjhbkjnlk',
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false
    }),
    context: ({ req, res }) => ({ req, res, redis })     // special object available for all resolvers
  });

  apolloServer.applyMiddleware({ app, cors: false });
  app.listen(4002, () => {
    console.log('Server started on localhost:4002');
  });
}

main().catch(err => {
  console.error(err);
});
