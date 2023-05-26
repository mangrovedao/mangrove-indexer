import { MgvOracleOperations } from "src/state/dbOperations/mgvOracleOperations";
import { MangroveOracleEventsLogic } from "src/state/handlers/mgvOracleHandler/mangroveOracleEventsLogic"
import { ChainId, MgvOracleId, MgvOracleVersionId } from "src/state/model";
import { prisma } from "utils/test/mochaHooks";
import assert from "assert";
import { SetGasprice } from "@proximaone/stream-schema-mangrove/dist/mgvOracle";



describe("Mangrove Oracle Event Logic Integration test suite", () => {
    const chainId = new ChainId(123);

    describe(MangroveOracleEventsLogic.prototype.handelMgvOracleSetGasPrice.name, () => {
        it("Create new MangroveOracle and version", async () => {
            const mgvOracleId = new MgvOracleId(chainId, "10");
            const mgvOracleEventsLogic = new MangroveOracleEventsLogic("stream");
            const mgvOracleCount = await prisma.mangroveOracle.count();
            const mgvOracleVersionCount = await prisma.mangroveOracleVersion.count();
            await mgvOracleEventsLogic.handelMgvOracleSetGasPrice({
                gasPriceEvent: {
                    type: "SetGasprice",
                    parameters: {
                        gasPrice: "1"
                    }
                },
                undo: false,
                address: mgvOracleId.address,
                transaction: {
                    id: "txId1",
                    chainId: chainId.value,
                    blockNumber: 1,
                    time: new Date(),
                    blockHash: "blockHash",
                    from: "from",
                    txHash: "txHash",
                },
                db: new MgvOracleOperations(prisma),
                chainId: chainId,
            });
            assert.strictEqual(mgvOracleCount + 1, await prisma.mangroveOracle.count());
            assert.strictEqual(mgvOracleVersionCount + 1, await prisma.mangroveOracleVersion.count());
        })

        it("Undo set gas price", async () => {
            const mgvOracleId = new MgvOracleId(chainId, "10");
            const mgvOracleEventsLogic = new MangroveOracleEventsLogic("stream");
            const event:SetGasprice = {
                type: "SetGasprice",
                parameters: {
                    gasPrice: "1"
                }
            };
            const handleGaspriceParams = {
                gasPriceEvent:event,
                address: mgvOracleId.address,
                transaction: {
                    id: "txId1",
                    chainId: chainId.value,
                    blockNumber: 1,
                    time: new Date(),
                    blockHash: "blockHash",
                    from: "from",
                    txHash: "txHash",
                },
                db: new MgvOracleOperations(prisma),
                chainId: chainId,
            };
            await mgvOracleEventsLogic.handelMgvOracleSetGasPrice({...handleGaspriceParams, undo: false});

            const mgvOracleCount = await prisma.mangroveOracle.count();
            const mgvOracleVersionCount = await prisma.mangroveOracleVersion.count();
            await mgvOracleEventsLogic.handelMgvOracleSetGasPrice({...handleGaspriceParams, undo: true});
            assert.strictEqual(mgvOracleCount-1, await prisma.mangroveOracle.count());
            assert.strictEqual(mgvOracleVersionCount-1, await prisma.mangroveOracleVersion.count());
        });

    })
})