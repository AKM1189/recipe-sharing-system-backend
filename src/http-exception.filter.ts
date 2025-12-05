import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common'; // import other default exceptions if necessary

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // Check if the exception is one of NestJS's default exceptions
    if (
      exception instanceof UnauthorizedException ||
      exception instanceof NotFoundException ||
      exception instanceof ForbiddenException ||
      exception instanceof BadRequestException
    ) {
      // NestJS already handles these exceptions, so don't override them
      return;
    }

    // Log the uncaught exception (optional)
    console.error('Unhandled exception:', exception);

    // Return a generic response for uncaught exceptions
    return response.status(status).json({
      statusCode: status,
      message: exception.message || 'Internal server error', // Fallback message
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
