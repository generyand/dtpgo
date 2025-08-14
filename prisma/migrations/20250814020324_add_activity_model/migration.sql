-- CreateTable
CREATE TABLE "public"."activities" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "studentId" TEXT,
    "adminId" TEXT,
    "programId" TEXT,
    "metadata" JSONB,
    "source" TEXT NOT NULL DEFAULT 'system',
    "severity" TEXT NOT NULL DEFAULT 'info',
    "category" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activities_type_idx" ON "public"."activities"("type");

-- CreateIndex
CREATE INDEX "activities_action_idx" ON "public"."activities"("action");

-- CreateIndex
CREATE INDEX "activities_category_idx" ON "public"."activities"("category");

-- CreateIndex
CREATE INDEX "activities_source_idx" ON "public"."activities"("source");

-- CreateIndex
CREATE INDEX "activities_severity_idx" ON "public"."activities"("severity");

-- CreateIndex
CREATE INDEX "activities_studentId_idx" ON "public"."activities"("studentId");

-- CreateIndex
CREATE INDEX "activities_adminId_idx" ON "public"."activities"("adminId");

-- CreateIndex
CREATE INDEX "activities_programId_idx" ON "public"."activities"("programId");

-- CreateIndex
CREATE INDEX "activities_createdAt_idx" ON "public"."activities"("createdAt");

-- CreateIndex
CREATE INDEX "activities_type_createdAt_idx" ON "public"."activities"("type", "createdAt");

-- CreateIndex
CREATE INDEX "activities_category_createdAt_idx" ON "public"."activities"("category", "createdAt");

-- CreateIndex
CREATE INDEX "activities_source_createdAt_idx" ON "public"."activities"("source", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_programId_fkey" FOREIGN KEY ("programId") REFERENCES "public"."programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
