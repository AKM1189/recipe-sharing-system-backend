/*
  Warnings:

  - A unique constraint covering the columns `[name,recipeId]` on the table `RecipeIngredient` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stepNumber,recipeId]` on the table `RecipeStep` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RecipeIngredient_name_recipeId_key" ON "RecipeIngredient"("name", "recipeId");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeStep_stepNumber_recipeId_key" ON "RecipeStep"("stepNumber", "recipeId");
