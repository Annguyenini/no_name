# Interceptor and exception filter tests

## Coverage

- [all-exceptions-handler.spec.ts](../../src/interceptors/all-exceptions-handler.spec.ts) checks request-context logging, public application errors, preserved HTTP exception responses, and generic `500` responses for unexpected errors.
- [request-logs.interceptor.spec.ts](../../src/interceptors/request-logs.interceptor.spec.ts) checks logging for successful and failed requests, duration and client IP selection, and exclusion of query strings from the logged path.

## Test type

Unit tests with mocked Nest HTTP contexts, RxJS handlers, and logger methods. No server is started.
