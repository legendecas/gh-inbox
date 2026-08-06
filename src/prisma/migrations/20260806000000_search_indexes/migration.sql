-- CreateTable indexes for common search filters (derived from saved searches):
-- every list query orders by updated_at; repo/owner filters probe by
-- repository_id; label and reason searches resolve candidates by subject triple.
CREATE INDEX "Thread_endpoint_id_updated_at_idx" ON "Thread"("endpoint_id", "updated_at");

CREATE INDEX "Thread_endpoint_id_repository_id_idx" ON "Thread"("endpoint_id", "repository_id");

CREATE INDEX "Thread_endpoint_id_repository_id_subject_number_idx" ON "Thread"("endpoint_id", "repository_id", "subject_number");

CREATE INDEX "Repository_endpoint_id_full_name_idx" ON "Repository"("endpoint_id", "full_name");

CREATE INDEX "Owner_endpoint_id_login_idx" ON "Owner"("endpoint_id", "login");
