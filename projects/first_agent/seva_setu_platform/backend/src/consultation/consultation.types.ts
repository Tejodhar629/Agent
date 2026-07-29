import { ObjectType, Field, ID, Float, registerEnumType } from '@nestjs/graphql';
import { ConsultationStatus } from '@prisma/client';
import { User } from '../user/user.types';

registerEnumType(ConsultationStatus, {
  name: 'ConsultationStatus',
});

@ObjectType()
export class Consultant {
  @Field(() => ID)
  id: string;

  @Field(() => User)
  user: User;

  @Field(() => [String])
  specialties: string[];

  @Field(() => Float, { nullable: true })
  rating?: number;

  @Field(() => Float)
  hourlyRate: number;

  @Field()
  isVerified: boolean;
}

@ObjectType()
export class Consultation {
  @Field(() => ID)
  id: string;

  @Field(() => User)
  citizen: User;

  @Field(() => Consultant)
  consultant: Consultant;

  @Field()
  scheduledAt: string;

  @Field(() => ConsultationStatus)
  status: ConsultationStatus;

  @Field({ nullable: true })
  meetingLink?: string;
}
