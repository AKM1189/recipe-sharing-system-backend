-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "parentId" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profileUrl" TEXT;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Review"("id") ON DELETE SET NULL ON UPDATE CASCADE;
