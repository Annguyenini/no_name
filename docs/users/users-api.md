# Users API

Every `/users` route requires `Authorization: Bearer <access_token>`. The verified token supplies the acting user's ID. Body DTOs reject unknown fields; `user_id` query values must be UUIDs.

## Endpoint contracts

| Endpoint | Expected input | Success output | Common status codes and what they mean |
| --- | --- | --- | --- |
| `GET /users/me` | No body or query | `200` current profile record | `401` token invalid or missing. `404` authenticated account has no profile. |
| `GET /users/user?user_id=<uuid>` | UUID query parameter | `200` `{"id":"...","username":"...","display_name":"..."}` | `400` `user_id` is not a UUID. `401` token invalid or missing. `404` no profile for that ID. |
| `POST /users/create-profile` | `{"username":"user123","display_name":"Name"}`. Username must be 6–10 ASCII letters/digits; display name must be a string. Profile ID comes from the token. | `201` created profile record | `400` DTO invalid or non-conflict insert failure. `401` token invalid or missing. `409` profile already exists or username is taken. |
| `PATCH /users/update-display-name` | `{"display_name":"New name"}`; string required, no length/content rule | `200` updated profile record | `400` body invalid. `401` token invalid or missing. `404` profile does not exist. |
| `GET /users/me/avatar` | No body or query | `200` `{"url":"<presigned-get-url>"}`; URL expires after 300 seconds | `401` token invalid or missing. `500` URL generation failed. The URL itself does not guarantee the object exists. |
| `GET /users/avatar?user_id=<uuid>` | UUID query parameter | `200` `{"url":"<presigned-get-url>"}`; URL expires after 300 seconds | `400` invalid UUID. `401` token invalid or missing. `500` URL generation failed. Any authenticated user can currently request another user's avatar URL. |
| `GET /users/avatar/upload-url` | No body or query | `200` `{"url":"<presigned-put-url>"}`; use `PUT` to S3 with `Content-Type: image/jpeg`, URL expires after 5 minutes | `401` token invalid or missing. `500` upload URL generation failed, including when another unexpired upload is already tracked. |
| `PATCH /users/avatar/validate-upload` | JSON body saved as `avatar_properties`; no DTO currently validates the shape | `200` updated profile record | `400` no pending upload, expired/wrong-owner upload, absent object, empty/over-5-MiB object, or non-`image/jpeg` content type. `401` token invalid or missing. `404` profile could not be updated. |

## Interpreting errors

- `400` means the input failed validation or the requested relationship/upload state is invalid. For avatar confirmation, the backend could not verify the pending S3 upload or its metadata.
- `401` means the bearer token was absent or rejected by the authentication guard.
- `404` means a requested profile is missing or a profile update could not find its row.
- `409` means profile creation conflicts with an existing profile or username.
- `500` means S3 or another server dependency failed. The global exception handler uses a generic message for unexpected non-HTTP failures.

Avatar objects are checked using S3 metadata (`ContentLength` and `ContentType`); this does not inspect the file's actual image format or dimensions. Pending upload tracking allows one active request per avatar object and consumes it after successful verification.

The 5 MiB check happens after upload: a presigned `PUT` URL does not enforce a reliable upload-size limit at transfer time. Confirmation only proves S3 metadata matches the configured type and size; it does not prove the bytes form a valid image. The avatar GET URL is not checked against S3 before it is returned and may fail when opened if the object is missing or inaccessible.

<!-- -MIMO: Move user endpoint inputs, outputs, and status interpretations into the API contract file. -->
