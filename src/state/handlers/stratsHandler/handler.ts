import * as mangroveSchema from "@proximaone/stream-schema-mangrove";
import { allDbOperations } from "../../dbOperations/allDbOperations";

import { PrismaClient } from "@prisma/client";
import {
  PrismaStreamEventHandler,
  PrismaTransaction,
  TypedEvent,
} from "../../../common";
import { createPatternMatcher } from "../../../utils/discriminatedUnion";
import {
  ChainId,
  TransactionId
} from "../../model";
import { MangroveOrderEventsLogic } from "./mangroveOrderEventsLogic";

export class IOrderLogicEventHandler extends PrismaStreamEventHandler<mangroveSchema.strategyEvents.StrategyEvent> {
  public constructor(
    prisma: PrismaClient,
    stream: string,
    private readonly chainId: ChainId
  ) {
    super(prisma, stream);
  }

  mangroveOrderEventsLogic = new MangroveOrderEventsLogic();

  protected async handleParsedEvents(
    events: TypedEvent<mangroveSchema.strategyEvents.StrategyEvent>[],
    tx: PrismaTransaction
  ): Promise<void> {
    const allDbOperation = allDbOperations(tx);
    for (const event of events) {
      const { payload, undo, timestamp } = event;
      const chainId = new ChainId(payload.chainId);

      const txRef = payload.tx;
      const txId = new TransactionId(chainId, txRef.txHash);
      const transaction = await allDbOperation.transactionOperations.ensureTransaction({
        id: txId,
        txHash: txRef.txHash,
        from:  txRef.sender,
        timestamp: timestamp,
        blockNumber: txRef.blockNumber,
        blockHash: txRef.blockHash
    });

      await eventMatcher({
        LogIncident: async (e) => {},
        NewOwnedOffer: async (e) => {},
        OrderSummary: async (e) => {
          this.mangroveOrderEventsLogic.handleOrderSummary(allDbOperation, chainId, e, event, txRef.txHash, undo, transaction)
        },
      })(payload);
    }
  }

  protected deserialize(
    payload: Buffer
  ): mangroveSchema.strategyEvents.StrategyEvent {
    return mangroveSchema.streams.strategies.serdes.deserialize(payload);
  }
}

const eventMatcher =
  createPatternMatcher<mangroveSchema.strategyEvents.StrategyEvent>();