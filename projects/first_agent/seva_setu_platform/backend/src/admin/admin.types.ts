import { ObjectType, Field, Int, InputType } from '@nestjs/graphql';
import { Scheme } from '../scheme/scheme.types';

@ObjectType()
export class PlatformMetrics {
  @Field(() => Int)
  dailyActiveUsers: number;

  @Field(() => Int)
  totalApplicationsTracked: number;

  @Field(() => [Scheme])
  topSearchedSchemes: Scheme[];
}

@InputType()
export class SchemeInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  ministry?: string;

  @Field({ nullable: true })
  officialLink?: string;

  @Field({ nullable: true })
  eligibilityCriteria?: string;

  @Field({ nullable: true })
  benefits?: string;

  @Field(() => [String], { nullable: 'itemsAndList' })
  documentsRequired?: string[];
}
