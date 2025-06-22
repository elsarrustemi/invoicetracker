import { Field, Float, InputType } from "@nestjs/graphql";

@InputType()
export class CreatePaymentIntentInput {
    @Field(() => String)
    invoiceId: string;

    @Field(() => Float)
    amount: number;

    @Field(() => String, { nullable: true })
    currency?: string;
}   