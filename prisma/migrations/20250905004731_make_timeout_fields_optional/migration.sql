-- AlterTable
ALTER TABLE "public"."sessions" ALTER COLUMN "timeOutStart" DROP NOT NULL,
ALTER COLUMN "timeOutEnd" DROP NOT NULL;
