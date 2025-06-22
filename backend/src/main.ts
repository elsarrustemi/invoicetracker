import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use('/webhooks/stripe', json({ 
    verify: (req: any, res, buf) => {
      req.rawBody = buf;
    },
    limit: '10mb'
  }));

  app.use(json({ limit: '10mb' }));

  app.enableCors({
    origin: 'http://localhost:3001', 
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
