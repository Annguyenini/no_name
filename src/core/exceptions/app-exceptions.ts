import { HttpException } from '@nestjs/common'

export class AppException extends HttpException {
  constructor(
    public readonly internalMessage: any,
    public readonly externalMessage: string,
    statusCode: number,
  ) {
    super(externalMessage, statusCode)
  }
}

export class SupabaseException extends AppException{
  constructor(
    public readonly internalMessage: any,
    public readonly externalMessage: string,
    statusCode: number,
  ) {
    super(internalMessage,externalMessage, statusCode)
  }
}
export class SystemException extends AppException{
  constructor(
    public readonly internalMessage: any,
    public readonly externalMessage: string,
    statusCode: number,
  ) {
    super(internalMessage,externalMessage, statusCode)
  }
}
