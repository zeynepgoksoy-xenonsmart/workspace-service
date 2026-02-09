/*
  Warnings:

  - You are about to drop the `Workspace` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Workspace";

-- CreateTable
CREATE TABLE "workspaces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "is_general" BOOLEAN NOT NULL DEFAULT false,
    "is_workspace" BOOLEAN NOT NULL DEFAULT false,
    "is_zone" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_parameters" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_parameters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_snapshots" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "correlation_id" TEXT,
    "correlation_type" TEXT,
    "workspace_snapshot" JSONB NOT NULL,
    "parameters_snapshot" JSONB NOT NULL,
    "snapshot_reason" TEXT,
    "used_for_compensation" BOOLEAN NOT NULL DEFAULT false,
    "compensated_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspace_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workspaces_owner_id_idx" ON "workspaces"("owner_id");

-- CreateIndex
CREATE INDEX "workspaces_deleted_at_idx" ON "workspaces"("deleted_at");

-- CreateIndex
CREATE INDEX "workspaces_is_deleted_idx" ON "workspaces"("is_deleted");

-- CreateIndex
CREATE INDEX "workspaces_created_at_idx" ON "workspaces"("created_at");

-- CreateIndex
CREATE INDEX "workspace_parameters_workspace_id_idx" ON "workspace_parameters"("workspace_id");

-- CreateIndex
CREATE INDEX "workspace_parameters_name_idx" ON "workspace_parameters"("name");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_parameters_workspace_id_name_key" ON "workspace_parameters"("workspace_id", "name");

-- CreateIndex
CREATE INDEX "workspace_snapshots_workspace_id_idx" ON "workspace_snapshots"("workspace_id");

-- CreateIndex
CREATE INDEX "workspace_snapshots_correlation_id_correlation_type_idx" ON "workspace_snapshots"("correlation_id", "correlation_type");

-- CreateIndex
CREATE INDEX "workspace_snapshots_created_at_idx" ON "workspace_snapshots"("created_at");

-- CreateIndex
CREATE INDEX "workspace_snapshots_expires_at_idx" ON "workspace_snapshots"("expires_at");

-- CreateIndex
CREATE INDEX "workspace_snapshots_used_for_compensation_created_at_idx" ON "workspace_snapshots"("used_for_compensation", "created_at");

-- AddForeignKey
ALTER TABLE "workspace_parameters" ADD CONSTRAINT "workspace_parameters_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_snapshots" ADD CONSTRAINT "workspace_snapshots_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
