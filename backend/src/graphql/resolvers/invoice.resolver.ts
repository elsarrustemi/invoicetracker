import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { PrismaService } from '../../prisma/prisma.service';
import { Invoice, InvoiceItem } from '../types/invoice.type';
import {
  CreateInvoiceInput,
  UpdateInvoiceInput,
} from '../inputs/invoice.input';

@Resolver(() => Invoice)
export class InvoiceResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => [Invoice])
  async invoices() {
    return this.prisma.invoice.findMany({
      include: {
        client: true,
        items: {
          include: {
            service: true,
          },
        },
      },
    });
  }

  @Query(() => Invoice)
  async invoice(@Args('id', { type: () => ID }) id: string) {
    return this.prisma.invoice.findUnique({
      where: { id },
      include: {
        client: true,
        items: {
          include: {
            service: true,
          },
        },
      },
    });
  }

  @Mutation(() => Invoice)
  async createInvoice(@Args('input') input: CreateInvoiceInput) {
    const { clientId, items, ...invoiceData } = input;

    return this.prisma.invoice.create({
      data: {
        ...invoiceData,
        client: {
          connect: { id: clientId },
        },
        contactEmail: invoiceData.contactEmail,
        billingAddress: invoiceData.billingAddress,
        notes: invoiceData.notes,
        paymentMethod: 'card',
        items: {
          create: items.map((item) => ({
            quantity: item.quantity,
            price: item.price,
            total: item.quantity * item.price,
            description: item.description,
            service: {
              connect: { id: item.serviceId },
            },
          })),
        },
        total: items.reduce((sum, item) => sum + item.quantity * item.price, 0),
      },
      include: {
        client: true,
        items: {
          include: {
            service: true,
          },
        },
      },
    });
  }

  @Mutation(() => Invoice)
  async updateInvoice(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateInvoiceInput,
  ) {
    const { clientId, items, ...invoiceData } = input;

    const data: any = {
      ...invoiceData,
      contactEmail: invoiceData.contactEmail,
      billingAddress: invoiceData.billingAddress,
      notes: invoiceData.notes,
    };

    if (invoiceData.paymentMethod) {
      data.paymentMethod = invoiceData.paymentMethod;
    }

    if (clientId) {
      data.client = { connect: { id: clientId } };
    }

    if (items) {
      await this.prisma.invoiceItem.deleteMany({
        where: { invoiceId: id },
      });

      data.items = {
        create: items.map((item) => ({
          quantity: item.quantity,
          price: item.price,  
          total: item.quantity * item.price,
          description: item.description,
          service: {
            connect: { id: item.serviceId },
          },
        })),
      };

      data.total = items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0,
      );
    }

    return this.prisma.invoice.update({
      where: { id },
      data,
      include: {
        client: true,
        items: {
          include: {
            service: true,
          },
        },
      },
    });
  }

  @Mutation(() => Invoice)
  async deleteInvoice(@Args('id', { type: () => ID }) id: string) {
    await this.prisma.invoiceItem.deleteMany({
      where: { invoiceId: id },
    });

    return this.prisma.invoice.delete({
      where: { id },
    });
  }
}
