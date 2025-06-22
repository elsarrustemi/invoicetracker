import { Args, Mutation, Resolver, Query, ID } from "@nestjs/graphql";
import { PaymentIntent } from "../types/stripe.type";
import { PrismaService } from "src/prisma/prisma.service";
import { CreatePaymentIntentInput } from "../inputs/payment-intent.input";
import Stripe from "stripe";

@Resolver(() => PaymentIntent)
export class PaymentResolver {
    constructor(private readonly prisma: PrismaService) {}

    @Query(() => [PaymentIntent])
    async paymentIntents() {
        return this.prisma.paymentIntent.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    @Query(() => PaymentIntent)
    async paymentIntent(@Args('id', { type: () => ID }) id: string) {
        return this.prisma.paymentIntent.findUnique({
            where: { id }
        });
    }

    @Query(() => [PaymentIntent])
    async paymentIntentsByInvoice(@Args('invoiceId', { type: () => ID }) invoiceId: string) {
        return this.prisma.paymentIntent.findMany({
            where: { invoice_id: invoiceId },
            orderBy: { createdAt: 'desc' }
        });
    }

    @Mutation(() => PaymentIntent)
    async createPaymentIntent(@Args('input') input: CreatePaymentIntentInput) {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error('STRIPE_SECRET_KEY is not configured');
        }

        const invoice = await this.prisma.invoice.findUnique({
            where: { id: input.invoiceId }
        });

        if (!invoice) {
            throw new Error(`Invoice with ID ${input.invoiceId} not found`);
        }
        
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const stripePaymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(input.amount * 100),
            currency: input.currency || 'usd',
            metadata: { invoiceId: input.invoiceId }
        });

        const defaultPaymentMethod = stripePaymentIntent.payment_method_types[0] || 'card';

        return this.prisma.paymentIntent.create({
            data: {
                stripePaymentIntentId: stripePaymentIntent.id,
                clientSecret: stripePaymentIntent.client_secret || '',
                amount: input.amount,
                currency: input.currency || 'usd',
                status: 'REQUIRES_PAYMENT_METHOD',
                paymentMethodTypes: 'card',
                paymentMethod: defaultPaymentMethod, 
                invoice_id: input.invoiceId
            },
        });
    }
}
