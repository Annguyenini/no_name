# Migration tests

Run the migration schema checks with `npm run test:migration`. The suite reads the live PostgreSQL database configured by the app's `DATABASE_URL`; apply migrations to that database before running it.

The users, permission, and friendships tests check their schemas and table columns. Permission also checks its nullable role enum, primary key, and user foreign key. Friendships checks its relationship enum, composite primary key, two user foreign keys, and both status lookup indexes. The enum labels are checked in their defined order; column and constraint checks ignore result order. Assertions include custom failure messages to identify the failed migration check.
