# Auth module

All routes use the `/auth` prefix. Request bodies are validated; unknown fields are rejected.

## Sign up

`POST /auth/signup`

Send an email and a password with at least 8 characters, including uppercase, lowercase, number, and symbol characters. The same password validation applies when signing in.

```json
{
  "email": "person@example.com",
  "password": "Example123!"
}
```

Response:

```json
{
  "id": "user-uuid"
}
```

Supabase handles account creation and email confirmation. The API returns the new user ID.

## Sign in

`POST /auth/signin`

Send the account email as `identifier` and the password:

```json
{
  "identifier": "person@example.com",
  "password": "Example123!"
}
```

Response:

```json
{
  "id": "user-uuid",
  "access_token": "...",
  "refresh_token": "..."
}
```

Keep both tokens private. Use the access token as a bearer token for protected routes.

## Refresh tokens

`POST /auth/refresh-token`

Send the current refresh token in the JSON body:

```json
{
  "access_toke":"...",
  "refresh_token": "..."
}
```

Response has the same shape as sign-in. Replace both stored tokens with the returned tokens, since Supabase may rotate the refresh token.

## Sign out

`POST /auth/signout`

Send the current access token in the header. No request body is needed.

```http
Authorization: Bearer <access_token>
```

Response:

```json
{
  "message": "Signed out successfully"
}
```

This signs out the current session. The access token can remain valid until it expires.

## Resend verification email

`POST /auth/resend-email-verification`

Send the account email:

```json
{
  "email": "person@example.com"
}
```

The controller currently defines no response body for this route.

## Protected test route

`GET /auth/test` requires `Authorization: Bearer <access_token>`. It currently returns no response body.

## Roles

The Prisma role enum contains `user` and `admin`. A permission row uses the app user ID from `users.users(id)`; this is separate from Supabase's `auth.users` table. The auth controller currently has no endpoint to assign or change roles.
