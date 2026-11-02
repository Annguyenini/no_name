# Relationship module risks

Review scope: relationship controller, service, repository, Prisma model, and current unit specs.

## High: request transitions do not verify the relationship state

`acceptFriendRequest` upserts a `friend` row without first confirming an incoming pending request exists. An authenticated user can call accept with an arbitrary target UUID and create a friendship without the target's consent. `rejectFriendRequest`, `cancelFriendRequest`, and `deleteAFriend` all call the same pair-key delete without checking the stored status or direction, so callers can use the wrong action to remove other relationship states.

Before changing state, load the pair and verify the expected state and actor direction. For acceptance, require a pending request initiated by the target. Apply the check and update atomically (for example, a transaction or conditional update) to avoid a time-of-check/time-of-use race.

## Medium: self-target requests can violate the database invariant

The service sorts IDs, but does not reject equal IDs. The database requires `id1 < id2`, so a user can request themselves and trigger a database constraint error. Reject identical authenticated and target IDs with `400` before repository access.

## Medium: deletes are not idempotent and missing rows return a client error

The repository maps Prisma `P2025` to `BadRequestException`. Repeating a reject, cancel, or unfriend request therefore returns `400`. Decide and document whether missing relationships should return `404` or count as successful idempotent deletes.

## Low: service unit spec mocks the wrong repository method

`RelationshipsService.getReceivedFriendRequests` calls `getUserRelationships`, while the service spec mock defines `getReceivedFriendRequests`. That spec will fail with a missing function if exercised. Align the mock with the repository contract and cover each read direction.

## Operational risk: request flooding

Sending requests repeatedly upserts the same pair and updates its status/timestamp. Add rate limiting or a domain rule to prevent repeated requests from being used to churn records or harass users.

## Existing protections

- Routes use the Supabase guard and derive the acting user ID from the authenticated request.
- Target path parameters are UUID-validated.
- The composite primary key prevents duplicate rows for a pair, and the database check enforces canonical ID order.

// -MIMO: Record relationship transition, integrity, error-handling, and abuse risks found during the three-layer review.
