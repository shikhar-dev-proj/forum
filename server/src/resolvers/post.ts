import { Resolver, Query, Arg, Mutation, InputType, Field, Ctx, UseMiddleware, Int, FieldResolver, Root, ObjectType } from 'type-graphql';
import { Post } from '../entities/Post';
import { MyContext } from 'src/types';
import { isAuth } from '../middleware/isAuth';
import { getConnection } from 'typeorm';
import { Upvote } from '../entities/Upvote';
import { User } from '../entities/User';
import { Downvote } from '../entities/Downvote';
// import { Upvote } from '../entities/Upvote';

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {

  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50).concat('...');
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() post: Post,
    @Ctx() { upvoteLoader, req }: MyContext
  ) {
    if (!req.session.userId) {
      return null;
    }
    const upvote = await upvoteLoader.load({ postId: post.id, userId: req.session.userId });

    return upvote ? upvote.value : null;
  }

  @FieldResolver(() => User)
  creator(
    @Root() post: Post,
    @Ctx() { userLoader }: MyContext
  ) {
    return userLoader.load(post.creatorId);
  }


  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg('postId', () => Int) postId: number,
    @Arg('value', () => Int) value: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const {userId} = req.session;
    const isUpvote = value !== -1;
    const realValue = isUpvote ? 1 : -1
    // await Upvote.insert({
    //   userId,
    //   postId,
    //   value: realValue
    // });

    const upvote = await Upvote.findOne({ where: { postId, userId }});
    // const downvote = await Downvote.findOne({ where: { postId, userId }});

    // const hasVoted = !!(upvote || downvote);


    if (upvote && upvote.value !== realValue) {
      // changing vote
      await getConnection().transaction(async (tm) => {

        await tm.query(`
          update upvote
          set value = $1
          where "postId" = $2 and "userId" = $3
        `, [realValue, postId, userId]);

        await tm.query(`
          update post
          set points = points + $1
          where id = $2
        `, [2 * realValue, postId]);
      });
    } else if (!upvote) {
      // no previous vote for this post

      await getConnection().transaction(async (tm) => {

        await tm.query(`
          insert into upvote ("userId", "postId", value)
          values ($1, $2, $3)
        `, [userId, postId, realValue]);

        await tm.query(`
          update post
          set points = points + $1
          where id = $2
        `, [realValue, postId]);
      });
    }

    const post = await Post.findOne(postId);
    console.log(post);

    return true;
  }

  @Query(() => PaginatedPosts)        // Query --> for getting data
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true}) cursor: string | null
  ): Promise<PaginatedPosts> {
    const maxLimit = Math.min(50, limit);
    const maxLimitPlusOne = maxLimit + 1;

    const replacements: any[] = [maxLimitPlusOne];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const posts = await getConnection().query(`
      select p.*
      from post p
      ${cursor ? `where p."createdAt" < $2` : ''}
      order by p."createdAt" DESC
      limit $1
    `, replacements);

    // const qb = getConnection()
    // .getRepository(Post)
    // .createQueryBuilder("p")
    // .innerJoinAndSelect("p.creator", "u", 'u.id = p."creatorId"')
    // .orderBy('p."createdAt"', 'DESC')
    // .take(maxLimitPlusOne)

    // if (cursor) {
    //   qb.where('p."createdAt" < :cursor', { cursor:  new Date(parseInt(cursor))})
    // }

    // const posts = await qb.getMany();
    return { 
      posts: posts.slice(0, maxLimit),
      hasMore: posts.length === maxLimitPlusOne
    };
  }

  @Query(() => Post, { nullable: true })
  post(
    @Arg('id', () => Int) id: number
  ): Promise<Post | undefined> {
    return Post.findOne(id);    // typeorm would do a left join sql internally to fetch creator, if { relations: ['creator'] } is passed too
  }

  @Mutation(() => Post)       // Mutation --> for updating/inserting/deleting data
  @UseMiddleware(isAuth)
  async createPost(
    @Arg('input') input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({
      ...input,
      creatorId: req.session.userId
    }).save();
  }
  
  @Mutation(() => Post, { nullable: true })       // Mutation --> for updating/inserting/deleting data
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg('id', () => Int) id: number,
    @Arg('title') title: string,        // mention graphql type if nullable is true
    @Arg('text') text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('id = :id and "creatorId" = :creatorId', { id, creatorId: req.session.userId })
      .returning('*')
      .execute();

    return result.raw[0];
  }

  @Mutation(() => Boolean)       // Mutation --> for updating/inserting/deleting data
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg('id', () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const post = await Post.findOne({ id });
    if (!post) {
      return false;
    }
    if (post.creatorId !== req.session.userId) {
      throw new Error('not authorised to delete post');
    }
    await Upvote.delete({ postId: id });
    await Post.delete({ id });
    return true;
  }
}