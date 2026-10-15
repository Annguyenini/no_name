import { HttpException } from '@nestjs/common'

export class AppException extends HttpException {
  constructor(
    public readonly name:string,
    public readonly internalMessage: any,
    public readonly externalMessage: string,
    statusCode: number,
  ) {
    super(externalMessage, statusCode)
  }
}

export class SupabaseException extends AppException{
  constructor(
    public readonly name:string,
    public readonly internalMessage: any,
    public readonly externalMessage: string,
    statusCode: number,
  ) {
    super(name,internalMessage,externalMessage, statusCode)
  }
}
export class SystemException extends AppException{
  constructor(
    public readonly name:string,
    public readonly internalMessage: any,
    public readonly externalMessage: string,
    statusCode: number,
  ) {
    super(name,internalMessage,externalMessage, statusCode)
  }
}

export class DatabaseException extends AppException{
  constructor(
    public readonly name:string,
    public readonly internalMessage: any,
    public readonly externalMessage: string,
    statusCode: number,
  ) {
    super(name,internalMessage,externalMessage, statusCode)
  }
}

export class RepositoryExceptions extends AppException{
  constructor(
    public readonly name:string,
    public readonly internalMessage: any,
    public readonly externalMessage: string,
    statusCode: number,
  ) {
    super(name,internalMessage,externalMessage, statusCode)
  }
}
