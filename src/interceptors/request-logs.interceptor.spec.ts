import { CallHandler, ExecutionContext, Logger } from '@nestjs/common';
import type { Request } from 'express';
import { throwError, of } from 'rxjs';
import { LoggingInterceptor } from './request-logs.interceptor.js';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let log_spy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
    log_spy = vi
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs the method, endpoint, client IP, and duration after a successful request', () => {
    const context = createHttpContext('GET', '/users/42', '203.0.113.8');
    const call_handler = { handle: () => of({ id: 42 }) } as CallHandler;

    interceptor.intercept(context, call_handler).subscribe();

    expect(log_spy).toHaveBeenCalledOnce();
    expect(log_spy.mock.calls[0][0]).toMatch(
      /^Request GET \/users\/42 ip=203\.0\.113\.8 \d+ms$/,
    );
  });

  it('logs requests that fail and uses the socket IP when request.ip is empty', () => {
    const context = createHttpContext('POST', '/auth/signin', '', '192.0.2.5');
    const call_handler = {
      handle: () => throwError(() => new Error('request failed')),
    } as CallHandler;

    interceptor
      .intercept(context, call_handler)
      .subscribe({ error: () => undefined });

    expect(log_spy).toHaveBeenCalledOnce();
    expect(log_spy.mock.calls[0][0]).toMatch(
      /^Request POST \/auth\/signin ip=192\.0\.2\.5 \d+ms$/,
    );
  });
});

// -MIMO: Provide an HTTP context with an original query string to verify only the path is logged.
function createHttpContext(
  method: string,
  request_path: string,
  request_ip: string,
  remote_address = '127.0.0.1',
): ExecutionContext {
  const request_mock = {
    method,
    path: request_path,
    url: `${request_path}?token=private`,
    ip: request_ip,
    socket: { remoteAddress: remote_address },
  } as Request;

  return {
    switchToHttp: () => ({ getRequest: () => request_mock }),
  } as unknown as ExecutionContext;
}
