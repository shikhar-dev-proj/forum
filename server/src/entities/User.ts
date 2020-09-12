import { ObjectType, Field, Int } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, UpdateDateColumn, BaseEntity, OneToMany } from "typeorm";
import { Post } from "./Post";

@ObjectType()     // graphql type to convert class into graphql types
@Entity()
export class User extends BaseEntity {

  @Field(() => Int)        // remove if donot want to expose db attribute to graphql
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()      // graphql type to convert class into graphql types
  @Column({ unique: true })
  username!: string;

  @Field()      // graphql type to convert class into graphql types
  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @OneToMany(() => Post, post => post.creator)
  posts: Post[];

  @Field(() => String)      // graphql type to convert class into graphql types
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)        // graphql type to convert class into graphql types
  @UpdateDateColumn()
  updatedAt: Date;
}