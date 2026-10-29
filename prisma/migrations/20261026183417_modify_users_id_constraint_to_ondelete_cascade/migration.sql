/*
  Warnings:

  - You are about to drop the column `avatar_url` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
-- ALTER TABLE "users"."users" DROP CONSTRAINT "users_id_fkey";
--
-- -- AlterTable
-- ALTER TABLE "users"."users" DROP COLUMN "avatar_url",
-- ADD COLUMN     "avatar_id" TEXT;

-- AddForeignKey
ALTER TABLE "users"."users" ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
