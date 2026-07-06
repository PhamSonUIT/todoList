/*
  Warnings:

  - You are about to drop the column `date` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Task` table. All the data in the column will be lost.
  - Added the required column `endAt` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startAt` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Task_date_idx` ON `Task`;

-- AlterTable
ALTER TABLE `Task` DROP COLUMN `date`,
    DROP COLUMN `endTime`,
    DROP COLUMN `startTime`,
    ADD COLUMN `endAt` DATETIME(3) NOT NULL,
    ADD COLUMN `startAt` DATETIME(3) NOT NULL;

-- CreateIndex
CREATE INDEX `Task_startAt_idx` ON `Task`(`startAt`);
