import { ExceptionFilter,ArgumentsHost, Catch, HttpException, Logger } from "@nestjs/common"
import { AppException } from "../core/exceptions/app-exceptions.js"

@Catch()
export class AllExceptionsHandler implements ExceptionFilter{
  private readonly logger = new Logger(AllExceptionsHandler.name)

  catch(e: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    var message
    var internal_message = null


    if (e instanceof AppException) {
      message = e.externalMessage
      internal_message = e.internalMessage ?? {}
      const status = e instanceof (AppException) ? e.getStatus() : 500
      this.logger.error(`Error occur: ${message} , ${status}`)
      if (internal_message) {
        this.logger.verbose(`Detail of ${e.name}-${message}: ${
          JSON.stringify(internal_message, null, 2)
          }`)
      }

      response.status(status).json({
        statusCode: status,
        message: message,
        timeStamp: new Date().toString()
      })
    }


    else if (e instanceof(HttpException)) {
      message = "Internal Server Error"
      response.status(e.getStatus()).json(e.getResponse())
    }
  }
}
