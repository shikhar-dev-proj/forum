import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Entity, ManyToOne, PrimaryColumn, Column } from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

@ObjectType()     // graphql type to convert class into graphql types
@Entity()
export class Downvote extends BaseEntity {

  @Field(() => Int)        // remove if donot want to expose db attribute to graphql
  @PrimaryColumn()
  userId!: number;
  
  @Field(() => Int)
  @PrimaryColumn()
  postId!: number;

  @Field()
  @Column({ type: 'int'})
  value: number;

  @Field(() => User)
  @ManyToOne(() => User, user => user.downvotes)
  user!: User;

  @Field(() => Post)
  @ManyToOne(() => Post, post => post.downvotes)
  post!: Post;
  
}