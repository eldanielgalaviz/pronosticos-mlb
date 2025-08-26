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
  origin: (origin, callback) => {
    const allowedPatterns = [
      'https://pronosticosmlb.vercel.app',
      'http://localhost:3000',
      // Patrón para cualquier deployment de tu proyecto en Vercel
      /^https:\/\/pronosticos-[a-zA-Z0-9]+-jesusdanielgfim-uasedumxs-projects\.vercel\.app$/
    ];
    
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedPatterns.some(pattern => {
      if (typeof pattern === 'string') {
        return pattern === origin;
      }
      return pattern.test(origin);
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked for origin:', origin);
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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
