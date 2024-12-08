-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SPECIALIST', 'CLIENT');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'CLIENT';
