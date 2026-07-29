import { ObjectType, Field, ID, Int, Float, InputType, registerEnumType } from '@nestjs/graphql';
import { Role } from '@prisma/client';

// Register Prisma Enum with GraphQL
registerEnumType(Role, {
  name: 'Role',
});

@ObjectType()
export class Profile {
  @Field(() => ID)
  id: string;

  @Field(() => Int, { nullable: true })
  age?: number;

  @Field({ nullable: true })
  gender?: string;

  @Field({ nullable: true })
  state?: string;

  @Field({ nullable: true })
  casteCategory?: string;

  @Field(() => Float, { nullable: true })
  annualIncome?: number;

  @Field({ nullable: true })
  occupation?: string;

  @Field({ nullable: true })
  disabilityStatus?: boolean;
}

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  mobile?: string;

  @Field({ nullable: true })
  email?: string;

  @Field(() => Role)
  role: Role;

  @Field(() => Profile, { nullable: true })
  profile?: Profile;
}

@InputType()
export class ProfileInput {
  @Field(() => Int, { nullable: true })
  age?: number;

  @Field({ nullable: true })
  gender?: string;

  @Field({ nullable: true })
  state?: string;

  @Field({ nullable: true })
  casteCategory?: string;

  @Field(() => Float, { nullable: true })
  annualIncome?: number;

  @Field({ nullable: true })
  occupation?: string;

  @Field({ nullable: true })
  disabilityStatus?: boolean;
}
