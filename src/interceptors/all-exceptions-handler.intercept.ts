import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AppException } from '../core/exceptions/app-exceptions.js';

@Catch()
export class AllExceptionsHandler implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsHandler.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    // -MIMO: Log safe request context for every exception handled by this filter.
    this.logRequest(request, status);

    if (exception instanceof AppException) {
      this.logger.error(
        `Error occurred: ${exception.externalMessage}, ${status}`,
      );
      if (exception.internalMessage != null) {
        this.logger.verbose(
          `Detail of ${exception.name}-${exception.externalMessage}: ${JSON.stringify(
            exception.internalMessage,
            null,
            2,
          )}`,
        );
      }

      response.status(status).json({
        statusCode: status,
        message: exception.externalMessage,
        timeStamp: new Date().toString(),
      });
      return;
    }

    if (exception instanceof HttpException) {
      response.status(status).json(exception.getResponse());
      return;
    }

    const error_stack =
      exception instanceof Error ? exception.stack : undefined;
    this.logger.error('Unhandled exception', error_stack);
    response.status(500).json({
      statusCode: 500,
      message: 'Internal Server Error',
      timeStamp: new Date().toString(),
    });
  }

  // -MIMO: Keep request logs useful for tracing while omitting headers and bodies that may contain credentials.
  private logRequest(request: Request, status: number): void {
    const request_path = request.path || request.url;
    this.logger.log(
      `Request failed method=${request.method} path=${request_path} status=${status} ip=${request.ip}`,
    );
  }
}
