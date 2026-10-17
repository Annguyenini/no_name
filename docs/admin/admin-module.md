# Admin module

All routes require a valid Supabase bearer token and an app permission row with the `admin` role. The role is checked from `permission.permission` for every request.

## Get a user

`GET /admin/users/:user_id`

The path parameter must be a UUID. Returns the application profile fields (`id`, `username`, `display_name`, `status`, and `avatar_url`). Missing users return `404`.

## Delete a user profile

`DELETE /admin/users/:user_id`

The path parameter must be a UUID. Deletes the application's profile row; related permissions and friendship rows are removed by database cascades. It does not delete the Supabase Auth account. Missing users return `404`.
