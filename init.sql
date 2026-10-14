-- Create schema
CREATE SCHEMA IF NOT EXISTS friendships;
CREATE SCHEMA IF NOT EXISTS users;

-- Create users table
CREATE TYPE users.status AS ENUM (
    'active',
    'ban',
    'deactivate'
);

CREATE TABLE users.users (
    id UUID PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    status users.status NOT NULL DEFAULT 'active',
    avatar_url TEXT,
    FOREIGN KEY (id) REFERENCES "auth".users(id) ON DELETE CASCADE

);

-- Create enum type
CREATE TYPE friendships.relationship AS ENUM (
    'friend',
    'request_from_1',
    'request_from_2',
    'block_from_1',
    'block_from_2'
);

-- Create friendships table
CREATE TABLE friendships.friendships (
    id1 UUID NOT NULL,
    id2 UUID NOT NULL,
    status friendships.relationship NOT NULL,
    last_update TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id1, id2),

    CHECK (id1 <> id2),

    FOREIGN KEY (id1) REFERENCES "users".users(id) ON DELETE CASCADE,
    FOREIGN KEY (id2) REFERENCES "users".users(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX friendships_unique_pair
    ON friendships.friendships (
        LEAST(id1, id2),
        GREATEST(id1, id2)
    );


-- Create Permission
CREATE SCHEMA IF NOT EXISTS permission;

CREATE TYPE permission.role as ENUM(
'admin',
'user'
);

CREATE TABLE permission.permission(
    id UUID PRIMARY KEY,
    role permission.role NOT NULL,
    last_update TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (id) REFERENCES users.users(id) ON DELETE CASCADE
);



-- auto role
create or replace function public.assign_default_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into permission.permission (id, role,last_update)
  values (new.id, 'user',NOW())
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_user_created_assign_role on users.users;

create trigger on_user_created_assign_role
after insert on users.users
for each row
execute procedure public.assign_default_role();
