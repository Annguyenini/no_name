import { Test, TestingModule } from '@nestjs/testing';
import { PCPServer } from './pcp.server.js';
import { PcpService } from './pcp.service.js';

describe('PcpService', () => {
  let service: PcpService;
  const room_emit = vi.fn();
  const join_room = vi.fn();
  const server = {
    in: vi.fn(() => ({ socketsJoin: join_room })),
    to: vi.fn(() => ({ emit: room_emit })),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const pcp_server = { getServer: vi.fn(() => server) };
    const module: TestingModule = await Test.createTestingModule({
      providers: [PcpService, { provide: PCPServer, useValue: pcp_server }],
    }).compile();
    service = module.get<PcpService>(PcpService);
  });

  it('records and joins a session using the initialized server at call time', () => {
    service.addSessionToRoom('user-1', 'socket-1');

    expect(server.in).toHaveBeenCalledWith('socket-1');
    expect(join_room).toHaveBeenCalledWith('pcp-user-1');
    expect(service.getRoomMembers('user-1')).toEqual(['socket-1']);
  });

  it('does not record duplicate socket IDs', () => {
    service.addSessionToRoom('user-1', 'socket-1');
    service.addSessionToRoom('user-1', 'socket-1');

    expect(service.getRoomMembers('user-1')).toEqual(['socket-1']);
    expect(join_room).toHaveBeenCalledTimes(1);
  });

  it('removes the socket and clears an empty room record', () => {
    service.addSessionToRoom('user-1', 'socket-1');
    service.removeSessionFromRoom('user-1', 'socket-1', 'client namespace disconnect');

    expect(service.getRoomMembers('user-1')).toEqual([]);
  });
});
