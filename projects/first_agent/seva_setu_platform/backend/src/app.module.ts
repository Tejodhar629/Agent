import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AiModule } from './ai/ai.module';
import { SchemeModule } from './scheme/scheme.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PaymentModule } from './payment/payment.module';
import { ConsultationModule } from './consultation/consultation.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    AiModule,
    SchemeModule,
    DashboardModule,
    PaymentModule,
    ConsultationModule,
    AdminModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true, // Enable GraphQL Playground for testing
      path: '/graphql', // Dedicated endpoint matching API Specs
      context: ({ req }) => ({ req }), // Provide req object to context for auth guards
      formatError: (error) => {
        // Simple error formatting for Apollo
        const originalError = error.extensions?.originalError as any;
        if (originalError?.error) {
          return originalError; // Pass through standardized REST/GraphQL errors
        }
        return error;
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
