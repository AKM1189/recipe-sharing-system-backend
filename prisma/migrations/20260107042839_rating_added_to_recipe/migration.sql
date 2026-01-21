/*
  Warnings:

  - You are about to alter the column `rating` on the `Review` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - Added the required column `userId` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "rating" DECIMAL(5,2);

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "rating" SET DATA TYPE INTEGER;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
