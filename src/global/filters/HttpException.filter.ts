import { 
  ExceptionFilter, 
  Catch, 
  ArgumentsHost, 
  HttpException 
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    let errorMessage = "Internal Server Error";
    
    const exceptionResponse = exception.getResponse();

    // exception.getResponse returns either a string or an object. Example of string being returned is as follows
    // throw new HttpException('This is a custom error message', HttpStatus.BAD_REQUEST. So need to handle both.
    if(typeof exceptionResponse === "object") {

      const message = (exceptionResponse as any).message;

      // class validator returns message as an array of string like ["phone must be a string"]. 
      // Array check is for that only
      if(Array.isArray(message) && message.length > 0) {
        errorMessage = message[0];
      } else {
        errorMessage = message 
      }

    } else {
      errorMessage = exceptionResponse
    }

    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: errorMessage
      });
  }
}