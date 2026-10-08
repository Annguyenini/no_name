-- Create schema
CREATE SCHEMA IF NOT EXISTS friendships;

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

    CHECK (id1 <> id2)

    FOREIGN KEY (id1) REFERENCES "user".users(id) ON DELETE CASCADE,
    FOREIGN KEY (id2) REFERENCES "user".users(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX friendships_unique_pair
    ON friendships.friendships (
        LEAST(id1, id2),
        GREATEST(id1, id2)
    );
