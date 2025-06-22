import { ObjectType, Field, Float, ID } from '@nestjs/graphql';

@ObjectType()
export class PaymentIntent {
    @Field(() => ID)
    id: string;

    @Field(() => String)
    stripePaymentIntentId: string;

    @Field(() => String)
    clientSecret: string;

    @Field(() => Float)
    amount: number;

    @Field(() => String)
    currency: string;

    @Field(() => String)
    status: string;

    @Field(() => String)
    paymentMethodTypes: string;

    @Field(() => String, { nullable: true })
    description?: string;

    @Field(() => Date)
    createdAt: Date;

    @Field(() => Date)
    updatedAt: Date;

    @Field(() => Date, { nullable: true })
    paidAt?: Date;

    @Field(() => String, { nullable: true })
    paymentMethod?: string;

    @Field(() => String, { nullable: true })
    failureReason?: string;
}