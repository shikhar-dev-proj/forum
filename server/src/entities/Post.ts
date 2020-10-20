import { ObjectType, Field, Int } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, BaseEntity, ManyToOne, OneToMany } from "typeorm";
import { User } from "./User";
import { Upvote } from "./Upvote";

@ObjectType()     // graphql type to convert class into graphql types
@Entity()
export class Post extends BaseEntity {

  @Field(() => Int)        // remove if donot want to expose db attribute to graphql
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()      // graphql type to convert class into graphql types
  @Column()
  title!: string;

  @Field()
  @Column()
  text!: string;

  @Field()
  @Column({ type: 'int', default: 0 })
  ups!: number;

  @Field()
  @Column({ type: 'int', default: 0 })
  downs!: number;

  @Field()
  @Column()
  creatorId: number;

  @Field(() => Int, { nullable: true })
  voteStatus: number | null;  // 1, -1 or null

  @Field()
  @ManyToOne(() => User, user => user.posts)
  creator: User;

  @OneToMany(() => Upvote, upvote => upvote.post)
  upvotes: Upvote[];

  @Field(() => String)      // graphql type to convert class into graphql types
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)        // graphql type to convert class into graphql types
  @UpdateDateColumn()
  updatedAt: Date;
}