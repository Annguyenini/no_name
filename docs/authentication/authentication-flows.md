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
{"ok":true}
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

<!-- -MIMO: Document the guarded token sign-in route and remove the obsolete diagnostic route note. -->
