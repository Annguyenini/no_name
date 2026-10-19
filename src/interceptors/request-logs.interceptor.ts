import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { Observable, finalize } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  // -MIMO: Log the endpoint, client IP, and duration after every HTTP request completes.
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const started_at = Date.now();
    const request = context.switchToHttp().getRequest<Request>();
    const request_ip = request.ip || request.socket.remoteAddress || 'unknown';
    const request_endpoint = request.path || request.url;

    return next.handle().pipe(
      finalize(() => {
        const duration_ms = Date.now() - started_at;
        this.logger.log(
          `Request ${request.method} ${request_endpoint} ip=${request_ip} ${duration_ms}ms`,
        );
      }),
    );
  }
}
