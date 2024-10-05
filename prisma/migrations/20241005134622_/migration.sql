/*
  Warnings:

  - The primary key for the `Persons` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Phones` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `Addresses` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[tax_id]` on the table `Persons` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tax_id` to the `Persons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `area` to the `Phones` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Addresses" DROP CONSTRAINT "Addresses_person_id_fkey";

-- DropForeignKey
ALTER TABLE "Phones" DROP CONSTRAINT "Phones_person_id_fkey";

-- AlterTable
ALTER TABLE "Persons" DROP CONSTRAINT "Persons_pkey",
ADD COLUMN     "tax_id" VARCHAR(11) NOT NULL,
ALTER COLUMN "person_id" DROP DEFAULT,
ALTER COLUMN "person_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Persons_pkey" PRIMARY KEY ("person_id");
DROP SEQUENCE "Persons_person_id_seq";

-- AlterTable
ALTER TABLE "Phones" DROP CONSTRAINT "Phones_pkey",
ADD COLUMN     "area" CHAR(2) NOT NULL,
ALTER COLUMN "phone_id" DROP DEFAULT,
ALTER COLUMN "phone_id" SET DATA TYPE TEXT,
ALTER COLUMN "person_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Phones_pkey" PRIMARY KEY ("phone_id");
DROP SEQUENCE "Phones_phone_id_seq";

-- DropTable
DROP TABLE "Addresses";

-- CreateIndex
CREATE UNIQUE INDEX "Persons_tax_id_key" ON "Persons"("tax_id");

-- AddForeignKey
ALTER TABLE "Phones" ADD CONSTRAINT "Phones_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "Persons"("person_id") ON DELETE RESTRICT ON UPDATE CASCADE;
