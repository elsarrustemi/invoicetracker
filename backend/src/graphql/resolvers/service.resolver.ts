import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { PrismaService } from '../../prisma/prisma.service';
import { Service } from '../types/service.type';
import {
  CreateServiceInput,
  UpdateServiceInput,
} from '../inputs/service.input';

@Resolver(() => Service)
export class ServiceResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => [Service])
  async services() {
    return this.prisma.service.findMany();
  }

  @Query(() => Service)
  async service(@Args('id', { type: () => ID }) id: string) {
    return this.prisma.service.findUnique({
      where: { id },
    });
  }

  @Mutation(() => Service)
  async createService(@Args('input') input: CreateServiceInput) {
    return this.prisma.service.create({
      data: input,
    });
  }

  @Mutation(() => Service)
  async updateService(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateServiceInput,
  ) {
    return this.prisma.service.update({
      where: { id },
      data: input,
    });
  }

  @Mutation(() => Service)
  async deleteService(@Args('id', { type: () => ID }) id: string) {
    return this.prisma.service.delete({
      where: { id },
    });
  }
}
