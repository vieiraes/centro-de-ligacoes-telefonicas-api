-- AlterTable
ALTER TABLE "Attendant" ADD COLUMN     "tokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "tokenId" TEXT;
