import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { SavedScheme, ActionPlan } from './dashboard.types';
import { ApplicationStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Resolver()
export class DashboardResolver {
  constructor(private dashboardService: DashboardService) {}

  @Query(() => [SavedScheme], { name: 'mySavedSchemes' })
  @UseGuards(JwtAuthGuard)
  async mySavedSchemes(@CurrentUser() user: any) {
    const schemes = await this.dashboardService.getMySavedSchemes(user.sub);
    return schemes.map(ss => ({
      ...ss,
      savedAt: ss.savedAt.toISOString(),
      scheme: {
        ...ss.scheme,
        tags: ss.scheme.tags || [],
      },
    }));
  }

  @Mutation(() => SavedScheme)
  @UseGuards(JwtAuthGuard)
  async saveScheme(
    @CurrentUser() user: any,
    @Args('schemeId', { type: () => ID }) schemeId: string,
  ) {
    const ss = await this.dashboardService.saveScheme(user.sub, schemeId);
    return {
      ...ss,
      savedAt: ss.savedAt.toISOString(),
    };
  }

  @Mutation(() => SavedScheme)
  @UseGuards(JwtAuthGuard)
  async updateApplicationStatus(
    @Args('savedSchemeId', { type: () => ID }) savedSchemeId: string,
    @Args('status', { type: () => ApplicationStatus }) status: ApplicationStatus,
  ) {
    const ss = await this.dashboardService.updateApplicationStatus(savedSchemeId, status);
    return {
      ...ss,
      savedAt: ss.savedAt.toISOString(),
    };
  }

  @Mutation(() => ActionPlan)
  @UseGuards(JwtAuthGuard)
  async toggleChecklistItem(
    @Args('actionPlanId', { type: () => ID }) actionPlanId: string,
    @Args('itemName') itemName: string,
    @Args('isCompleted') isCompleted: boolean,
  ) {
    return this.dashboardService.toggleChecklistItem(actionPlanId, itemName, isCompleted);
  }
}
