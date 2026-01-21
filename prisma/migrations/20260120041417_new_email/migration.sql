/*
  Warnings:

  - Added the required column `newEmail` to the `EmailChangeRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EmailChangeRequest" ADD COLUMN     "newEmail" TEXT NOT NULL;
