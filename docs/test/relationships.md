# Relationships tests

## Coverage

- [relationships.controller.spec.ts](../../src/relationships/specs/relationships.controller.spec.ts) checks authenticated-user identity handling, rejection without an ID, and delegation for friend list and friend request/friend actions.
- [relationships.service.spec.ts](../../src/relationships/specs/relationships.service.spec.ts) checks service construction, received-request status direction, and creation of a friend request with a timestamp.
- [relationships.repository.service.spec.ts](../../src/relationships/specs/relationships.repository.service.spec.ts) checks directional status queries, foreign-key error mapping, rejected status transitions, and status-scoped deletion.
- [relationships-smoke.spec.ts](../../test/smoke/relationships-smoke.spec.ts) sends HTTP requests covering missing/invalid authentication, malformed/self target IDs, missing targets, and invalid or absent relationship state for friend request, accept, reject/cancel, and delete flows. Read routes are checked for authentication failures.

## Test types and dependencies

Controller, service, and repository tests are isolated unit tests. The smoke suite uses the real application, auth, and database and requires a configured test account and migrated database. Its cases are request-isolated; it does not verify successful relationship mutations.
