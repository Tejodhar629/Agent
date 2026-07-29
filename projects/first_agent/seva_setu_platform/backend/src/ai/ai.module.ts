import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { AiController } from './ai.controller';
import { ChatService } from './chat.service';
import { RAGService } from './rag.service';
import { AuthModule } from '../auth/auth.module';
import { PoolConfig } from 'pg';

@Module({
  imports: [AuthModule],
  controllers: [AiController],
  providers: [ChatService, RAGService],
  exports: [ChatService, RAGService],
})
export class AiModule implements OnModuleInit {
  private readonly logger = new Logger(AiModule.name);

  constructor(private readonly ragService: RAGService) {}

  async onModuleInit() {
    this.logger.log('Initializing Vector Store for RAG Pipeline...');
    
    // Parse DATABASE_URL for pgConfig or use fallback defaults
    const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/seva_setu_db?schema=public';
    const config: PoolConfig = { connectionString: dbUrl };
    
    try {
      // Uncomment in actual deployment once pgvector extension is added in the database
      // await this.ragService.initialize(config);
      this.logger.log('RAG Vector Store initialization stub complete.');
    } catch (e) {
      this.logger.warn('Could not initialize PGVectorStore. Please ensure pgvector is installed in Postgres.');
    }
  }
}
