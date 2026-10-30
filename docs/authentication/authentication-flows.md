# Auth module

All routes use `/auth`. Request bodies are validated; unknown fields are rejected.

## Routes

### `POST /auth/sign-up`

Input:

```json
{"email":"person@example.com","password":"Example123!"}
```

Password requires at least 8 characters, including uppercase, lowercase, number, and symbol. Returns:

```json
{"id":"user-uuid"}
```

### `POST /auth/sign-in`

Input:

```json
{"identifier":"person@example.com","password":"Example123!"}
```

`identifier` is the account email. Returns:

```json
{"id":"user-uuid","access_token":"...","refresh_token":"..."}
```

### `GET /auth/sign-in-via-token`

Send an existing Supabase access token as `Authorization: Bearer <access_token>`. The `SupabaseGuard` verifies the token before the route responds. No request body is required. A valid token returns:

```json
{"user_id":"user-uuid"}
```

Missing or invalid bearer tokens are rejected by the authentication guard.

### `GET /auth/refresh-token`

Send the refresh token as `Authorization: Bearer <refresh_token>`. No body. Returns new access and refresh tokens; replace both stored tokens because refresh tokens may rotate.

### `POST /auth/signout`

Send `Authorization: Bearer <access_token>`. Returns:

```json
{"message":"Signed out successfully"}
```

### `POST /auth/resend-email-verification`

Input: `{"email":"person@example.com"}`. The route currently returns no response body.

## Notes

- Sign-in, refresh, and sign-out failures use unauthorized responses for invalid credentials or tokens.
- Keep access and refresh tokens private. Use access tokens on protected routes.

## Failure responses

| Scenario | Endpoint | Status |
| --- | --- | ---: |
| Missing required fields or invalid field values | `POST /auth/sign-up` | `400` |
| Sign-up is rejected by Supabase (currently reported as an email already in use) | `POST /auth/sign-up` | `400` |
| Missing required fields or invalid field types | `POST /auth/sign-in` | `400` |
| Invalid email/password credentials | `POST /auth/sign-in` | `401` |
| Missing or invalid bearer access token | `GET /auth/sign-in-via-token`, `POST /auth/signout` | `401` |
| Missing or malformed bearer refresh token | `GET /auth/refresh-token` | `401` |
| Invalid or expired refresh token | `GET /auth/refresh-token` | `401` |
| Missing or invalid email | `POST /auth/resend-email-verification` | `400` |
| Supabase resend-verification failure | `POST /auth/resend-email-verification` | `500` |
| Unexpected server or dependency error | Any auth route | `500` |

The sign-in `identifier` is currently validated as a string, not as an email address. Sign-up maps any Supabase error to `400` with an email-already-associated message, so that response does not necessarily mean the email is already registered. The sign-out repository maps Supabase `401` and `403` errors to `401`.

Validation errors use NestJS's default `ValidationPipe` response. `AppException` failures use `{ "statusCode": number, "message": string, "timeStamp": string }`; the exact response body for other HTTP exceptions follows NestJS's exception response.

<!-- -MIMO: Add the implemented auth sad-case statuses and response behavior for endpoint-level tests. -->

<!-- -MIMO: Document the guarded token sign-in route and remove the obsolete diagnostic route note. -->
