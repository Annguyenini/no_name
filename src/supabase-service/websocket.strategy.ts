import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();

    // Extract token from handshake headers
    const token = client.handshake.headers.authorization?.split(' ')[1];
    console.log(token)
    if (!token) {
      throw new WsException('Missing authentication token');
    }

    try {
      // Validate token (e.g., using JWT)
      // const payload = jwtService.verify(token);
      // client.data.user = payload; // Attach user to socket
      return true;
    } catch {
      throw new WsException('Invalid token');
    }
  }
}
