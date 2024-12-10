-- AlterTable
ALTER TABLE "Workflow" ADD COLUMN "LastRunId" TEXT;
ALTER TABLE "Workflow" ADD COLUMN "LastRunStatus" TEXT;
ALTER TABLE "Workflow" ADD COLUMN "lastRunAt" DATETIME;
