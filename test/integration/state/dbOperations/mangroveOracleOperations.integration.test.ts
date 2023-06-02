import assert from "assert";
import { before, describe, it } from "mocha";
import { MangroveOperations } from "src/state/dbOperations/mangroveOperations";
import {
  AccountId,
  ChainId,
  MangroveId,
  MangroveVersionId,
  MgvOracleId,
  MgvOracleVersionId,
  OfferListingId,
} from "src/state/model";
import { prisma } from "utils/test/mochaHooks";
import { Mangrove, MangroveVersion } from "@prisma/client";
import { MgvOracleOperations } from "src/state/dbOperations/mgvOracleOperations";

describe("Mangrove Oracle Operations Integration test suite", () => {
  let mangroveOracleOperations: MgvOracleOperations;
  before(() => {
    mangroveOracleOperations = new MgvOracleOperations(prisma);
  });

  const chainId = new ChainId(123);

  describe(MgvOracleOperations.prototype.deleteLastVersionedMgvOracle.name, () => {
    it("cannot find mgvOracle", async () => {
      const mgvOracleId = new MgvOracleId(chainId, "10");
      await assert.rejects(async () => {
        await mangroveOracleOperations.deleteLastVersionedMgvOracle(mgvOracleId);
      });
    });

    it("cannot find mgvOracleVersion", async () => {
      const mgvOracleId = new MgvOracleId(chainId, "10");
      const mgvOracleVersionId = new MgvOracleVersionId({ mgvOracleId, versionNumber: 0 });
      await prisma.mangroveOracle.create({
        data: {
          id: mgvOracleId.value,
          chainId: chainId.value,
          address: mgvOracleId.address,
          currentVersionId: mgvOracleVersionId.value
        }
      });
      await assert.rejects(async () => {
        await mangroveOracleOperations.deleteLastVersionedMgvOracle(mgvOracleId);
      });
    })

    it("delete last MangroveOracleVersion", async () => {
      const mgvOracleId = new MgvOracleId(chainId, "10");
      const mgvOracleVersionId = new MgvOracleVersionId({ mgvOracleId, versionNumber: 0 });
      await mangroveOracleOperations.addVersionedMgvOracle({
        mgvOracleId,
        txId: "txId1",
        updateFunc: (model) => {
          model.gasprice = "1";
        }
      });
      await mangroveOracleOperations.addVersionedMgvOracle({
        mgvOracleId,
        txId: "txId2",
        updateFunc: (model) => {
          model.gasprice = "2";
        }
      });
      const mgvOracleCount = await prisma.mangroveOracle.count();
      const mgvOracleVersionCount = await prisma.mangroveOracleVersion.count();

      await mangroveOracleOperations.deleteLastVersionedMgvOracle(mgvOracleId);
      assert.strictEqual(await prisma.mangroveOracle.count(), mgvOracleCount);
      assert.strictEqual(await prisma.mangroveOracleVersion.count(), mgvOracleVersionCount - 1);
    })

    it("delete last MangroveOracleVersion and MangroveOracle", async () => {
      const mgvOracleId = new MgvOracleId(chainId, "10");
      const mgvOracleVersionId = new MgvOracleVersionId({ mgvOracleId, versionNumber: 0 });
      await mangroveOracleOperations.addVersionedMgvOracle({
        mgvOracleId,
        txId: "txId1",
        updateFunc: (model) => {
          model.gasprice = "1";
        }
      });

      const mgvOracleCount = await prisma.mangroveOracle.count();
      const mgvOracleVersionCount = await prisma.mangroveOracleVersion.count();

      await mangroveOracleOperations.deleteLastVersionedMgvOracle(mgvOracleId);
      assert.strictEqual(await prisma.mangroveOracle.count(), mgvOracleCount - 1);
      assert.strictEqual(await prisma.mangroveOracleVersion.count(), mgvOracleVersionCount - 1);

    })
  })

  describe(MgvOracleOperations.prototype.getCurrentMgvOracleVersion.name, () => {
    it("cannot find mgvOracle", async () => {
      const mgvOracleId = new MgvOracleId(chainId, "10");
      const mgvOracleVersionId = new MgvOracleVersionId({ mgvOracleId, versionNumber: 0 });
      await assert.rejects(async () => {
        await mangroveOracleOperations.getCurrentMgvOracleVersion({ currentVersionId: mgvOracleVersionId.value })
      });
    });

    it("can find MgvOracle", async () => {
      const mgvOracleId = new MgvOracleId(chainId, "10");
      const mgvOracleVersionId = new MgvOracleVersionId({ mgvOracleId, versionNumber: 0 });
      await mangroveOracleOperations.addVersionedMgvOracle({
        mgvOracleId,
        txId: "txId1",
        updateFunc: (model) => {
          model.gasprice = "1";
        }
      });
      await mangroveOracleOperations.getCurrentMgvOracleVersion({ currentVersionId: mgvOracleVersionId.value })

    });

  });


  describe(MgvOracleOperations.prototype.addVersionedMgvOracle.name, () => {

    it("Create new mgv oracle and version", async () => {
      const mgvOracleId = new MgvOracleId(chainId, "10");
      const mgvOracleVersionId = new MgvOracleVersionId({ mgvOracleId, versionNumber: 0 });
      const txId = "txId";
      const mgvOracleCount = await prisma.mangroveOracle.count();
      const mgvOracleVersionCount = await prisma.mangroveOracleVersion.count();
      const { mgvOracle, mgvOracleVersion } = await mangroveOracleOperations.addVersionedMgvOracle({
        mgvOracleId,
        txId,
        updateFunc: (model) => {
          model.gasprice = "1";
        }
      });
      assert.deepStrictEqual(mgvOracle, {
        id: mgvOracleId.value,
        chainId: chainId.value,
        address: mgvOracleId.address,
        currentVersionId: mgvOracleVersionId.value
      });
      assert.deepStrictEqual(mgvOracleVersion, {
        id: mgvOracleVersionId.value,
        oracleId: mgvOracleId.value,
        txId,
        versionNumber: 0,
        prevVersionId: null,
        gasprice: "1",
        density: "0",
      });
      assert.strictEqual(await prisma.mangroveOracle.count(), mgvOracleCount + 1);
      assert.strictEqual(await prisma.mangroveOracleVersion.count(), mgvOracleVersionCount + 1);
    })

    it("Create new mgv oracle version of existing mgvOracle", async () => {
      const mgvOracleId = new MgvOracleId(chainId, "10");
      await mangroveOracleOperations.addVersionedMgvOracle({
        mgvOracleId,
        txId: "txId1",
        updateFunc: (model) => {
          model.gasprice = "0";
        }
      });

      const mgvOracleVersionId = new MgvOracleVersionId({ mgvOracleId, versionNumber: 1 });
      const txId = "txId";
      const mgvOracleCount = await prisma.mangroveOracle.count();
      const mgvOracleVersionCount = await prisma.mangroveOracleVersion.count();
      const { mgvOracle, mgvOracleVersion } = await mangroveOracleOperations.addVersionedMgvOracle({
        mgvOracleId,
        txId,
        updateFunc: (model) => {
          model.gasprice = "2";
        }
      });
      assert.deepStrictEqual(mgvOracle, {
        id: mgvOracleId.value,
        chainId: chainId.value,
        address: mgvOracleId.address,
        currentVersionId: mgvOracleVersionId.value
      });
      assert.deepStrictEqual(mgvOracleVersion, {
        id: mgvOracleVersionId.value,
        oracleId: mgvOracleId.value,
        txId,
        versionNumber: 1,
        prevVersionId: new MgvOracleVersionId({ mgvOracleId, versionNumber: 0 }).value,
        gasprice: "2",
        density: "0",
      });
      assert.strictEqual(await prisma.mangroveOracle.count(), mgvOracleCount);
      assert.strictEqual(await prisma.mangroveOracleVersion.count(), mgvOracleVersionCount + 1);
    })
  })
});