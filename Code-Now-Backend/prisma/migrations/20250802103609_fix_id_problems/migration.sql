-- DropForeignKey
ALTER TABLE "public"."Problem" DROP CONSTRAINT "Problem_id_fkey";

-- AddForeignKey
ALTER TABLE "public"."Problem" ADD CONSTRAINT "Problem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
