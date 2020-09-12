import { Request, Response } from 'express';
import { Redis } from 'ioredis';

export type MyContext = {
  req: Request & { session: Express.Session };    // & part added to basically tell ts that session is never undefined, since it is an optional param
  res: Response;
  redis: Redis;
}