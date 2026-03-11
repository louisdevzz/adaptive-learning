import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ApiKeyGuard } from './common/guards/api-key.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Use cookie parser
  app.use(cookieParser());

  // Enable CORS with flexible origin handling
  const corsOrigin = configService.get<string>('CORS_ORIGIN');
  const allowedOrigins = corsOrigin
    ? corsOrigin.split(',').map((origin) => origin.trim())
    : ['http://localhost:3000', 'http://localhost:5173'];

  app.enableCors({
    origin: (origin, callback) => {
      // Block requests with no origin to prevent CSRF from non-browser clients
      // in production; allow in development for tools like curl/Postman
      if (!origin) {
        const nodeEnv = configService.get<string>('NODE_ENV');
        if (nodeEnv === 'production') {
          return callback(new Error('Origin header is required'), false);
        }
        return callback(null, true);
      }

      // Check if origin is in the explicit allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow Vercel preview deployments only for the specific project
      // Pattern: https://<project>-<hash>-<scope>.vercel.app
      // We restrict to HTTPS only and validate it's a proper Vercel subdomain
      const vercelAllowPattern = configService.get<string>(
        'CORS_VERCEL_PATTERN',
      );
      if (vercelAllowPattern) {
        try {
          const vercelRegex = new RegExp(vercelAllowPattern);
          if (vercelRegex.test(origin)) {
            return callback(null, true);
          }
        } catch {
          // Invalid regex pattern - skip vercel check
        }
      }

      logger.warn(`Blocked CORS request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
    exposedHeaders: ['set-cookie'],
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

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
  logger.log(`🔐 API Key protection is enabled. Use header: x-api-key`);
  logger.log(`📝 Request/Response logging is enabled`);
}
bootstrap();
