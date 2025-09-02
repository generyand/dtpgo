/*
  Warnings:

  - You are about to drop the column `adminId` on the `activities` table. All the data in the column will be lost.
  - You are about to drop the `admins` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."activities" DROP CONSTRAINT "activities_adminId_fkey";

-- DropIndex
DROP INDEX "public"."activities_adminId_idx";

-- AlterTable
ALTER TABLE "public"."activities" DROP COLUMN "adminId",
ADD COLUMN     "userId" TEXT;

-- DropTable
DROP TABLE "public"."admins";

-- CreateIndex
CREATE INDEX "activities_userId_idx" ON "public"."activities"("userId");
