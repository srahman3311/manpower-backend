import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './global/filters/HttpException.filter';

async function bootstrap() {

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, "..", "public"));

  // EJS templating engine config
  app.setBaseViewsDir(join(__dirname, "..", "views"))
  app.setViewEngine("ejs")
 
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Transform plain objects into DTO instances
      whitelist: true, // Strip unwanted fields
      forbidNonWhitelisted: true // Throw error for extra fields
    })
  )

  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors({
    origin: ['http://localhost:5173', "https://manpower.nexoqod.com"],
    credentials: true
  });

  await app.listen(process.env.PORT ?? 5000);

}

bootstrap();
