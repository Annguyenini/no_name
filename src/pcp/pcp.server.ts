import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class PCPServer {
  private server?: Server;

  // -MIMO: I save the Socket.IO server after Nest initializes the gateway.
  setServer(server: Server): void {
    this.server = server;
  }

  // -MIMO: I return the initialized server and fail clearly if startup wiring is incomplete.
  getServer(): Server {
    if (!this.server) throw new ServiceUnavailableException('Socket server is not initialized');
    return this.server;
  }
}
