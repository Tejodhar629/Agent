import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { User, ProfileInput } from './user.types';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User, { name: 'me', description: 'Fetch the logged-in User and their dynamic profile' })
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: any) {
    return this.userService.getUserById(user.sub);
  }

  @Mutation(() => User, { description: 'Upsert dynamic demographic profile parameters' })
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser() user: any,
    @Args('input') input: ProfileInput,
  ) {
    return this.userService.updateProfile(user.sub, input);
  }
}
