-- AlterTable
ALTER TABLE "public"."activities" ADD COLUMN     "eventId" TEXT,
ADD COLUMN     "organizerId" TEXT;

-- CreateTable
CREATE TABLE "public"."organizers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'organizer',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "invitedBy" TEXT,
    "invitedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."events" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "timeInStart" TIMESTAMP(3) NOT NULL,
    "timeInEnd" TIMESTAMP(3) NOT NULL,
    "timeOutStart" TIMESTAMP(3) NOT NULL,
    "timeOutEnd" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."organizer_event_assignments" (
    "id" TEXT NOT NULL,
    "organizerId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "organizer_event_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."attendance" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "timeIn" TIMESTAMP(3),
    "timeOut" TIMESTAMP(3),
    "scanType" TEXT NOT NULL,
    "scannedBy" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizers_email_key" ON "public"."organizers"("email");

-- CreateIndex
CREATE INDEX "organizers_email_idx" ON "public"."organizers"("email");

-- CreateIndex
CREATE INDEX "organizers_role_idx" ON "public"."organizers"("role");

-- CreateIndex
CREATE INDEX "organizers_isActive_idx" ON "public"."organizers"("isActive");

-- CreateIndex
CREATE INDEX "organizers_invitedBy_idx" ON "public"."organizers"("invitedBy");

-- CreateIndex
CREATE INDEX "organizers_createdAt_idx" ON "public"."organizers"("createdAt");

-- CreateIndex
CREATE INDEX "events_name_idx" ON "public"."events"("name");

-- CreateIndex
CREATE INDEX "events_startDate_idx" ON "public"."events"("startDate");

-- CreateIndex
CREATE INDEX "events_endDate_idx" ON "public"."events"("endDate");

-- CreateIndex
CREATE INDEX "events_isActive_idx" ON "public"."events"("isActive");

-- CreateIndex
CREATE INDEX "events_createdBy_idx" ON "public"."events"("createdBy");

-- CreateIndex
CREATE INDEX "events_createdAt_idx" ON "public"."events"("createdAt");

-- CreateIndex
CREATE INDEX "sessions_eventId_idx" ON "public"."sessions"("eventId");

-- CreateIndex
CREATE INDEX "sessions_timeInStart_idx" ON "public"."sessions"("timeInStart");

-- CreateIndex
CREATE INDEX "sessions_timeInEnd_idx" ON "public"."sessions"("timeInEnd");

-- CreateIndex
CREATE INDEX "sessions_timeOutStart_idx" ON "public"."sessions"("timeOutStart");

-- CreateIndex
CREATE INDEX "sessions_timeOutEnd_idx" ON "public"."sessions"("timeOutEnd");

-- CreateIndex
CREATE INDEX "sessions_isActive_idx" ON "public"."sessions"("isActive");

-- CreateIndex
CREATE INDEX "sessions_createdAt_idx" ON "public"."sessions"("createdAt");

-- CreateIndex
CREATE INDEX "organizer_event_assignments_organizerId_idx" ON "public"."organizer_event_assignments"("organizerId");

-- CreateIndex
CREATE INDEX "organizer_event_assignments_eventId_idx" ON "public"."organizer_event_assignments"("eventId");

-- CreateIndex
CREATE INDEX "organizer_event_assignments_assignedBy_idx" ON "public"."organizer_event_assignments"("assignedBy");

-- CreateIndex
CREATE INDEX "organizer_event_assignments_assignedAt_idx" ON "public"."organizer_event_assignments"("assignedAt");

-- CreateIndex
CREATE INDEX "organizer_event_assignments_isActive_idx" ON "public"."organizer_event_assignments"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "organizer_event_assignments_organizerId_eventId_key" ON "public"."organizer_event_assignments"("organizerId", "eventId");

-- CreateIndex
CREATE INDEX "attendance_studentId_idx" ON "public"."attendance"("studentId");

-- CreateIndex
CREATE INDEX "attendance_eventId_idx" ON "public"."attendance"("eventId");

-- CreateIndex
CREATE INDEX "attendance_sessionId_idx" ON "public"."attendance"("sessionId");

-- CreateIndex
CREATE INDEX "attendance_scanType_idx" ON "public"."attendance"("scanType");

-- CreateIndex
CREATE INDEX "attendance_scannedBy_idx" ON "public"."attendance"("scannedBy");

-- CreateIndex
CREATE INDEX "attendance_timeIn_idx" ON "public"."attendance"("timeIn");

-- CreateIndex
CREATE INDEX "attendance_timeOut_idx" ON "public"."attendance"("timeOut");

-- CreateIndex
CREATE INDEX "attendance_createdAt_idx" ON "public"."attendance"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_studentId_sessionId_scanType_key" ON "public"."attendance"("studentId", "sessionId", "scanType");

-- CreateIndex
CREATE INDEX "activities_organizerId_idx" ON "public"."activities"("organizerId");

-- CreateIndex
CREATE INDEX "activities_eventId_idx" ON "public"."activities"("eventId");

-- AddForeignKey
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "public"."organizers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organizer_event_assignments" ADD CONSTRAINT "organizer_event_assignments_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "public"."organizers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organizer_event_assignments" ADD CONSTRAINT "organizer_event_assignments_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendance" ADD CONSTRAINT "attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendance" ADD CONSTRAINT "attendance_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendance" ADD CONSTRAINT "attendance_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
