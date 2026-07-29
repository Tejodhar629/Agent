import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ConsultationService } from './consultation.service';
import { Consultant, Consultation } from './consultation.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Resolver()
export class ConsultationResolver {
  constructor(private consultationService: ConsultationService) {}

  @Query(() => [Consultant], { name: 'getConsultants' })
  async getConsultants(
    @Args('specialty', { nullable: true }) specialty?: string,
    @Args('state', { nullable: true }) state?: string,
  ) {
    return this.consultationService.getConsultants(specialty, state);
  }

  @Query(() => Consultation, { name: 'getConsultationDetails', nullable: true })
  @UseGuards(JwtAuthGuard)
  async getConsultationDetails(@Args('id', { type: () => ID }) id: string) {
    const c = await this.consultationService.getConsultationDetails(id);
    if (!c) return null;
    return {
      ...c,
      scheduledAt: c.scheduledAt.toISOString(),
    };
  }

  @Mutation(() => Consultation)
  @UseGuards(JwtAuthGuard)
  async bookConsultation(
    @CurrentUser() user: any,
    @Args('consultantId', { type: () => ID }) consultantId: string,
    @Args('scheduledAt') scheduledAt: string,
  ) {
    const c = await this.consultationService.bookConsultation(user.sub, consultantId, scheduledAt);
    return {
      ...c,
      scheduledAt: c.scheduledAt.toISOString(),
    };
  }

  @Mutation(() => Consultation)
  @UseGuards(JwtAuthGuard)
  async cancelConsultation(
    @CurrentUser() user: any,
    @Args('consultationId', { type: () => ID }) consultationId: string,
  ) {
    const c = await this.consultationService.cancelConsultation(consultationId, user.sub);
    return {
      ...c,
      scheduledAt: c.scheduledAt.toISOString(),
    };
  }
}
