import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    const validApiKey = this.configService.get<string>('API_KEY');

    if (!apiKey) {
      throw new UnauthorizedException('API Key is required');
    }

    if (!validApiKey) {
      throw new UnauthorizedException('API Key is not configured');
    }

    // Use constant-time comparison to prevent timing attacks
    const apiKeyBuffer = Buffer.from(String(apiKey));
    const validApiKeyBuffer = Buffer.from(validApiKey);
    const isValid =
      apiKeyBuffer.length === validApiKeyBuffer.length &&
      crypto.timingSafeEqual(apiKeyBuffer, validApiKeyBuffer);

    if (!isValid) {
      throw new UnauthorizedException('Invalid API Key');
    }

    return true;
  }
}
