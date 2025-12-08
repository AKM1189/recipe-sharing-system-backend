/*
  Warnings:

  - Changed the type of `difficulty` on the `Recipe` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `Recipe` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "RecipeDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'EXPERT');

-- CreateEnum
CREATE TYPE "RecipeStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Recipe" DROP COLUMN "difficulty",
ADD COLUMN     "difficulty" "RecipeDifficulty" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "RecipeStatus" NOT NULL;
