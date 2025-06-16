import { Field, InputType } from '@nestjs/graphql';
import { InvoiceStatus } from '../types/invoice.type';

@InputType()
export class InvoiceItemInput {
  @Field()
  serviceId: string;

  @Field()
  quantity: number;

  @Field()
  price: number;

  @Field({ nullable: true })
  description?: string;
}

@InputType()
export class CreateInvoiceInput {
  @Field()
  clientId: string;

  @Field()
  number: string;

  @Field()
  date: Date;

  @Field()
  dueDate: Date;

  @Field(() => [InvoiceItemInput])
  items: InvoiceItemInput[];

  @Field({ nullable: true })
  contactEmail?: string;

  @Field({ nullable: true })
  billingAddress?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => InvoiceStatus, { nullable: true })
  status?: InvoiceStatus;
}

@InputType()
export class UpdateInvoiceInput {
  @Field({ nullable: true })
  clientId?: string;

  @Field({ nullable: true })
  date?: Date;

  @Field({ nullable: true })
  dueDate?: Date;

  @Field(() => InvoiceStatus, { nullable: true })
  status?: InvoiceStatus;

  @Field(() => [InvoiceItemInput], { nullable: true })
  items?: InvoiceItemInput[];

  @Field({ nullable: true })
  contactEmail?: string;

  @Field({ nullable: true })
  billingAddress?: string;

  @Field({ nullable: true })
  notes?: string;
}
