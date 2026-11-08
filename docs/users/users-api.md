# Users API

All routes require `Authorization: Bearer <access_token>`. Supabase verifies the token, and the verified user ID is used for current-user operations. DTO validation rejects unknown fields on profile creation and display-name updates. Query `user_id` values must be UUIDs.

## Endpoints

| Endpoint | Input | Success response | Status codes |
| --- | --- | --- | --- |
| `GET /users/me` | No body or query. | `200` profile JSON: `{"id":"<uuid>","username":"user123","display_name":"Name","status":"active","avatar_properties":null}` | `401` token is missing or invalid. `404` authenticated user has no profile. |
| `GET /users/user?user_id=<uuid>` | Required UUID query parameter. | `200` public profile JSON: `{"id":"<uuid>","username":"user123","display_name":"Name"}` | `400` missing or invalid UUID. `401` token is missing or invalid. `404` profile does not exist. |
| `POST /users/create-profile` | JSON: `{"username":"user123","display_name":"Name"}`. Username is 6–10 ASCII letters or digits. Display name must be a string. ID is taken from the verified token. | `201` profile JSON with `id`, `username`, `display_name`, `status`, and `avatar_properties`. | `400` DTO validation or non-conflict create failure. `401` token is missing or invalid. `409` profile already exists or username is taken. |
| `PATCH /users/update-display-name` | JSON: `{"display_name":"New name"}`. Display name must be a string; empty strings are allowed. No other fields are accepted. | `200` updated profile JSON with `id`, `username`, `display_name`, `status`, and `avatar_properties`. | `400` body is missing, invalid, or contains unknown fields. `401` token is missing or invalid. `404` profile does not exist. |
| `GET /users/me/avatar` | No body or query. | `200` `{"url":"<presigned-get-url>"}`. URL expires after 300 seconds. | `401` token is missing or invalid. `500` URL generation failed. |
| `GET /users/avatar?user_id=<uuid>` | Required UUID query parameter. | `200` `{"url":"<presigned-get-url>"}`. URL expires after 300 seconds. | `400` missing or invalid UUID. `401` token is missing or invalid. `500` URL generation failed. |
| `GET /users/avatar/upload-url` | No body or query. | `200` `{"url":"<presigned-put-url>"}`. Use it to `PUT` an `image/jpeg`; URL expires after 5 minutes. | `401` token is missing or invalid. `500` URL generation failed, including when an unexpired upload is already pending. |
| `PATCH /users/avatar/validate-upload` | JSON body is saved as `avatar_properties`; no DTO validates its shape. The body must be valid JSON. | `200` updated user row JSON, including scalar columns such as `id`, `username`, `display_name`, `status`, `avatar_properties`, and `avatar_id`. | `400` upload request is missing, expired, owned by another user, missing from S3, empty, over 5 MiB, or not `image/jpeg`. `401` token is missing or invalid. `404` profile row could not be updated. `500` S3 or database operation failed. |

## Status meanings

- `200` request completed and returned the requested or updated data.
- `201` profile was created.
- `400` input or avatar upload verification failed.
- `401` bearer token was absent or Supabase rejected it.
- `404` requested profile is missing, or an update found no profile row.
- `409` profile creation conflicts with an existing profile or username.
- `500` an unexpected server dependency failed; upload URL generation errors are returned as `500`.

## Error response JSON

- Standard Nest HTTP errors use a JSON object such as `{"statusCode":404,"message":"Profile not found","error":"Not Found"}`. Validation errors return `400` with a message describing the invalid input.
- Application dependency errors handled by `AllExceptionsHandler` use `{"statusCode":500,"message":"Internal Server Error","timeStamp":"<date>"}` for unexpected failures. Custom application exceptions return the same fields with their public message and status code.

## Avatar behavior and limits

- Avatar URLs are generated without checking whether the profile or S3 object exists. A returned GET URL can fail when opened if the object is missing or inaccessible. `GET /users/avatar?user_id=...` currently lets any authenticated user request another user's avatar URL.
- Upload confirmation checks S3 metadata (`ContentLength` and `ContentType`) for a non-empty JPEG no larger than 5 MiB. It does not inspect the bytes to confirm the actual image format or dimensions.
- The size check happens after transfer. The presigned PUT URL does not enforce a reliable upload-size limit while uploading.
- Pending upload records live in an in-memory map, allow one active request per avatar key, expire after 5 minutes, and are consumed after successful verification. A process restart loses these pending records.
