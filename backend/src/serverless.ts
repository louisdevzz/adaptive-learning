import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ApiKeyGuard } from './common/guards/api-key.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import cookieParser from 'cookie-parser';
import express from 'express';

const server = express();
let cachedApp: any = null;

async function createNestApp() {
  if (!cachedApp) {
    const expressApp = express();
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
      {
        logger: ['error', 'warn'],
      },
    );

    const configService = app.get(ConfigService);

    // Use cookie parser
    app.use(cookieParser());

    // Enable CORS
    app.enableCors({
      origin: configService.get<string>('CORS_ORIGIN') || true,
      credentials: true,
    });

    // Enable global logging interceptor
    app.useGlobalInterceptors(new LoggingInterceptor());

    // Enable global API Key guard
    app.useGlobalGuards(new ApiKeyGuard(configService));

    // Enable global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Set global prefix
    app.setGlobalPrefix('api');

    await app.init();
    cachedApp = expressApp;
  }
  return cachedApp;
}

export default async (req: any, res: any) => {
  const app = await createNestApp();
  return app(req, res);
};
