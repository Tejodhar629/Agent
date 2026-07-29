import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { PlatformMetrics, SchemeInput } from './admin.types';
import { Scheme } from '../scheme/scheme.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Resolver()
export class AdminResolver {
  constructor(private adminService: AdminService) {}

  @Query(() => PlatformMetrics, { name: 'getPlatformMetrics' })
  @UseGuards(JwtAuthGuard)
  async getPlatformMetrics(@CurrentUser() user: any) {
    const metrics = await this.adminService.getPlatformMetrics(user.sub, user.role);
    return {
      dailyActiveUsers: metrics.dailyActiveUsers,
      totalApplicationsTracked: metrics.totalApplicationsTracked,
      topSearchedSchemes: metrics.topSearchedSchemes.map(s => ({
        ...s,
        tags: s.tags || [],
      }))
    };
  }

  @Mutation(() => Scheme, { name: 'updateScheme' })
  @UseGuards(JwtAuthGuard)
  async updateScheme(
    @CurrentUser() user: any,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: SchemeInput,
  ) {
    const s = await this.adminService.updateScheme(id, input, user.role);
    return {
      ...s,
      tags: s.tags || [],
    };
  }
}
