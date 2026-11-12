import { BadRequestException, UseFilters } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtSupabaseStrategy } from '../supabase-service/jwt.strategy.js';
import { AllExceptionsHandler } from '../interceptors/all-exceptions-handler.intercept.js';
import { PCPServer } from './pcp.server.js';
import { PcpService } from './pcp.service.js';

@WebSocketGateway({
  namespace: 'pcp',
  cors: { origin: '*', methods: ['GET', 'POST'] },
})
export class PcpGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly jwt_strategy: JwtSupabaseStrategy,
    private readonly pcp_server: PCPServer,
    private readonly pcp_service: PcpService,
  ) {}

  @WebSocketServer()
  server: Server;

  // -MIMO: I register each authenticated connection with the PCP room service.
  handleConnection(client: Socket): void {
    const user_id = client.data.user?.id;
    if (!user_id || !client.id) throw new BadRequestException('Invalid user or socket id');
    this.pcp_service.addSessionToRoom(user_id, client.id);
  }

  // -MIMO: I remove a disconnected connection from its authenticated user's room state.
  handleDisconnect(client: Socket, reason?: string): void {
    const user_id = client.data.user?.id;
    if (!user_id || !client.id) return;
    this.pcp_service.removeSessionFromRoom(user_id, client.id, reason);
  }

  // -MIMO: I expose the server after gateway initialization and authenticate namespace connections.
  @UseFilters(AllExceptionsHandler)
  afterInit(server: Server): void {
    this.pcp_server.setServer(server);
    server.use(async (client: Socket, next: (error?: Error) => void) => {
      const token = client.handshake.auth?.token;
      if (!token) return next(new Error('Missing token'));

      try {
        client.data.user = await this.jwt_strategy.supabaseValidation(token);
        next();
      } catch {
        next(new Error('Invalid token'));
      }
    });
  }

  // -MIMO: I send the requesting user's currently connected socket IDs to that user's room.
  @SubscribeMessage('members')
  handleMembers(@ConnectedSocket() client: Socket, @MessageBody() _message: unknown): void {
    const user_id = client.data.user?.id;
    if (!user_id) throw new BadRequestException('Invalid user id');

    const room_id = `pcp-${user_id}`;
    const members = this.pcp_service.getRoomMembers(user_id);
    this.pcp_server.getServer().to(room_id).emit('members', members);
  }
}
