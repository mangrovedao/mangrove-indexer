import * as prisma from "@prisma/client";
import * as mangroveSchema from "@proximaone/stream-schema-mangrove";

import { SetGasprice } from "@proximaone/stream-schema-mangrove/dist/mgvOracle";
import { AllDbOperations } from "src/state/dbOperations/allDbOperations";
import {
  ChainId, MgvOracleId
} from "src/state/model";
import { EventsLogic } from "../eventsLogic";
import { MgvOracleOperations } from "src/state/dbOperations/mgvOracleOperations";

export class MangroveOracleEventsLogic extends EventsLogic {

  async handelMgvOracleSetGasPrice(params:{
      gasPriceEvent: SetGasprice,
      undo: boolean,
      chainId: ChainId,
      address: string,
      transaction: prisma.Transaction | undefined,
      db: MgvOracleOperations
  }){

    const mgvOracleId = new MgvOracleId(params.chainId, params.address);
    if (params.undo) {
      await params.db.deleteLastVersionedMgvOracle( mgvOracleId);
      return;
    }

    await params.db.addVersionedMgvOracle({
        mgvOracleId,
        txId: params.transaction!.id,
        updateFunc: (model) => {
          model.gasprice = params.gasPriceEvent.parameters.gasPrice;
        },
      });
  }


}
