import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Entity, ManyToOne, PrimaryColumn, Column, CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

@ObjectType()     // graphql type to convert class into graphql types
@Entity()
export class Comment extends BaseEntity {

  @Field(() => Int)        // remove if donot want to expose db attribute to graphql
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => Int)        // remove if donot want to expose db attribute to graphql
  @PrimaryColumn()
  userId!: number;
  
  @Field(() => Int)
  @PrimaryColumn()
  postId!: number;
  
  @Field()
  @PrimaryColumn()
  message!: string;

  @Field(() => String)        // remove if donot want to expose db attribute to graphql
  @Column()
  commenter!: string;


  @Field(() => User)
  @ManyToOne(() => User, user => user.comments)
  user!: User;

  @Field(() => Post)
  @ManyToOne(() => Post, post => post.comments)
  post!: Post;

  @Field(() => String)      // graphql type to convert class into graphql types
  @CreateDateColumn()
  createdAt: Date;
  
}