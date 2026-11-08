# Authentication tests

## Coverage

- [auth.controller.spec.ts](../../src/auth/specs/auth.controller.spec.ts) checks delegation for signup, sign-in, token refresh, sign-out, and confirmation resend; it also checks malformed refresh headers, authenticated-user response shaping, and propagated service errors.
- [auth.service.spec.ts](../../src/auth/specs/auth.service.spec.ts) checks sign-in and refresh token responses, invalid credentials, and invalid refresh sessions.
- [auth.repository.spec.ts](../../src/auth/specs/auth.repository.spec.ts) checks successful and rejected Supabase operations for signup, sign-in, resend, refresh, and sign-out, including wrapped dependency failures.
- [integrate.spec.ts](../../src/auth/specs/integrate.spec.ts) boots `AppModule` with a mocked Supabase client and sends HTTP requests for signup, sign-in, token sign-in, and refresh. It covers DTO rejection and success/error responses.
- [auth-sad.spec.ts](../../test/smoke/auth-sad.spec.ts) sends negative HTTP cases for signup, sign-in, token sign-in, and refresh against the configured application and auth service.

## Test types and dependencies

Controller, service, and repository unit tests use mocks. The integration suite mocks Supabase but uses the real Nest HTTP stack and AppModule providers, including the configured Prisma/database connection. The auth smoke suite uses the real application configuration and requires its auth and database dependencies to be available.
