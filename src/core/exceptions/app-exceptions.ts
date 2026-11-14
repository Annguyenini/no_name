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


export class AWSExceptions extends AppException{
  constructor(
    public readonly internalMessage: any,
    public readonly externalMessage: string
  ) {
    super("AWS",internalMessage,externalMessage,500)

  }
}



export class PermissionException extends HttpException{
  constructor(
    public readonly name:string,
    public readonly internalMessage: any,
    public readonly externalMessage: string,
    statusCode: number,

    public readonly user_id?: string,

  ) {
    super(externalMessage, statusCode)
  }
}


export class TripPermissionException extends PermissionException{
  constructor(
    public readonly internalMessage: any,
    public readonly externalMessage: string,
    public readonly user_id: string

  ) {
    super("Trip",internalMessage,externalMessage,403,user_id)
  }
}
