import { PrismaClient } from "@prisma/client";
import { AllDbOperations, allDbOperations } from "src/state/dbOperations/allDbOperations";
import {
  ChainId,
  KandelId,
  TransactionId
} from "src/state/model";
import {
  PrismaStreamEventHandler,
  PrismaTransaction,
  TypedEvent,
} from "src/utils/common";
// import {KandelEvent, SeederEvent} from "@proximaone/stream-schema-mangrove/dist/kandel"
import { sleep } from "@mangrovedao/commonlib.js";
import { Timestamp } from "@proximaone/stream-client-js";
import * as mangroveSchema from "@proximaone/stream-schema-mangrove";
import * as kandel from "@proximaone/stream-schema-mangrove/dist/kandel";
import { createPatternMatcher } from "src/utils/discriminatedUnion";
import { KandelEventsLogic } from "./kandelEventsLogic";

export class IKandelLogicEventHandler extends PrismaStreamEventHandler<kandel.KandelEvent  > {
  public constructor(
    prisma: PrismaClient,
    stream: string,
    private readonly chainId: ChainId
  ) {
    super(prisma, stream);
  }

  protected async handleParsedEvents(
    events: TypedEvent<kandel.KandelEvent  >[],
    tx: PrismaTransaction
  ): Promise<void> {
    const allDbOperation = allDbOperations(tx);
    const kandelEventsLogic = new KandelEventsLogic(allDbOperation, this.stream);
    for (const event of events) {
      const { payload, undo, timestamp } = event;
      
      const chainId = new ChainId(payload.chainId);
      
      const txRef = payload.tx;
      const txId = new TransactionId(chainId, txRef.txHash);

      const ensureTx = async () => await allDbOperation.transactionOperations.ensureTransaction({
        id: txId,
        txHash: txRef.txHash,
        from:  txRef.sender,
        timestamp: timestamp,
        blockNumber: txRef.blockNumber,
        blockHash: txRef.blockHash
    });
      await eventMatcher({
        NewKandel: async (e) => {
          const transaction = await ensureTx();
          await kandelEventsLogic.handleKandelCreated(undo, chainId, e, transaction)
        },
        NewAaveKandel: async (e) => {
          const transaction = await ensureTx();
          await kandelEventsLogic.handleKandelCreated(undo, chainId, e, transaction)
        },
        SetParams: async (e) => {
          const transaction = await ensureTx();
          await kandelEventsLogic.handleKandelParamsUpdated(undo, new KandelId(chainId, payload.address), e, transaction);
        },
        Debit: async (e) => {
          const transaction = await ensureTx();
          await kandelEventsLogic.handleDepositWithdrawal(undo, new KandelId(chainId, payload.address), e, transaction)
        },
        Credit: async (e) => {
          const transaction = await ensureTx();
          await kandelEventsLogic.handleDepositWithdrawal(undo, new KandelId(chainId, payload.address), e, transaction)
        },
        Populate: async (e) => {
          await waitForTimestamp(allDbOperation, timestamp);
          const transaction = await ensureTx();
          await kandelEventsLogic.handlePopulate(undo, new KandelId(chainId, payload.address), e, transaction);
        },
        Retract: async (e) => {
          await waitForTimestamp(allDbOperation, timestamp);
          const transaction = await ensureTx();
          await kandelEventsLogic.handelRetractOffers(undo, new KandelId(chainId, payload.address), e, transaction);
        },
        SetIndexMapping: async (e) => {
          await waitForTimestamp(allDbOperation, timestamp);
          const transaction = await ensureTx();
          await kandelEventsLogic.handleSetIndexMapping(undo, new KandelId(chainId, payload.address), e, transaction);
        }
      })(payload);
    }
  }

  protected deserialize( 
    payload: Buffer
  ): kandel.KandelEvent {
    return mangroveSchema.streams.kandel.serdes.deserialize(payload);
  }
}

const eventMatcher =
  createPatternMatcher<kandel.KandelEvent  >();

async function waitForTimestamp(allDbOperation: AllDbOperations, timestamp:Timestamp) {
  let isReady = false;
  while (!isReady) {
    isReady = await allDbOperation.transactionOperations.hasTransactionWithGTETimestamp(timestamp);
    if (!isReady) {
      await sleep(5000);
    }
  }
}

