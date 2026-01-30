/*
  Warnings:

  - A unique constraint covering the columns `[recipeId]` on the table `RecipeSearchIndex` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RecipeSearchIndex_recipeId_key" ON "RecipeSearchIndex"("recipeId");
