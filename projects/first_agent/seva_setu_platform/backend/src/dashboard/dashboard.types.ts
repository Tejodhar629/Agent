import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { ApplicationStatus } from '@prisma/client';
import { Scheme } from '../scheme/scheme.types';

registerEnumType(ApplicationStatus, {
  name: 'ApplicationStatus',
});

@ObjectType()
export class ChecklistItem {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  isCompleted: boolean;
}

@ObjectType()
export class ActionPlan {
  @Field(() => ID)
  id: string;

  @Field(() => [String])
  steps: string[];

  @Field(() => [String], { nullable: true })
  rejectionReasons?: string[];

  @Field(() => [ChecklistItem])
  checklist: ChecklistItem[];
}

@ObjectType()
export class SavedScheme {
  @Field(() => ID)
  id: string;

  @Field(() => Scheme)
  scheme: Scheme;

  @Field(() => ApplicationStatus)
  status: ApplicationStatus;

  @Field(() => ActionPlan, { nullable: true })
  actionPlan?: ActionPlan;

  @Field()
  savedAt: string;
}
