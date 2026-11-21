import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  configureApp(app);

  app.enableCors({
    origin: config.getOrThrow<string>('CORS_ORIGIN').split(','),
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Sistema de Matrícula — API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swaggerConfig));

  // 0.0.0.0 para aceitar conexões de fora do container (Docker/Railway)
  await app.listen(config.getOrThrow<number>('PORT'), '0.0.0.0');
}

void bootstrap();