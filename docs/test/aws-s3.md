# AWS S3 tests

## Coverage

- [s3.service.spec.ts](../../src/aws/s3/s3.service.spec.ts) checks that `S3Service` can be constructed when an S3 client provider is supplied.

## Test type

Unit setup test with a mocked S3 client. URL signing, metadata reads, upload behavior, and S3 errors do not have direct `S3Service` tests; upload verification behavior is covered in the contents module tests.
