import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Successfully connected to the PostgreSQL database via Prisma.');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🛑 Disconnected from the PostgreSQL database.');
  }
}
