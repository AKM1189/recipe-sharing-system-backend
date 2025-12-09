/*
  Warnings:

  - A unique constraint covering the columns `[userId,device]` on the table `RefreshToken` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_userId_device_key" ON "RefreshToken"("userId", "device");
