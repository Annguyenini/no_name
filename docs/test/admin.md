# Admin tests

## Coverage

- [admin.service.spec.ts](../../src/admin/admin.service.spec.ts) checks persisted-admin authorization, user lookup, missing-user behavior for lookup and deletion, and the delete confirmation response.

## Test type

Unit tests with mocked admin and user repositories. There are no admin controller or HTTP integration tests yet.
