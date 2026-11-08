# Contents tests

## Coverage

- [contents.repository.service.spec.ts](../../src/contents/contents.repository.service.spec.ts) covers avatar upload verification: a valid upload is consumed once; missing, expired, or other-user pending requests are rejected; missing S3 objects, empty or oversized objects, and incorrect content types are rejected.

## Test type

Unit tests using the in-memory `UploadRequests` store and a mocked S3 service. The generated upload URL is stubbed. Request URL generation and duplicate pending-request behavior do not have their own direct cases in this spec.
