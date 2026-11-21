-- CreateEnum
CREATE TYPE "InterfaceMode" AS ENUM ('MINIMAL', 'STANDARD', 'ANALYTICAL');

-- CreateEnum
CREATE TYPE "ThemePreference" AS ENUM ('SYSTEM', 'LIGHT', 'DARK');

-- CreateEnum
CREATE TYPE "ConsentKind" AS ENUM ('EXTERNAL_AI_PROCESSING');

-- CreateEnum
CREATE TYPE "AiScope" AS ENUM ('PROFILE', 'GOALS', 'PLANNING', 'JOURNAL', 'MEMORY');

-- CreateEnum
CREATE TYPE "DomainStatus" AS ENUM ('UNSET', 'THRIVING', 'STEADY', 'NEEDS_ATTENTION', 'RESTING');

-- CreateEnum
CREATE TYPE "GoalHorizon" AS ENUM ('TEN_YEARS', 'FIVE_YEARS', 'ONE_YEAR', 'QUARTER', 'MONTH', 'OPEN');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ACHIEVED', 'RELEASED');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('IDEA', 'ACTIVE', 'PAUSED', 'DONE', 'DROPPED');

-- CreateEnum
CREATE TYPE "ProjectKind" AS ENUM ('WORK', 'PERSONAL', 'LEARNING', 'CREATIVE', 'RECREATION', 'HOME');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Effort" AS ENUM ('LOW', 'MODERATE', 'HIGH');

-- CreateEnum
CREATE TYPE "EnergyLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH');

-- CreateEnum
CREATE TYPE "PlanItemKind" AS ENUM ('MAIN', 'OPTIONAL', 'COMMITMENT', 'LEISURE', 'RECOVERY');

-- CreateEnum
CREATE TYPE "Sensitivity" AS ENUM ('NORMAL', 'PERSONAL', 'SENSITIVE', 'HIGHLY_SENSITIVE');

-- CreateEnum
CREATE TYPE "CuriosityStatus" AS ENUM ('OPEN', 'EXPLORING', 'ANSWERED', 'PARKED');

-- CreateEnum
CREATE TYPE "CaptureStatus" AS ENUM ('PROPOSED', 'CONFIRMED', 'DISCARDED');

-- CreateEnum
CREATE TYPE "ClassifierKind" AS ENUM ('RULES', 'AI');

-- CreateEnum
CREATE TYPE "MemoryLayer" AS ENUM ('PROFILE', 'EPISODIC', 'WORKING', 'REFLECTIVE');

-- CreateEnum
CREATE TYPE "MemoryStatus" AS ENUM ('USER_STATED', 'IMPORTED', 'AI_INFERENCE', 'USER_CONFIRMED', 'SPECULATIVE', 'REJECTED');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('CAPTURE', 'JOURNAL', 'TASK', 'GOAL', 'PROJECT', 'CONVERSATION', 'USER');

-- CreateEnum
CREATE TYPE "AdvisorMode" AS ENUM ('STRATEGIST', 'ANALYST', 'COACH', 'PLANNER', 'EXPLORER', 'REFLECTOR');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "onboardedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "userId" TEXT NOT NULL,
    "interfaceMode" "InterfaceMode" NOT NULL DEFAULT 'STANDARD',
    "theme" "ThemePreference" NOT NULL DEFAULT 'SYSTEM',
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Amsterdam',
    "weekStartsOn" INTEGER NOT NULL DEFAULT 1,
    "recoveryMode" BOOLEAN NOT NULL DEFAULT false,
    "recoveryModeSince" TIMESTAMP(3),
    "quietMode" BOOLEAN NOT NULL DEFAULT false,
    "proactiveInsights" BOOLEAN NOT NULL DEFAULT false,
    "advisorMode" "AdvisorMode" NOT NULL DEFAULT 'STRATEGIST',
    "usageReasons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "UserConsent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "ConsentKind" NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "version" TEXT NOT NULL DEFAULT '2026-11',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiDomainPermission" (
    "userId" TEXT NOT NULL,
    "scope" "AiScope" NOT NULL,
    "allowed" BOOLEAN NOT NULL,

    CONSTRAINT "AiDomainPermission_pkey" PRIMARY KEY ("userId","scope")
);

-- CreateTable
CREATE TABLE "LifeDomain" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "status" "DomainStatus" NOT NULL DEFAULT 'UNSET',
    "statusNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LifeDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalValue" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "domainId" TEXT,
    "parentId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "motivation" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 2,
    "horizon" "GoalHorizon" NOT NULL DEFAULT 'OPEN',
    "targetDate" TIMESTAMP(3),
    "progressMeasure" TEXT,
    "status" "GoalStatus" NOT NULL DEFAULT 'ACTIVE',
    "captureId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoalMilestone" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "doneAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoalMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goalId" TEXT,
    "domainId" TEXT,
    "title" TEXT NOT NULL,
    "purpose" TEXT,
    "description" TEXT,
    "kind" "ProjectKind" NOT NULL DEFAULT 'PERSONAL',
    "status" "ProjectStatus" NOT NULL DEFAULT 'IDEA',
    "nextAction" TEXT,
    "targetDate" TIMESTAMP(3),
    "captureId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "goalId" TEXT,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" INTEGER NOT NULL DEFAULT 2,
    "dueDate" DATE,
    "scheduledFor" DATE,
    "estimateMinutes" INTEGER,
    "effort" "Effort",
    "context" TEXT,
    "postponedCount" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "captureId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "intention" TEXT,
    "energy" "EnergyLevel",
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyPlanItem" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "kind" "PlanItemKind" NOT NULL,
    "label" TEXT NOT NULL,
    "taskId" TEXT,
    "minutes" INTEGER,
    "doneAt" TIMESTAMP(3),
    "aligned" BOOLEAN,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "captureId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyPlanItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "mood" INTEGER,
    "energy" "EnergyLevel",
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sensitivity" "Sensitivity" NOT NULL DEFAULT 'SENSITIVE',
    "excludeFromAi" BOOLEAN NOT NULL DEFAULT false,
    "captureId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CuriosityItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "theme" TEXT,
    "notes" TEXT,
    "status" "CuriosityStatus" NOT NULL DEFAULT 'OPEN',
    "captureId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CuriosityItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Capture" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "status" "CaptureStatus" NOT NULL DEFAULT 'PROPOSED',
    "classifier" "ClassifierKind" NOT NULL,
    "proposal" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "resultType" TEXT,
    "resultId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Capture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Memory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "layer" "MemoryLayer" NOT NULL,
    "status" "MemoryStatus" NOT NULL,
    "content" TEXT NOT NULL,
    "domainKey" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "sensitivity" "Sensitivity" NOT NULL DEFAULT 'PERSONAL',
    "excludedFromAi" BOOLEAN NOT NULL DEFAULT false,
    "userEditable" BOOLEAN NOT NULL DEFAULT true,
    "supersededById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastVerifiedAt" TIMESTAMP(3),

    CONSTRAINT "Memory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemorySource" (
    "id" TEXT NOT NULL,
    "memoryId" TEXT NOT NULL,
    "sourceType" "SourceType" NOT NULL,
    "sourceId" TEXT,
    "excerpt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemorySource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIConversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "mode" "AdvisorMode" NOT NULL DEFAULT 'STRATEGIST',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "contextRefs" JSONB,
    "generator" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "UserConsent_userId_kind_createdAt_idx" ON "UserConsent"("userId", "kind", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LifeDomain_userId_key_key" ON "LifeDomain"("userId", "key");

-- CreateIndex
CREATE INDEX "PersonalValue_userId_idx" ON "PersonalValue"("userId");

-- CreateIndex
CREATE INDEX "Goal_userId_status_idx" ON "Goal"("userId", "status");

-- CreateIndex
CREATE INDEX "Project_userId_status_idx" ON "Project"("userId", "status");

-- CreateIndex
CREATE INDEX "Task_userId_status_dueDate_idx" ON "Task"("userId", "status", "dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "DailyPlan_userId_date_key" ON "DailyPlan"("userId", "date");

-- CreateIndex
CREATE INDEX "DailyPlanItem_planId_idx" ON "DailyPlanItem"("planId");

-- CreateIndex
CREATE INDEX "JournalEntry_userId_occurredAt_idx" ON "JournalEntry"("userId", "occurredAt");

-- CreateIndex
CREATE INDEX "CuriosityItem_userId_status_idx" ON "CuriosityItem"("userId", "status");

-- CreateIndex
CREATE INDEX "Capture_userId_status_createdAt_idx" ON "Capture"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Memory_userId_layer_status_idx" ON "Memory"("userId", "layer", "status");

-- CreateIndex
CREATE INDEX "MemorySource_memoryId_idx" ON "MemorySource"("memoryId");

-- CreateIndex
CREATE INDEX "MemorySource_sourceType_sourceId_idx" ON "MemorySource"("sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "AIConversation_userId_updatedAt_idx" ON "AIConversation"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "AIMessage_conversationId_createdAt_idx" ON "AIMessage"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserConsent" ADD CONSTRAINT "UserConsent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiDomainPermission" ADD CONSTRAINT "AiDomainPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LifeDomain" ADD CONSTRAINT "LifeDomain_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalValue" ADD CONSTRAINT "PersonalValue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "LifeDomain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Goal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalMilestone" ADD CONSTRAINT "GoalMilestone_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "LifeDomain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyPlan" ADD CONSTRAINT "DailyPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyPlanItem" ADD CONSTRAINT "DailyPlanItem_planId_fkey" FOREIGN KEY ("planId") REFERENCES "DailyPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyPlanItem" ADD CONSTRAINT "DailyPlanItem_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CuriosityItem" ADD CONSTRAINT "CuriosityItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Capture" ADD CONSTRAINT "Capture_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemorySource" ADD CONSTRAINT "MemorySource_memoryId_fkey" FOREIGN KEY ("memoryId") REFERENCES "Memory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIConversation" ADD CONSTRAINT "AIConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIMessage" ADD CONSTRAINT "AIMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AIConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ───────────── Full-text retrieval indexes (hand-written) ─────────────
-- 'simple' config: no language-specific stemming, so French and English
-- entries are both matched by their literal words. See docs/AI_MEMORY.md.
CREATE INDEX "Memory_fts_idx" ON "Memory" USING GIN (to_tsvector('simple', "content"));
CREATE INDEX "JournalEntry_fts_idx" ON "JournalEntry" USING GIN (to_tsvector('simple', coalesce("title", '') || ' ' || "body"));
CREATE INDEX "Task_fts_idx" ON "Task" USING GIN (to_tsvector('simple', "title" || ' ' || coalesce("notes", '')));
CREATE INDEX "Goal_fts_idx" ON "Goal" USING GIN (to_tsvector('simple', "title" || ' ' || coalesce("description", '') || ' ' || coalesce("motivation", '')));
CREATE INDEX "Project_fts_idx" ON "Project" USING GIN (to_tsvector('simple', "title" || ' ' || coalesce("purpose", '') || ' ' || coalesce("description", '')));
CREATE INDEX "CuriosityItem_fts_idx" ON "CuriosityItem" USING GIN (to_tsvector('simple', "question" || ' ' || coalesce("notes", '')));
