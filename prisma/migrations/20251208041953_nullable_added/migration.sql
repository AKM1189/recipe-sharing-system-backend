-- AlterTable
ALTER TABLE "Recipe" ALTER COLUMN "imageUrl" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "RecipeStep" ALTER COLUMN "imageUrl" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "updatedAt" DROP NOT NULL;
