/*
  Warnings:

  - You are about to drop the column `next_run` on the `Task` table. All the data in the column will be lost.
  - Added the required column `data` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Made the column `last_run` on table `Task` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "endpoint_id" INTEGER,
    "data" TEXT NOT NULL,
    "last_run" DATETIME NOT NULL
);
INSERT INTO "new_Task" ("id", "last_run", "type") SELECT "id", "last_run", "type" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
