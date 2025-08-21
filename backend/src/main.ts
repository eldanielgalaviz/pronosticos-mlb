import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Opcional: validación global
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Obtener puerto desde ConfigService (mapear a number) o fallback a process.env o 3000
  const configService = app.get(ConfigService);
  const portEnv = configService?.get<string>('PORT') ?? process.env.PORT;
  const port = Number(portEnv) || 3000;

  await app.listen(port);
  console.log(`🚀 Server running: http://localhost:${port}`);
}

bootstrap();
