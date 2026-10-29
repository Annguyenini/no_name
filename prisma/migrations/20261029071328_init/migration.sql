-- This is an empty migration.
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "friendships";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "permission";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "users";

-- CreateEnum
CREATE TYPE "users"."status" AS ENUM ('active', 'ban', 'deactivate');

-- CreateEnum
CREATE TYPE "permission"."role" AS ENUM ('admin', 'user');

-- CreateEnum
CREATE TYPE "friendships"."relationship" AS ENUM ('friend', 'request_from_1', 'request_from_2', 'block_from_1', 'block_from_2');

-- CreateTable
CREATE TABLE "users"."users" (
    "id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" "users"."status" NOT NULL,
    "avatar_properties" JSONB,
    "avatar_id" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission"."permission" (
    "id" UUID NOT NULL,
    "role" "permission"."role",
    "last_update" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friendships"."friendships" (
    "id1" UUID NOT NULL,
    "id2" UUID NOT NULL,
    "status" "friendships"."relationship" NOT NULL,
    "last_update" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "friendships_pkey" PRIMARY KEY ("id1","id2")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"."users"("username");

-- AddForeignKey
ALTER TABLE "users"."users" ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "permission"."permission" ADD CONSTRAINT "permission_id_fkey" FOREIGN KEY ("id") REFERENCES "users"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "friendships"."friendships" ADD CONSTRAINT "friendships_id1_fkey" FOREIGN KEY ("id1") REFERENCES "users"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "friendships"."friendships" ADD CONSTRAINT "friendships_id2_fkey" FOREIGN KEY ("id2") REFERENCES "users"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
