import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, body, query, params } = request;
    const startTime = Date.now();

    // Build request info string
    const requestInfo = this.formatRequestInfo(method, url, query, params, body);

    // Only log request details in development or for non-GET requests
    if (process.env.NODE_ENV === 'development' || method !== 'GET') {
      this.logger.log(`→ ${method} ${url}${requestInfo}`);
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;
          const responseInfo = this.formatResponseInfo(data);

          const logMessage = `← ${method} ${url} ${statusCode} | ${duration}ms${responseInfo}`;

          if (statusCode >= 400) {
            this.logger.error(logMessage);
          } else if (statusCode >= 300) {
            this.logger.warn(logMessage);
          } else {
            this.logger.log(logMessage);
          }
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;
          const errorInfo = this.formatErrorInfo(error);

          this.logger.error(
            `✗ ${method} ${url} ${statusCode} | ${duration}ms | ${errorInfo}`
          );
        },
      }),
    );
  }

  private formatRequestInfo(
    method: string,
    url: string,
    query: any,
    params: any,
    body: any,
  ): string {
    const parts: string[] = [];

    // Add params if present
    if (params && Object.keys(params).length > 0) {
      const paramStr = Object.entries(params)
        .map(([k, v]) => `${k}=${v}`)
        .join(', ');
      parts.push(`params: {${paramStr}}`);
    }

    // Add query if present
    if (query && Object.keys(query).length > 0) {
      const queryStr = Object.entries(query)
        .map(([k, v]) => `${k}=${v}`)
        .join(', ');
      parts.push(`query: {${queryStr}}`);
    }

    // Add body for POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
      const sanitized = this.sanitizeBody(body);
      const bodyStr = JSON.stringify(sanitized);
      if (bodyStr.length > 200) {
        parts.push(`body: ${bodyStr.substring(0, 200)}...`);
      } else {
        parts.push(`body: ${bodyStr}`);
      }
    }

    return parts.length > 0 ? ` | ${parts.join(' | ')}` : '';
  }

  private formatResponseInfo(data: any): string {
    if (!data) {
      return '';
    }

    // If data is an array, show count
    if (Array.isArray(data)) {
      return ` | ${data.length} item${data.length !== 1 ? 's' : ''}`;
    }

    // If data is an object, show summary
    if (typeof data === 'object') {
      const keys = Object.keys(data);
      const dataStr = JSON.stringify(data);

      // For large objects, show key summary
      if (dataStr.length > 300) {
        return ` | {${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}}`;
      }

      // For small objects, show full data
      return ` | ${dataStr}`;
    }

    // For primitives, show value (truncated if too long)
    const dataStr = String(data);
    if (dataStr.length > 200) {
      return ` | ${dataStr.substring(0, 200)}...`;
    }

    return ` | ${dataStr}`;
  }

  private formatErrorInfo(error: any): string {
    const parts: string[] = [];

    if (error.message) {
      parts.push(error.message);
    }

    if (error.name && error.name !== 'Error') {
      parts.push(`(${error.name})`);
    }

    // Only show stack in development
    if (process.env.NODE_ENV === 'development' && error.stack) {
      const stackLines = error.stack.split('\n').slice(0, 3);
      parts.push(`\n  ${stackLines.join('\n  ')}`);
    }

    return parts.join(' ');
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sanitized = { ...body };

    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'api_key'];
    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });

    return sanitized;
  }
}

