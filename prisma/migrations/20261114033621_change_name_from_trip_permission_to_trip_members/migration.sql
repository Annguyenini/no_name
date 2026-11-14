/*
  Warnings:

  - You are about to drop the `trip_permission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "trip"."trip_permission" DROP CONSTRAINT "trip_permission_trip_id_fkey";

-- DropForeignKey
ALTER TABLE "trip"."trip_permission" DROP CONSTRAINT "trip_permission_user_id_fkey";

-- DropTable
DROP TABLE "trip"."trip_permission";

-- CreateTable
CREATE TABLE "trip"."trip_members" (
    "id" UUID NOT NULL,
    "trip_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "trip"."trip_role" DEFAULT 'viewer',

    CONSTRAINT "trip_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "trip_members_user_id_role_idx" ON "trip"."trip_members"("user_id", "role");

-- CreateIndex
CREATE INDEX "trip_members_trip_id_idx" ON "trip"."trip_members"("trip_id");

-- CreateIndex
CREATE INDEX "trip_members_trip_id_role_idx" ON "trip"."trip_members"("trip_id", "role");

-- CreateIndex
CREATE INDEX "trip_members_user_id_idx" ON "trip"."trip_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "trip_members_user_id_trip_id_key" ON "trip"."trip_members"("user_id", "trip_id");

-- AddForeignKey
ALTER TABLE "trip"."trip_members" ADD CONSTRAINT "trip_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip"."trip_members" ADD CONSTRAINT "trip_members_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trip"."trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
