/*
  Warnings:

  - Made the column `student_id_image` on table `Student` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Student` MODIFY `student_id_image` LONGTEXT NOT NULL;
