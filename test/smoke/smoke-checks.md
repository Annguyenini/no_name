# Smoke test coverage

<!-- -MIMO: List the main checks covered by smoke tests so their scope is easy to review. -->

- `auth-sad.spec.ts`: sign-up and sign-in reject invalid or missing inputs; token sign-in and refresh reject missing or invalid tokens.
- `user-sad.spec.ts`: user and profile routes reject missing tokens, invalid or missing values, and missing profiles.
- `relationships-smoke.spec.ts`: all relationship routes reject missing or invalid tokens. Mutation routes reject malformed UUIDs, self-targets, and requests for relationships that do not exist. Sending to a nonexistent user returns `404`.
