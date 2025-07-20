-- CreateTable
CREATE TABLE "Thread" (
    "id" TEXT NOT NULL,
    "unread" BOOLEAN NOT NULL,
    "reasons" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,
    "last_read_at" TEXT NOT NULL,
    "subject_title" TEXT NOT NULL,
    "subject_url" TEXT NOT NULL,
    "subject_type" TEXT NOT NULL,
    "subject_latest_comment_url" TEXT NOT NULL,
    "repository_id" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Repository" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "private" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "fork" BOOLEAN NOT NULL,
    "html_url" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Label" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ThreadLabel" (
    "id" TEXT NOT NULL,
    "thread_id" TEXT NOT NULL,
    "label_id" TEXT NOT NULL,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,
    CONSTRAINT "ThreadLabel_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "Thread" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ThreadLabel_label_id_fkey" FOREIGN KEY ("label_id") REFERENCES "Label" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Thread_id_key" ON "Thread"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Repository_id_key" ON "Repository"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Label_id_key" ON "Label"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ThreadLabel_id_key" ON "ThreadLabel"("id");
