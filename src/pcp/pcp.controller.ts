import { BadRequestException, UseFilters, UseGuards } from '@nestjs/common';
import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect,ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SupabaseGuard } from '../supabase-service/supabase.guard.js';
import { JwtSupabaseStrategy } from '../supabase-service/jwt.strategy.js';
import { AllExceptionsHandler } from '../interceptors/all-exceptions-handler.intercept.js';
@WebSocketGateway({ namespace: 'events' ,cors: {
    origin: '*',
    methods: ['GET', 'POST'],
},
})

export class PcpGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly JwtStategy: JwtSupabaseStrategy) { }
  @WebSocketServer() server: Server

  handleConnection(client: Socket) {
    console.log(client.data.user)
    this.server.socketsJoin(client.data.user.id)
  }
  handleDisconnect(client: Socket, reason?: string) {
    // console.log('dsi',client,reason)
  }
  @UseFilters(AllExceptionsHandler)
  afterInit(server: any) {
    server.use(async (client: Socket, next: any) => {
      const token = client.handshake.auth?.token
      if (!token) {
        next(new BadRequestException('Missing token'))
      }
      try {
        const payload = await this.JwtStategy.supabaseValidation(token)
        client.data.user = payload
        next();
      }
      catch (error) {
        next(new Error('Invalid token'));
      }
    })
  }
  @SubscribeMessage('message')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: string,
  ) {
    // console.log('message', client.request.headers, message);

    client.emit('message', 'Hello from server');
    return message;
  }
}
