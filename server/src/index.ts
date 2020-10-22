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
import 'dotenv-safe/config';
import { isProd, COOKIE_NAME } from './constants';
import cors from 'cors';
import {createConnection} from 'typeorm';
import { Post } from './entities/Post';
import { User } from './entities/User';
import path from 'path';
import { Upvote } from './entities/Upvote';
import { createUserLoader } from './utils/createUserLoader';
import { createUpvoteLoader } from './utils/createUpvoteLoader';
import { Comment } from './entities/Comment';
//rerun


const main = async () => {
  const connection = await createConnection({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    logging: true,
    migrations: [path.join(__dirname, './migrations/*')],
    synchronize: true,   // creates tables automatically, no need to run migrations, but not in prod?
    entities: [Comment, Post, User, Upvote]
  });

  await connection.runMigrations();

  // const post = orm.em.create(Post, { title: 'first post' });
  // await orm.em.persistAndFlush(post);
  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis(process.env.REDIS_URL);

  app.set('trust proxy', 1); // telling express there is a proxy sitting in front (nginx)
  app.use(cors({
    origin: process.env.CORS_ORIGIN,
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
        secure: isProd, // cookie only works in https
        domain: isProd ? '.shkdev.xyz' : undefined
      },
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET,
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false
    }),
    context: ({ req, res }) => ({
      req, 
      res, 
      redis,
      userLoader: createUserLoader(),
      upvoteLoader: createUpvoteLoader()
    })     // special object available for all resolvers
  });

  apolloServer.applyMiddleware({ app, cors: false });
  app.listen(parseInt(process.env.PORT), () => {
    console.log('Server started on localhost:4002');
  });
}

main().catch(err => {
  console.error(err);
});
