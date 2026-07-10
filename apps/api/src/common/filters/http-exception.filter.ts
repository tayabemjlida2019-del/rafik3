import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: string | object = 'خطأ داخلي في السيرفر';

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            message =
                typeof exceptionResponse === 'string'
                    ? exceptionResponse
                    : (exceptionResponse as any).message || exceptionResponse;
        }

        // Log the full error internally
        this.logger.error(
            `[${request.method}] ${request.url} → ${status}`,
            exception instanceof Error ? exception.stack : String(exception),
        );

        // Return sanitized response — NO stack traces in production
        response.status(status).json({
            statusCode: status,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
            // Stack trace only in development
            ...(process.env.NODE_ENV === 'development' && exception instanceof Error
                ? { stack: exception.stack }
                : {}),
        });
    }
}
