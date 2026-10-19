# HTTP request logging

`LoggingInterceptor` is registered globally during application startup. It logs
every HTTP request when the request completes, including requests that fail.
The line contains the HTTP method, endpoint path, client IP, and duration. The
path omits its query string. Request bodies, headers, cookies, and authorization
tokens are not logged.

```text
Request GET /users/42 ip=203.0.113.8 12ms
```

The interceptor uses `request.ip`, falling back to the socket's remote address
when Express does not provide an IP.

`AllExceptionsHandler` is the global exception filter. It logs method, path,
status, and IP for exceptions, in addition to the interceptor's completion log.
Routes that already attach the filter locally continue to use the same handler.

## Request and response behavior

There is no special logging endpoint or request body. The interceptor handles
all HTTP requests; the exception filter adds a status-aware log when an
exception is raised.

`AppException` responses retain their public message and status code:

```json
{
  "statusCode": 409,
  "message": "Unable to create user",
  "timeStamp": "Sun Oct 18 2026 12:00:00 GMT-0700 (Pacific Daylight Time)"
}
```

Other NestJS `HttpException` responses keep their existing response body and
status code. Unexpected exceptions are logged with their stack trace and return
a generic response so internal error details are not sent to clients:

```json
{
  "statusCode": 500,
  "message": "Internal Server Error",
  "timeStamp": "Sun Oct 18 2026 12:00:00 GMT-0700 (Pacific Daylight Time)"
}
```

Request completion lines are written through NestJS `Logger` at log level.
Application exception details and unexpected exception stacks are written at
error level; internal details attached to an `AppException` are written at
verbose level.

## Flow

1. The interceptor records the request start time, method, endpoint, and IP.
2. The controller handles the request and returns or throws an exception.
3. On completion, the interceptor logs the elapsed duration. If the request
   throws, the exception filter also logs its status and returns the appropriate
   HTTP response.

Unit tests are in `src/interceptors/request-logs.interceptor.spec.ts` and
`src/interceptors/all-exceptions-handler.spec.ts`.
