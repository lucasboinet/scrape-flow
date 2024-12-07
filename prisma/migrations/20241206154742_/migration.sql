/*
  Warnings:

  - You are about to drop the column `defintion` on the `Workflow` table. All the data in the column will be lost.
  - Added the required column `definition` to the `Workflow` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
ALTER TABLE "Workflow" RENAME COLUMN "defintion" TO "definition";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
