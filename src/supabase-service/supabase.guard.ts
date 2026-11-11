import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { WsException } from "@nestjs/websockets";
import {  Socket } from 'socket.io';
@Injectable()
export class SupabaseGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const type = context.getType()
    console.log(type)
    if (type === "ws") {
      const client :Socket= context.switchToWs().getClient()
      try {
        return super.canActivate(client.handshake.auth?.token);
      }
      catch (err) {
        throw new WsException('Failed to establish web socket connection')
      }
    }
     return super.canActivate(context);
  }
}
