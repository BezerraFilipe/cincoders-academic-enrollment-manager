import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

export interface ErrorResponseBody {
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
}

interface HttpExceptionPayload {
  code?: string;
  message?: string | string[];
  details?: unknown;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const body = this.toErrorBody(exception);

    if (body.statusCode >= 500) {
      this.logger.error(exception);
    }

    response.status(body.statusCode).json(body);
  }

  private toErrorBody(exception: unknown): ErrorResponseBody {
    if (!(exception instanceof HttpException)) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Erro interno do servidor.',
      };
    }

    const statusCode = exception.getStatus();
    const payload = exception.getResponse();
    const defaultCode = HttpStatus[statusCode] ?? 'ERROR';

    if (typeof payload === 'string') {
      return { statusCode, code: defaultCode, message: payload };
    }

    const { code, message, details } = payload as HttpExceptionPayload;

    if (Array.isArray(message)) {
      return {
        statusCode,
        code: 'VALIDATION_ERROR',
        message: 'Dados de entrada inválidos.',
        details: message,
      };
    }

    return {
      statusCode,
      code: code ?? defaultCode,
      message: message ?? exception.message,
      ...(details !== undefined && { details }),
    };
  }
}
