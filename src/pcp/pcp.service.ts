import { BadRequestException, Injectable } from '@nestjs/common';
import { PCPServer } from './pcp.server.js';

type RoomId = string;
type SocketId = string;

@Injectable()
export class PcpService {
  private readonly pcp_room_prefix = 'pcp-';
  private readonly rooms = new Map<RoomId, SocketId[]>();

  constructor(private readonly pcp_server: PCPServer) {}

  // -MIMO: I add the socket to its user room and record the session for member listing.
  addSessionToRoom(user_id: string, socket_id: string): void {
    if (!user_id || !socket_id) throw new BadRequestException('Invalid user or socket id');

    const room_id = this.getRoomId(user_id);
    const sockets = this.rooms.get(room_id) ?? [];
    if (sockets.includes(socket_id)) return;

    this.pcp_server.getServer().in(socket_id).socketsJoin(room_id);
    sockets.push(socket_id);
    this.rooms.set(room_id, sockets);
    this.pcp_server.getServer().to(room_id).emit('connection', 'New session connected to room!');
  }

  // -MIMO: I remove the disconnected socket and delete empty room records.
  removeSessionFromRoom(user_id: string, socket_id: string, reason?: string): void {
    if (!user_id || !socket_id) throw new BadRequestException('Invalid user or socket id');

    const room_id = this.getRoomId(user_id);
    const sockets = this.rooms.get(room_id);
    if (!sockets) return;

    const remaining_sockets = sockets.filter((current_socket_id) => current_socket_id !== socket_id);
    if (remaining_sockets.length === 0) this.rooms.delete(room_id);
    else this.rooms.set(room_id, remaining_sockets);

    this.pcp_server.getServer().to(room_id).emit('connection', `Session ${socket_id} left the room. Reason: ${reason ?? 'unknown'}`);
  }

  // -MIMO: I return a copy of the tracked socket IDs so callers cannot mutate room state.
  getRoomMembers(user_id: string): SocketId[] {
    if (!user_id) throw new BadRequestException('Invalid user id');
    return [...(this.rooms.get(this.getRoomId(user_id)) ?? [])];
  }

  // -MIMO: I build the consistent Socket.IO room name for a user.
  private getRoomId(user_id: string): RoomId {
    return `${this.pcp_room_prefix}${user_id}`;
  }
}
