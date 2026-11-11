import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect,ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class PcpGateway implements OnGatewayInit,OnGatewayConnection,OnGatewayDisconnect {
  @WebSocketServer() server: Server

  handleConnection(client: Socket) {
    console.log('connect',client.request.headers)
  }
  handleDisconnect(client: Socket, reason?: string) {
    console.log('dsi',client,reason)
  }
  afterInit(server: any) {
    console.log('init'+server)
  }
  @SubscribeMessage('message')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: string,
  ) {
    console.log('message', client.request.headers, message);

    client.emit('message', 'Hello from server');

    return message;
  }
}
