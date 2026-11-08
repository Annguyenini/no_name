# Configuration tests

## Coverage

- [config.service.spec.ts](../../src/config/config.service.spec.ts) checks service construction, reading AWS credentials from the environment, and failure when required AWS values are missing.

## Test type

Unit tests that stub environment variables. The test file restores variables after each case that changes them.
