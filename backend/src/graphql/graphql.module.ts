import { Module } from '@nestjs/common';
import { ClientResolver } from './resolvers/client.resolver';
import { ServiceResolver } from './resolvers/service.resolver';
import { InvoiceResolver } from './resolvers/invoice.resolver';

@Module({
  providers: [ClientResolver, ServiceResolver, InvoiceResolver],
})
export class GraphQLModule {}
