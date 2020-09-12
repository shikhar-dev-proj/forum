import { Resolver, Query, Arg, Mutation, InputType, Field, Ctx, UseMiddleware } from 'type-graphql';
import { Post } from '../entities/Post';
import { MyContext } from 'src/types';
import { isAuth } from '../middleware/isAuth';

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@Resolver()
export class PostResolver {

  @Query(() => [Post])        // Query --> for getting data
  posts(): Promise<Post[]> {
    return Post.find();
  }

  @Query(() => Post, { nullable: true })
  post(
    @Arg('id') id: number
  ): Promise<Post | undefined> {
    return Post.findOne(id);
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
  async updatePost(
    @Arg('id') id: number,
    @Arg('title', () => String, { nullable: true }) title: string        // mention graphql type if nullable is true
  ): Promise<Post | null> {
    const post = await Post.findOne(id);
    if (!post) {
      return null;
    }
    if (typeof title !== 'undefined') {
      post.title = title;
      await Post.update({ id }, { title });
    }
    return post;
  }

  @Mutation(() => Boolean)       // Mutation --> for updating/inserting/deleting data
  async deletePost(
    @Arg('id') id: number
  ): Promise<boolean> {
    try {
      await Post.delete(id);
    } catch {
      return false;
    }
    return true;
  }
}     