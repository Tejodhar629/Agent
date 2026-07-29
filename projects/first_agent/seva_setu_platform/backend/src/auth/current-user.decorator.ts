import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    // Extract User from GraphQL Context
    if ((context.getType() as string) === 'graphql') {
      const ctx = GqlExecutionContext.create(context);
      return ctx.getContext().req.user;
    }
    // Extract User from REST Request
    const request = context.switchToHttp().getRequest();
    return request.user;
  },
);
