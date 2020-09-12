import { Resolver, Mutation, Field, Arg, Ctx, ObjectType, Query } from 'type-graphql';
import { MyContext } from '../types';
import { User } from '../entities/User';
import argon2 from 'argon2';
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from '../constants';
import { UsernamePasswordInput } from '../models/UsernamePasswordInput';
import { validateRegister } from '../utils/validateRegister';
import { sendEmail } from '../utils/sendEmail';
import { v4 } from 'uuid';
import { getConnection } from 'typeorm';

@ObjectType() 
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {

  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    // not logged in!
    if (!req.session.userId) {
      return null;
    }
    return User.findOne(req.session.userId);
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 2) {
      return { 
        errors: [
          {
            field: 'newPassword',
            message: 'length must be greater than 2'
          }
        ]
      }
    }

    const key = FORGOT_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);

    if (!userId) {
      return {
        errors: [
          {
            field: 'token',
            message: 'token expired'
          }
        ]
      };
    }
    const userIdNum = parseInt(userId);
    const user = await User.findOne(userIdNum);

    if (!user) {
      return {
        errors: [
          {
            field: 'token',
            message: 'user does not exist'
          }
        ]
      };
    }

    await User.update(
      { id: userIdNum }, 
      { 
        password: await argon2.hash(newPassword)
      }
    );

    await redis.del(key);

    // login user after password update
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { redis }: MyContext
  ) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return false;
    }

    const token = v4();

    await redis.set(
      FORGOT_PASSWORD_PREFIX + token,
      user.id,
      'ex',
      1000 * 60 * 60 * 24 * 5
    );  // forgot password token expiry set to 5 days

    await sendEmail(
      user.email,
      `<a href="http://localhost:3000/change-password/${token}">reset password</a>`
    )
    return true;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { req }: MyContext 
  ): Promise<UserResponse> {

    const errors = validateRegister(options);

    if (errors) {
      return { errors };
    }
    
    const hashedPassword = await argon2.hash(options.password);
    // const user = em.create(User, { 
    //   username: options.username,
    //   password: hashedPassword
    // });
    let user;
    try {
      // another way to create instead of using Create({}).save()
      const result = await getConnection().createQueryBuilder().insert().into(User).values({
        username: options.username,
        password: hashedPassword,
        email: options.email
      })
      .returning('*')
      .execute();
      user = result.raw[0];      
      // await em.persistAndFlush(user);
    } catch(err) {
      if (err.code === '23505') {
        // duplicate error
        return {
          errors: [{
            field: 'username',
            message: 'Username already taken.'
          }]
        }
      }
      console.log('error: ', err.message);
    }

    // login the user by storing userId in cookie
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() { req }: MyContext 
  ): Promise<UserResponse> {
    const user = await User.findOne(
      usernameOrEmail.includes('@') ?
      { where: { email: usernameOrEmail } } 
      : { where: { username: usernameOrEmail } });
    if (!user) {
      return {
        errors: [{
          field: 'usernameOrEmail',
          message: 'That username doesn\'t exist'
        }]
      }
    }
    const isValid = await argon2.verify(user.password, password);
    if (!isValid) {
      return {
        errors: [{
          field: 'password',
          message: 'Incorrect Password'
        }]
      }
    }

    req.session.userId = user.id;

    return {
      user
    };
  }

  @Mutation(() => Boolean)
  logout(
    @Ctx() {req, res}: MyContext
  ) {
    return new Promise(resolve => req.session.destroy(err => {
      res.clearCookie(COOKIE_NAME);
      if (err) {
        console.log(err);
        resolve(false);
        return;
      }
      resolve(true);
    }))
  }
}