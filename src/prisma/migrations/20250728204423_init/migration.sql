-- CreateTable
CREATE TABLE "Thread" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reasons" TEXT NOT NULL,
    "updated_at" DATETIME NOT NULL,
    "unread" BOOLEAN NOT NULL,
    "last_read_at" DATETIME,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "archived_at" DATETIME,
    "bookmarked" BOOLEAN NOT NULL DEFAULT false,
    "bookmarked_at" DATETIME,
    "subject_number" INTEGER NOT NULL,
    "subject_title" TEXT NOT NULL,
    "subject_url" TEXT NOT NULL,
    "subject_type" TEXT NOT NULL,
    "subject_latest_comment_url" TEXT,
    "repository_id" TEXT NOT NULL,
    "endpoint_id" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Repository" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "private" BOOLEAN NOT NULL,
    "description" TEXT NOT NULL,
    "fork" BOOLEAN NOT NULL,
    "html_url" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "endpoint_id" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Owner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "login" TEXT NOT NULL,
    "avatar_url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "endpoint_id" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Label" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "repository_id" TEXT NOT NULL,
    "endpoint_id" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subject_type" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "is_draft" BOOLEAN NOT NULL DEFAULT false,
    "comment_count" INTEGER NOT NULL DEFAULT 0,
    "html_url" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL,
    "updated_at" DATETIME NOT NULL,
    "closed_at" DATETIME,
    "merged_at" DATETIME,
    "user_id" TEXT NOT NULL,
    "user_login" TEXT NOT NULL,
    "repository_id" TEXT NOT NULL,
    "labels" TEXT NOT NULL,
    "merged" BOOLEAN NOT NULL DEFAULT false,
    "mergeable" BOOLEAN NOT NULL DEFAULT false,
    "mergeable_state" TEXT,
    "endpoint_id" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "last_run" DATETIME,
    "next_run" DATETIME
);

-- CreateTable
CREATE TABLE "Endpoint" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "expires_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Task_type_key" ON "Task"("type");
