-- MIMO: Add optional JSONB metadata to user avatars.
ALTER TABLE "users"."users"
ADD COLUMN "avatar_properties" JSONB;
