-- CreateTable
CREATE TABLE "SavedSearch" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sort_weight" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "leading_visual" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "description" TEXT,
    "endpoint_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
