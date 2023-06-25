import { MyLogger } from '@/logger/logger.service';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private logger = new MyLogger();

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionRes: any = exception.getResponse();
    let message: any;
    if (exceptionRes.error) {
      message = exceptionRes.message;
    } else {
      message = exception?.message;
    }

    const devErrorResponse: any = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      errorName: exception?.name,
      message,
    };

    this.logger.error(
      `request method: ${request.method} request url${request.url}\n` +
        JSON.stringify(devErrorResponse, null, 2),
    );

    response.status(status).json(devErrorResponse);
  }
}
