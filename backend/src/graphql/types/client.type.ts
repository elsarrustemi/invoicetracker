import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Client {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  address?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
