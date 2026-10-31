# Users module

All routes require `Authorization: Bearer <access_token>`. Profile creation and display-name updates use validated JSON bodies; `user_id` query parameters must be UUIDs.

## Profile routes

| Route | Input | Response |
| --- | --- | --- |
| `GET /users/me` | None | Current profile: `id`, `username`, `display_name`, `status`, `avatar_properties` |
| `GET /users/user?user_id=<uuid>` | UUID query | Public profile: `id`, `username`, `display_name` |
| `POST /users/create-profile` | `{"username":"user123","display_name":"Name"}` | Created profile. Username must be 6–10 ASCII letters or digits. |
| `PATCH /users/update-display-name` | `{"display_name":"New name"}` | Updated profile |

## Avatar routes

- `GET /users/me/avatar` returns `{"url":"<presigned-get-url>"}` for the signed-in user's avatar.
- `GET /users/avatar?user_id=<uuid>` returns the same shape for the requested user's avatar. **Currently any authenticated user can request another user's URL.** Decide whether avatars are public or restrict this route to owners and authorized admins.
- `GET /users/avatar/upload-url` returns `{"url":"<presigned-put-url>"}` for the signed-in user. Upload the file bytes directly to S3 with `Content-Type: image/jpeg`; the URL is valid for 5 minutes.
- `PATCH /users/avatar/validate-upload` verifies that the pending upload belongs to the signed-in user and that S3 reports a non-empty object no larger than 5 MiB with content type `image/jpeg`. It then stores the request JSON as `avatar_properties` and returns the updated user row. The body currently has no DTO validation.

Presigning an avatar GET URL does not check whether the object exists. A missing object may result in S3 `404` or `403` when the URL is used. Signed URLs expire; request a fresh one when needed.

## Failure responses

| Scenario | Endpoint | Status |
| --- | --- | ---: |
| Missing or invalid access token | Any `/users` route | `401` |
| Missing or malformed `user_id` UUID | `GET /users/user`, `GET /users/avatar` | `400` |
| Current profile does not exist | `GET /users/me` | `404` |
| Requested public profile does not exist | `GET /users/user` | `404` |
| Invalid or incomplete profile body, including username outside the 6–10 ASCII letter/digit rule | `POST /users/create-profile` | `400` |
| Profile already exists for the authenticated user | `POST /users/create-profile` | `409` |
| Username is already taken | `POST /users/create-profile` | `409` |
| Other profile creation/repository failure | `POST /users/create-profile` | `400` currently |
| Missing or non-string display name | `PATCH /users/update-display-name` | `400` |
| Profile does not exist when updating display name | `PATCH /users/update-display-name` | `404` |
| Avatar upload URL generation fails | `GET /users/avatar/upload-url` | `500` |
| No valid pending upload exists | `PATCH /users/avatar/validate-upload` | `400` |
| Profile is missing when saving avatar properties | `PATCH /users/avatar/validate-upload` | `404` |
| Unexpected storage or dependency failure | Avatar routes | `500` |

The avatar validation route currently has no DTO validation, so malformed request bodies are not guaranteed to return a consistent `400`. A presigned avatar download URL can also fail later when used; S3 may return `403` or `404` if the object is inaccessible or missing.

<!-- -MIMO: Document current user-route sad-case HTTP statuses and the avatar validation caveat. -->
