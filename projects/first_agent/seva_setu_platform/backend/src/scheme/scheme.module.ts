import { Module } from '@nestjs/common';
import { SchemeService } from './scheme.service';
import { SchemeController } from './scheme.controller';
import { SchemeResolver } from './scheme.resolver';

@Module({
  imports: [],
  controllers: [SchemeController],
  providers: [SchemeService, SchemeResolver],
  exports: [SchemeService, SchemeResolver]
})
export class SchemeModule {}
