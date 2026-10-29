-- CreateIndex
CREATE INDEX "idx_user_1_status" ON "friendships"."friendships"("id1", "status");

-- CreateIndex
CREATE INDEX "idx_user_2_status" ON "friendships"."friendships"("id2", "status");
