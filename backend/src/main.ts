import { NestFactory } from '@nestjs/core';
import type { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
  });

  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.url.startsWith('/api/')) {
      req.url = req.url.replace(/^\/api/, '');
    }
    next();
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
}

bootstrap();