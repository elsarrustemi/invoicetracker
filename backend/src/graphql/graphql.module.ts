import { Module } from '@nestjs/common';
import { ClientResolver } from './resolvers/client.resolver';
import { ServiceResolver } from './resolvers/service.resolver';
import { InvoiceResolver } from './resolvers/invoice.resolver';
import { PaymentResolver } from './resolvers/payment.resolver';

@Module({
  providers: [ClientResolver, ServiceResolver, InvoiceResolver, PaymentResolver],
})
export class GraphQLModule {}
