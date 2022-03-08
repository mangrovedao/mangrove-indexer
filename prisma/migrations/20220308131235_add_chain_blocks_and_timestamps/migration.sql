-- AlterTable
ALTER TABLE "Mangrove" ADD COLUMN     "address" VARCHAR(80) NOT NULL DEFAULT E'',
ADD COLUMN     "chainId" INTEGER NOT NULL DEFAULT -1;

-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "blockNumber" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "blockNumber" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Chain" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Chain_pkey" PRIMARY KEY ("id")
);