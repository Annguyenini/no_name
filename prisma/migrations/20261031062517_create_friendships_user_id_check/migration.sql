-- -MIMO: Require friendship rows to store the smaller UUID in id1 for a canonical pair order.
ALTER TABLE "friendships"."friendships"
ADD CONSTRAINT "friendships_id1_less_than_id2"
CHECK ("id1" < "id2");
