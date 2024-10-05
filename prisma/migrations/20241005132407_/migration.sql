/*
  Warnings:

  - You are about to drop the `Atendimentos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Pessoa` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Atendimentos" DROP CONSTRAINT "Atendimentos_pessoaId_fkey";

-- DropTable
DROP TABLE "Atendimentos";

-- DropTable
DROP TABLE "Pessoa";

-- CreateTable
CREATE TABLE "Persons" (
    "person_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Persons_pkey" PRIMARY KEY ("person_id")
);

-- CreateTable
CREATE TABLE "Addresses" (
    "address_id" SERIAL NOT NULL,
    "cep" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "person_id" INTEGER NOT NULL,

    CONSTRAINT "Addresses_pkey" PRIMARY KEY ("address_id")
);

-- CreateTable
CREATE TABLE "Phones" (
    "phone_id" SERIAL NOT NULL,
    "phone_number" TEXT NOT NULL,
    "person_id" INTEGER NOT NULL,

    CONSTRAINT "Phones_pkey" PRIMARY KEY ("phone_id")
);

-- AddForeignKey
ALTER TABLE "Addresses" ADD CONSTRAINT "Addresses_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "Persons"("person_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phones" ADD CONSTRAINT "Phones_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "Persons"("person_id") ON DELETE RESTRICT ON UPDATE CASCADE;
