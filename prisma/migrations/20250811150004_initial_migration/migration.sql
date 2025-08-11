-- CreateTable
CREATE TABLE "public"."programs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."students" (
    "id" TEXT NOT NULL,
    "studentIdNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "programId" TEXT NOT NULL,
    "registrationSource" TEXT NOT NULL DEFAULT 'public',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."registration_attempts" (
    "id" TEXT NOT NULL,
    "studentId" TEXT,
    "attemptData" JSONB NOT NULL,
    "source" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registration_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_status" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "emailType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastAttempt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "programs_name_key" ON "public"."programs"("name");

-- CreateIndex
CREATE UNIQUE INDEX "students_studentIdNumber_key" ON "public"."students"("studentIdNumber");

-- CreateIndex
CREATE UNIQUE INDEX "students_email_key" ON "public"."students"("email");

-- CreateIndex
CREATE INDEX "students_studentIdNumber_idx" ON "public"."students"("studentIdNumber");

-- CreateIndex
CREATE INDEX "students_email_idx" ON "public"."students"("email");

-- CreateIndex
CREATE INDEX "students_programId_idx" ON "public"."students"("programId");

-- CreateIndex
CREATE INDEX "students_year_idx" ON "public"."students"("year");

-- CreateIndex
CREATE INDEX "students_registrationSource_idx" ON "public"."students"("registrationSource");

-- CreateIndex
CREATE INDEX "students_createdAt_idx" ON "public"."students"("createdAt");

-- CreateIndex
CREATE INDEX "registration_attempts_source_idx" ON "public"."registration_attempts"("source");

-- CreateIndex
CREATE INDEX "registration_attempts_success_idx" ON "public"."registration_attempts"("success");

-- CreateIndex
CREATE INDEX "registration_attempts_createdAt_idx" ON "public"."registration_attempts"("createdAt");

-- CreateIndex
CREATE INDEX "registration_attempts_ipAddress_idx" ON "public"."registration_attempts"("ipAddress");

-- CreateIndex
CREATE INDEX "email_status_studentId_idx" ON "public"."email_status"("studentId");

-- CreateIndex
CREATE INDEX "email_status_status_idx" ON "public"."email_status"("status");

-- CreateIndex
CREATE INDEX "email_status_emailType_idx" ON "public"."email_status"("emailType");

-- CreateIndex
CREATE INDEX "email_status_createdAt_idx" ON "public"."email_status"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."students" ADD CONSTRAINT "students_programId_fkey" FOREIGN KEY ("programId") REFERENCES "public"."programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
