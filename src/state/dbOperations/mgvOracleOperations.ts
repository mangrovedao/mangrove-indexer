import * as prisma from "@prisma/client";
import { ChainId, MangroveId, MgvOracleId, MgvOracleVersionId } from "src/state/model";
import { DbOperations, toNewVersionUpsert } from "./dbOperations";
import _ from "lodash";

export class MgvOracleOperations extends DbOperations {

    public async addVersionedMgvOracle(params: {
        mgvOracleId: MgvOracleId,
        txId: string,
        updateFunc?: (model: Omit<prisma.MangroveOracleVersion, "id" | "oracleId" | "versionNumber" | "prevVersionId">) => void,
    }) {
        const mgvOracleId = new MgvOracleId(params.mgvOracleId.chainId, params.mgvOracleId.address)
        let mgvOracle: prisma.MangroveOracle | null = await this.tx.mangroveOracle.findUnique({
            where: { id: mgvOracleId.value },
        });


        let newVersion: prisma.MangroveOracleVersion;

        if (mgvOracle === null) {
            const mgvOracleVersionId = new MgvOracleVersionId({ mgvOracleId, versionNumber: 0 });
            mgvOracle = {
                id: mgvOracleId.value,
                chainId: params.mgvOracleId.chainId.value,
                address: params.mgvOracleId.address,
                currentVersionId: mgvOracleVersionId.value
            };
            newVersion = {
                id: mgvOracleVersionId.value,
                oracleId: mgvOracleId.value,
                txId: params.txId,
                versionNumber: 0,
                prevVersionId: null,
                gasprice: "0",
                density: "0"
            };
        } else {
            const oldVersion = await this.getCurrentMgvOracleVersion(mgvOracle);
            const newVersionNumber = oldVersion.versionNumber + 1;
            newVersion = _.merge(oldVersion, {
                id: new MgvOracleVersionId({ mgvOracleId, versionNumber: newVersionNumber }).value,
                txId: params.txId,
                versionNumber: newVersionNumber,
                prevVersionId: oldVersion.id,
            });
        }

        if (params.updateFunc) {
            params.updateFunc(newVersion);
        }
        await this.tx.mangroveOracle.upsert(
            toNewVersionUpsert(mgvOracle, newVersion.id)
        );

        await this.tx.mangroveOracleVersion.create({ data: newVersion });
    }

    async deleteLastVersionedMgvOracle(mgvOracleId: MgvOracleId) {
        const mgvOracle = await this.tx.mangroveOracle.findUnique({
            where: {id: mgvOracleId.value},
            include: { currentVersion: true }, 
        });
        if (mgvOracle === null) {
            throw new Error(`MgvOracle not found, id: ${mgvOracleId.value}`);
        }
        if (mgvOracle.currentVersion === null)
            throw new Error(`MgvOracle ${mgvOracleId.value} has no current version`);


        const prevVersionId = mgvOracle.currentVersion!.prevVersionId;
        if (prevVersionId === null) {
            await this.tx.mangroveOracle.update({
                where: { id: mgvOracleId.value },
                data: {
                    currentVersionId: "",
                },
            });
            await this.tx.mangroveOracleVersion.delete({
                where: { id: mgvOracle.currentVersionId },
            });
            await this.tx.mangroveOracle.delete({ where: {id: mgvOracleId.value } });
        } else {
            await this.tx.mangroveOracle.update({
                where: { id: mgvOracleId.value },
                data: {
                    currentVersionId: prevVersionId,
                },
            });
            await this.tx.mangroveOracleVersion.delete({
                where: { id: mgvOracle.currentVersionId },
            });
        }
    }

    private async getCurrentMgvOracleVersion(mgvOracle: prisma.MangroveOracle): Promise<prisma.MangroveOracleVersion> {
        const currentVersion = await this.tx.mangroveOracleVersion.findUnique({
            where: { id: mgvOracle.currentVersionId },
        });
        if (currentVersion === null) {
            throw new Error(`MgvOracleVersion not found, id: ${mgvOracle.currentVersionId}`);
        }
        return currentVersion;
    }


}
