-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "trip";

-- CreateEnum
CREATE TYPE "trip"."trip_role" AS ENUM ('owner', 'admin', 'editor', 'viewer');

-- CreateEnum
CREATE TYPE "trip"."trip_privacy" AS ENUM ('private', 'shared', 'public');

-- CreateTable
CREATE TABLE "trip"."trip" (
    "id" UUID NOT NULL,
    "image_cover_key" TEXT NOT NULL,
    "created_time" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_time" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trip_name" TEXT NOT NULL,
    "privacy" "trip"."trip_privacy" DEFAULT 'private',

    CONSTRAINT "trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip"."trip_permission" (
    "id" UUID NOT NULL,
    "trip_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "trip"."trip_role" DEFAULT 'viewer',

    CONSTRAINT "trip_permission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "trip_permission_user_id_role_idx" ON "trip"."trip_permission"("user_id", "role");

-- CreateIndex
CREATE INDEX "trip_permission_trip_id_idx" ON "trip"."trip_permission"("trip_id");

-- CreateIndex
CREATE INDEX "trip_permission_trip_id_role_idx" ON "trip"."trip_permission"("trip_id", "role");

-- CreateIndex
CREATE INDEX "trip_permission_user_id_idx" ON "trip"."trip_permission"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "trip_permission_user_id_trip_id_key" ON "trip"."trip_permission"("user_id", "trip_id");

-- AddForeignKey
ALTER TABLE "trip"."trip_permission" ADD CONSTRAINT "trip_permission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip"."trip_permission" ADD CONSTRAINT "trip_permission_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trip"."trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
