-- CreateTable
CREATE TABLE "MangroveOracle" (
    "id" VARCHAR(255) NOT NULL,
    "chainId" INTEGER NOT NULL DEFAULT -1,
    "address" VARCHAR(80) NOT NULL,
    "currentVersionId" TEXT NOT NULL,

    CONSTRAINT "MangroveOracle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MangroveOracleVersion" (
    "id" VARCHAR(255) NOT NULL,
    "oracleId" VARCHAR(255) NOT NULL,
    "txId" VARCHAR(255) NOT NULL,
    "gasprice" TEXT NOT NULL,
    "density" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "prevVersionId" TEXT,

    CONSTRAINT "MangroveOracleVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MangroveOracle_currentVersionId_key" ON "MangroveOracle"("currentVersionId");

-- CreateIndex
CREATE INDEX "MangroveOracle_chainId_idx" ON "MangroveOracle"("chainId");

-- CreateIndex
CREATE UNIQUE INDEX "MangroveOracle_chainId_address_key" ON "MangroveOracle"("chainId", "address");

-- CreateIndex
CREATE UNIQUE INDEX "MangroveOracleVersion_prevVersionId_key" ON "MangroveOracleVersion"("prevVersionId");

-- CreateIndex
CREATE INDEX "MangroveOracleVersion_txId_idx" ON "MangroveOracleVersion"("txId");

-- CreateIndex
CREATE UNIQUE INDEX "MangroveOracleVersion_oracleId_versionNumber_key" ON "MangroveOracleVersion"("oracleId", "versionNumber");
