import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { PrismaService } from '../../prisma/prisma.service';
import { Client } from '../types/client.type';
import { CreateClientInput, UpdateClientInput } from '../inputs/client.input';

@Resolver(() => Client)
export class ClientResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => [Client])
  async clients() {
    return this.prisma.client.findMany();
  }

  @Query(() => Client)
  async client(@Args('id', { type: () => ID }) id: string) {
    return this.prisma.client.findUnique({
      where: { id },
    });
  }

  @Mutation(() => Client)
  async createClient(@Args('input') input: CreateClientInput) {
    return this.prisma.client.create({
      data: input,
    });
  }

  @Mutation(() => Client)
  async updateClient(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateClientInput,
  ) {
    return this.prisma.client.update({
      where: { id },
      data: input,
    });
  }

  @Mutation(() => Client)
  async deleteClient(@Args('id', { type: () => ID }) id: string) {
    return this.prisma.client.delete({
      where: { id },
    });
  }
}
