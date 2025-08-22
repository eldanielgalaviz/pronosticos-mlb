import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validación global
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Habilitar CORS nativamente en NestJS
  app.enableCors({
    origin: [
      'http://localhost:3000', // frontend local
      'https://pronosticos-2ag08yqxg-jesusdanielgfim-uasedumxs-projects.vercel.app' // ✅ Sin barra al final
    ],
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    credentials: true,
  });

  // Obtener puerto desde ConfigService (mapear a number) o fallback
  const configService = app.get(ConfigService);
  const portEnv = configService?.get<string>('PORT') ?? process.env.PORT;
  const port = Number(portEnv) || 3001;

  await app.listen(port);
  console.log(`🚀 Server running: http://localhost:${port}`);
}

bootstrap();