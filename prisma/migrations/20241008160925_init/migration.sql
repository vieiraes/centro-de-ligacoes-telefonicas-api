-- CreateEnum
CREATE TYPE "CallStatus" AS ENUM ('PENDING', 'QUEUED', 'IN_PROGRESS', 'COMPLETED', 'MISSED', 'NOT_COMPLETED', 'CANCELED');

-- CreateTable
CREATE TABLE "Person" (
    "personId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "taxId" VARCHAR(11) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Person_pkey" PRIMARY KEY ("personId")
);

-- CreateTable
CREATE TABLE "Phone" (
    "phoneId" TEXT NOT NULL,
    "area" CHAR(2) NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Phone_pkey" PRIMARY KEY ("phoneId")
);

-- CreateTable
CREATE TABLE "Attendant" (
    "attendantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "tokenId" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Attendant_pkey" PRIMARY KEY ("attendantId")
);

-- CreateTable
CREATE TABLE "Call" (
    "callId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "phoneId" TEXT NOT NULL,
    "attendantId" TEXT NOT NULL,
    "status" "CallStatus" NOT NULL,

    CONSTRAINT "Call_pkey" PRIMARY KEY ("callId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Person_taxId_key" ON "Person"("taxId");

-- AddForeignKey
ALTER TABLE "Phone" ADD CONSTRAINT "Phone_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("personId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Call" ADD CONSTRAINT "Call_phoneId_fkey" FOREIGN KEY ("phoneId") REFERENCES "Phone"("phoneId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Call" ADD CONSTRAINT "Call_attendantId_fkey" FOREIGN KEY ("attendantId") REFERENCES "Attendant"("attendantId") ON DELETE RESTRICT ON UPDATE CASCADE;
