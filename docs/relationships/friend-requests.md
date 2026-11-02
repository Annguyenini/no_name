# Received friend requests

The relationships controller exposes these authenticated routes:

- `GET /relationships/friends` returns the signed-in user's friends.
- `GET /relationships/send-friend-requests` returns outgoing requests.
- `GET /relationships/received-friend-requests` returns incoming requests.
- `POST /relationships/friend-requests/:target_user_id` sends a request.
- `POST /relationships/friend-requests/received/:target_user_id/accept` accepts an incoming request.
- `DELETE /relationships/friend-requests/received/:target_user_id` rejects an incoming request.
- `DELETE /relationships/friend-requests/sent/:target_user_id` cancels an outgoing request.
- `DELETE /relationships/friends/:target_user_id` removes a friend.

Routes with `target_user_id` require a UUID path parameter. The Supabase guard verifies the bearer token; the controller always gets the acting user ID from that verified token.

The service delegates relationship reads to the repository, which selects matching rows for either friendship-row direction and sorts by `last_update` newest first.

No request body or query parameters are accepted. The response is an array of objects containing `id1`, `id2`, `status`, and `last_update`. An empty array means there are no incoming requests. Missing authentication returns `401`; database failures return a generic `500` response.

Example response:

```json
[
  {
    "id1": "sender-user-uuid",
    "id2": "signed-in-user-uuid",
    "status": "request_from_1",
    "last_update": "2026-10-30T12:00:00.000Z"
  }
]
```

## Sending a friend request (service)

`POST /relationships/friend-requests/:target_user_id` calls `RelationshipsService.sendFriendRequest` with the verified user ID and target ID. The service normalizes the IDs, sets request direction based on the sender, and delegates an upsert to the repository. It supplies `last_update` as a JavaScript `Date` representing the current time; Prisma persists it to the `TIMESTAMPTZ` column.

## Follow-up

- Add and verify a `ValidationPipe` for relationship requests when a controller route accepts client input.
