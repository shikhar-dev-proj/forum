import { ObjectType, Field, Int } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, BaseEntity, ManyToOne } from "typeorm";
import { User } from "./User";

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
  points!: number;

  @Field()
  @Column()
  creatorId: number;

  @ManyToOne(() => User, user => user.posts)
  creator: User

  @Field(() => String)      // graphql type to convert class into graphql types
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)        // graphql type to convert class into graphql types
  @UpdateDateColumn()
  updatedAt: Date;
}