/*
  Warnings:

  - A unique constraint covering the columns `[invitationToken]` on the table `organizers` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."organizers" ADD COLUMN     "invitationExpiresAt" TIMESTAMP(3),
ADD COLUMN     "invitationToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "organizers_invitationToken_key" ON "public"."organizers"("invitationToken");
