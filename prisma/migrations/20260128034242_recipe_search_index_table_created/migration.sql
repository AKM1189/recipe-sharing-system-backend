-- CreateTable
CREATE TABLE "RecipeSearchIndex" (
    "recipeId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(1536) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecipeSearchIndex_pkey" PRIMARY KEY ("recipeId")
);

-- AddForeignKey
ALTER TABLE "RecipeSearchIndex" ADD CONSTRAINT "RecipeSearchIndex_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
