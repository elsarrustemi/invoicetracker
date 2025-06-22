import { Controller, Post, Req, Res, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

@Controller('webhooks')
export class StripeWebhookController {
  constructor(private prisma: PrismaService) {}

  @Post('stripe')
  async handleStripeWebhook(@Req() req: Request, @Res() res: Response) {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    try {
      const rawBody = (req as any).rawBody;
      event = stripe.webhooks.constructEvent(rawBody, sig as string, endpointSecret!);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(HttpStatus.BAD_REQUEST).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
        
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;
        
        case 'payment_intent.canceled':
          await this.handlePaymentCanceled(event.data.object as Stripe.PaymentIntent);
          break;
        
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Webhook processing failed' });
    }
  }

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    console.log('Payment succeeded:', paymentIntent.id);
    
    let paymentMethod = 'card'; 
    if (paymentIntent.payment_method) {
      try {
        const paymentMethodDetails = await stripe.paymentMethods.retrieve(paymentIntent.payment_method as string);
        paymentMethod = paymentMethodDetails.type;
      } catch (error) {
        console.log('Could not retrieve payment method details, using default');
      }
    }
    
    await this.prisma.paymentIntent.update({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: {
        status: 'SUCCEEDED',
        paidAt: new Date(),
        paymentMethod: paymentMethod,
      },
    });
      
    const invoiceId = paymentIntent.metadata.invoiceId;
    if (invoiceId) {
      await this.prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: 'PAID',
          paidAt: new Date(),
        },
      });
    }
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    console.log('Payment failed:', paymentIntent.id);
    
    await this.prisma.paymentIntent.update({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: {
        status: 'CANCELED',
        failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
      },
    });
  }

  private async handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
    console.log('Payment canceled:', paymentIntent.id);
    
    await this.prisma.paymentIntent.update({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: {
        status: 'CANCELED',
        failureReason: 'Payment was canceled',
      },
    });
  }
} 