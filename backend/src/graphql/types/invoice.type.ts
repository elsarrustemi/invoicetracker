import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Client } from './client.type';
import { Service } from './service.type';

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

registerEnumType(InvoiceStatus, {
  name: 'InvoiceStatus',
});

@ObjectType()
export class Invoice {
  @Field(() => ID)
  id: string;

  @Field()
  number: string;

  @Field()
  date: Date;

  @Field()
  dueDate: Date;

  @Field()
  total: number;

  @Field(() => InvoiceStatus)
  status: InvoiceStatus;

  @Field(() => Client)
  client: Client;

  @Field(() => [InvoiceItem])
  items: InvoiceItem[];

  @Field({ nullable: true })
  contactEmail?: string;

  @Field({ nullable: true })
  billingAddress?: string;

  @Field({ nullable: true })
  notes?: string;
}

@ObjectType()
export class InvoiceItem {
  @Field(() => ID)
  id: string;

  @Field()
  quantity: number;

  @Field()
  price: number;

  @Field()
  total: number;

  @Field(() => Service)
  service: Service;

  @Field(() => Invoice)
  invoice: Invoice;

  @Field({ nullable: true })
  description?: string;
}
