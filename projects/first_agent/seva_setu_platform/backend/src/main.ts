import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend applications (Web and Admin)
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // Global prefix for REST APIs
  app.setGlobalPrefix('v1');

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);
  console.log(`🚀 Application is running on: http://localhost:${PORT}`);
  console.log(`📊 GraphQL Playground available at: http://localhost:${PORT}/graphql`);
}
bootstrap();
