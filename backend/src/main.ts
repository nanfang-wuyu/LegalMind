import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Enable CORS
  app.enableCors({
    origin: '*', // Allow all origins for now
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });
  logger.log('CORS has been enabled for all origins');

  // Set global prefix
  app.setGlobalPrefix('api');
  logger.log('Global prefix set to /api');
  
  await app.listen(3001);
  logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
