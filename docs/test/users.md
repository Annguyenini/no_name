# Users tests

## Coverage

- [users.controller.spec.ts](../../src/users/specs/users.controller.spec.ts) checks each controller method's service delegation, missing authenticated IDs, and that profile creation uses the verified request ID.
- [users.service.spec.ts](../../src/users/specs/users.service.spec.ts) checks profile lookup and not-found behavior, profile creation and existing-profile conflicts, avatar URL responses, and that avatar properties are saved only after upload verification.
- [users.repository.service.spec.ts](../../src/users/specs/users.repository.service.spec.ts) checks Prisma user mapping and lookups, display-name updates, missing-row handling, and unexpected update errors.
- [users.integrate.spec.ts](../../src/users/specs/users.integrate.spec.ts) sends HTTP requests through the Nest guard, validation, controller, service, and repository with mocked Supabase, Prisma, and contents providers. It covers profile reads (including missing profiles), public-field filtering, profile creation and conflict, display-name success and invalid input, avatar URL access, and validation without a verified avatar upload.
- [user-sad.spec.ts](../../test/smoke/user-sad.spec.ts) checks live HTTP failure cases for missing authentication, missing or malformed profile IDs, missing profiles, invalid profile-creation input, and invalid display-name input.

## Test types and dependencies

Controller, service, and repository specs are unit tests. The integration spec uses a mocked database and external providers with the real Nest HTTP stack. The smoke suite needs the configured auth service and migrated database. Avatar URL generation is stubbed in the integration test; actual S3 behavior is not exercised there.
