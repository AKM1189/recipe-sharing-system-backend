/*
  Warnings:

  - Added the required column `unit` to the `RecipeIngredient` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RecipeIngredient" ADD COLUMN     "unit" TEXT NOT NULL;
