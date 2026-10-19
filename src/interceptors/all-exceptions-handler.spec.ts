import { ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AppException } from '../core/exceptions/app-exceptions.js';
import { AllExceptionsHandler } from './all-exceptions-handler.intercept.js';

describe('AllExceptionsHandler', () => {
  let handler: AllExceptionsHandler;
  let log_spy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    handler = new AllExceptionsHandler();
    log_spy = vi
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => undefined);
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    vi.spyOn(Logger.prototype, 'verbose').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs request context and returns the public application error', () => {
    const { host, response_mock } = createHttpHost(
      'POST',
      '/users',
      '127.0.0.1',
    );
    const exception = new AppException(
      'CreateUserException',
      { reason: 'duplicate user' },
      'Unable to create user',
      409,
    );

    handler.catch(exception, host);

    expect(log_spy).toHaveBeenCalledWith(
      'Request failed method=POST path=/users status=409 ip=127.0.0.1',
    );
    expect(response_mock.status).toHaveBeenCalledWith(409);
    expect(response_mock.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 409,
        message: 'Unable to create user',
      }),
    );
  });

  it('logs HTTP exceptions and preserves their response payload', () => {
    const { host, response_mock } = createHttpHost(
      'GET',
      '/users/1',
      '10.0.0.2',
    );
    const exception = new HttpException({ message: 'Not found' }, 404);

    handler.catch(exception, host);

    expect(log_spy).toHaveBeenCalledWith(
      'Request failed method=GET path=/users/1 status=404 ip=10.0.0.2',
    );
    expect(response_mock.status).toHaveBeenCalledWith(404);
    expect(response_mock.json).toHaveBeenCalledWith({ message: 'Not found' });
  });

  it('logs unknown exceptions and returns a generic 500 response', () => {
    const { host, response_mock } = createHttpHost(
      'GET',
      '/health',
      '127.0.0.1',
    );

    handler.catch(new Error('private implementation detail'), host);

    expect(log_spy).toHaveBeenCalledWith(
      'Request failed method=GET path=/health status=500 ip=127.0.0.1',
    );
    expect(response_mock.status).toHaveBeenCalledWith(500);
    expect(response_mock.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Internal Server Error',
      }),
    );
  });
});

// -MIMO: Build an HTTP arguments host so the exception filter can be tested without starting Nest.
function createHttpHost(method: string, request_path: string, ip: string) {
  const request_mock = {
    method,
    path: request_path,
    originalUrl: `${request_path}?token=private`,
    url: request_path,
    ip,
  } as Request;
  const response_mock = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as unknown as Response;
  const host = {
    switchToHttp: () => ({
      getRequest: () => request_mock,
      getResponse: () => response_mock,
    }),
  } as unknown as ArgumentsHost;

  return { host, response_mock };
}
