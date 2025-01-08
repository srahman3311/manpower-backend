import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Transform plain objects into DTO instances
      whitelist: true, // Strip unwanted fields
      forbidNonWhitelisted: true // Throw error for extra fields
    })
  )

  await app.listen(process.env.PORT ?? 5000);

}

bootstrap();
