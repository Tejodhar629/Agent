import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Scheme {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  ministry?: string;

  @Field(() => [String], { nullable: 'itemsAndList' })
  tags?: string[];

  @Field({ nullable: true })
  officialLink?: string;

  @Field({ nullable: true })
  eligibilityCriteria?: string;

  @Field({ nullable: true })
  benefits?: string;

  @Field(() => [String], { nullable: 'itemsAndList' })
  documentsRequired?: string[];
}
