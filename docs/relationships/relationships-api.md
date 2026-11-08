# Relationships API

Every route requires `Authorization: Bearer <access_token>`. The acting user ID always comes from the verified token. There are no body or query parameters. Every `target_user_id` path parameter must be a UUID.

## Endpoint contracts

| Endpoint | Expected input | Success output | Common status codes and what they mean |
| --- | --- | --- | --- |
| `GET /relationships/friends` | No body/query | `200` array of relationship rows; `[]` if none | `401` token missing or invalid. `500` database lookup failed. |
| `GET /relationships/send-friend-requests` | No body/query | `200` array of outgoing request rows; `[]` if none | `401` token missing or invalid. `500` database lookup failed. |
| `GET /relationships/received-friend-requests` | No body/query | `200` array of incoming request rows; `[]` if none | `401` token missing or invalid. `500` database lookup failed. |
| `POST /relationships/friend-requests/:target_user_id` | Target user's UUID in path | `201` created relationship row | `400` malformed UUID, self-target, or a relationship pair already exists. `401` token invalid. `404` target user does not exist. `500` other database failure. |
| `POST /relationships/friend-requests/received/:target_user_id/accept` | Sender's UUID in path | `201` `{"count":1}` after conditional status update | `400` malformed UUID, self-target, or no incoming request in the expected state. `401` token invalid. `500` database failure. |
| `DELETE /relationships/friend-requests/received/:target_user_id` | Sender's UUID in path | `200` `{"count":1}` after delete | `400` malformed UUID, self-target, or no incoming request in the expected state. `401` token invalid. `500` database failure. |
| `DELETE /relationships/friend-requests/sent/:target_user_id` | Recipient's UUID in path | `200` `{"count":1}` after delete | `400` malformed UUID, self-target, or no outgoing request in the expected state. `401` token invalid. `500` database failure. |
| `DELETE /relationships/friends/:target_user_id` | Friend's UUID in path | `200` `{"count":1}` after delete | `400` malformed UUID, self-target, or no friendship row in the expected state. `401` token invalid. `500` database failure. |

List rows contain `id1`, `id2`, `status`, and `last_update`, ordered newest first. Mutation pair IDs are canonicalized into sorted order; the `status` indicates which side sent a request. Accept only changes a row whose current status matches the incoming request direction. Reject, cancel, and unfriend only delete rows with the expected status.

## Interpreting errors

- `400` means the target ID is malformed, the caller targeted themself, or no relationship exists in the state required by that operation. For send, it can mean the pair already has a row.
- `401` means the bearer token is missing or rejected.
- `404` on send means the target ID has no user record.
- `500` means a database or unexpected server failure. Known database errors are returned with a safe repository message; unexpected errors use a generic response.

<!-- -MIMO: Move relationship endpoint inputs, outputs, and status interpretations into the API contract file. -->
