# no_name

Backend server built with NestJS, TypeScript, Prisma, and Supabase.

## Architecture

Project architecture and authentication flow documentation can be found in [`docs/`](docs/).

## Run the test server

1. Create `.env.test_supabase` in the project root using [`.env.example`](.env.example) as the template, and fill in the required Supabase and database values.
2. Build and start the server:

   ```bash
   docker compose up --build
   ```

The server listens on port `3000`. To stop it, press `Ctrl+C`. Keep `.env.test_supabase` local and do not commit credentials.

## Run tests

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Coverage
npm run test:cov
```
