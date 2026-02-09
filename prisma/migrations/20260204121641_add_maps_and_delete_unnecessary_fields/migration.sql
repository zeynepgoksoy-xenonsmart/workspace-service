/*
  Warnings:

  - You are about to drop the column `is_deleted` on the `workspaces` table. All the data in the column will be lost.
  - You are about to drop the column `is_general` on the `workspaces` table. All the data in the column will be lost.
  - You are about to drop the column `is_workspace` on the `workspaces` table. All the data in the column will be lost.
  - You are about to drop the column `is_zone` on the `workspaces` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "workspaces_is_deleted_idx";

-- AlterTable
ALTER TABLE "workspaces" DROP COLUMN "is_deleted",
DROP COLUMN "is_general",
DROP COLUMN "is_workspace",
DROP COLUMN "is_zone";
