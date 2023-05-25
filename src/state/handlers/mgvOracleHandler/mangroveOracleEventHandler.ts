import * as prisma from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import * as mangroveSchema from "@proximaone/stream-schema-mangrove";
import { allDbOperations } from "src/state/dbOperations/allDbOperations";
import {
  ChainId,
  TransactionId
} from "src/state/model";
import {
  PrismaStreamEventHandler,
  PrismaTransaction,
  TypedEvent,
} from "src/utils/common";
import { createPatternMatcher } from "src/utils/discriminatedUnion";
import logger from "src/utils/logger";
import { MangroveOracleEventsLogic } from "./mangroveOracleEventsLogic";

export class MangroveOracleEventHandler extends PrismaStreamEventHandler<mangroveSchema.mgvOracle.MgvOracleEvent> {
  public constructor(
    prisma: PrismaClient,
    stream: string,
    private readonly chainId: ChainId
  ) {
    super(prisma, stream);
  }
  
  mangroveOracleEventsLogic = new MangroveOracleEventsLogic( this.stream);
  
  protected async handleParsedEvents(
    events: TypedEvent<mangroveSchema.mgvOracle.MgvOracleEvent>[],
    tx: PrismaTransaction
    ): Promise<void> {
      const allDbOperation = allDbOperations(tx);
    for (const event of events) {
      try {

        const { payload, undo, timestamp } = event;
        const txRef = payload.tx;
        let transaction: prisma.Transaction;
        if (txRef !== undefined) {
          const txId = new TransactionId(this.chainId, txRef.txHash);
          transaction = await allDbOperation.transactionOperations.ensureTransaction({
            id: txId,
            txHash: txRef.txHash,
            from:  txRef.sender,
            timestamp: timestamp,
            blockNumber: txRef.blockNumber,
            blockHash: txRef.blockHash
          });
        }
  
        await eventMatcher({
          SetGasprice: async (event) => {
            await this.mangroveOracleEventsLogic.handelMgvOracleSetGasPrice({undo, gasPriceEvent: event, transaction, address: payload.address, db: allDbOperation.mgvOracleOperations, chainId: this.chainId })
          },
          SetDensity: async (event) => {
            // ignored
          }
        })(payload);
      } catch (e){
        logger.warn(`offset:${event.offset.height}, stream: ${this.stream}`)
        throw e;
      }
    }
  }

  protected deserialize(payload: Buffer): mangroveSchema.mgvOracle.MgvOracleEvent {
    return mangroveSchema.streams.mgvOracle.serdes.deserialize(payload);
  }

}

const eventMatcher =
  createPatternMatcher<mangroveSchema.mgvOracle.MgvOracleEvent>();

