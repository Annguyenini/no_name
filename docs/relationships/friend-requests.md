# Received friend requests

`GET /relationships/friend-requests/received` returns the signed-in user's incoming friend requests.

The Supabase guard verifies the bearer token. The controller takes the user ID from that verified token; callers cannot choose another user's ID. The service delegates to the relationship repository, which selects rows addressed to that user for either friendship-row direction and sorts by `last_update` newest first.

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
