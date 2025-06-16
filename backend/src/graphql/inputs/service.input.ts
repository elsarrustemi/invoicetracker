import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateServiceInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  price: number;
}

@InputType()
export class UpdateServiceInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  price?: number;
}
