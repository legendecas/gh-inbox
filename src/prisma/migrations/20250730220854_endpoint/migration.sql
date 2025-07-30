-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Endpoint" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "expires_at" DATETIME
);
INSERT INTO "new_Endpoint" ("created_at", "expires_at", "id", "token", "updated_at", "url", "username") SELECT "created_at", "expires_at", "id", "token", "updated_at", "url", "username" FROM "Endpoint";
DROP TABLE "Endpoint";
ALTER TABLE "new_Endpoint" RENAME TO "Endpoint";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
