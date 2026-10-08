import { ExceptionFilter,ArgumentsHost, Catch, HttpException, Logger } from "@nestjs/common"

@Catch()
export class AllExceptionsHandler implements ExceptionFilter{
  private readonly logger = new Logger(AllExceptionsHandler.name)
  catch(e: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const status = e instanceof (HttpException) ? e.getStatus() : 500
    const message = e instanceof (HttpException) ? e.getResponse() : "Internal Server Error "
    this.logger.error(`Error occur: ${message} , ${status}`)
    response.status(status).json({
      statusCode: status,
      message: message,
      timeStamp: new Date().toString()
    })
  }
}
