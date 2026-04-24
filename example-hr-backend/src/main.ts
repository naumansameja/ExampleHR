import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  const rawPort = process.env.PORT;
  const port =
    rawPort === undefined || rawPort === ''
      ? 3000
      : Number.parseInt(rawPort, 10);
  if (Number.isNaN(port) || port < 1 || port > 65535) {
    throw new Error(
      `PORT must be between 1 and 65535, got: ${JSON.stringify(rawPort)}`,
    );
  }
  await app.listen(port);
}
bootstrap();
