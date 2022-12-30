import * as prisma from "@prisma/client";

import { Timestamp } from "@proximaone/stream-client-js";
import { ChainId, TransactionId } from "src/state/model";
import { DbOperations } from "./dbOperations";

export class TransactionOperations extends DbOperations {
  public async ensureTransaction(params: {
    id: TransactionId,
    txHash: string,
    from: string,
    timestamp: Timestamp,
    blockNumber: number,
    blockHash: string
  }
  ): Promise<prisma.Transaction> {
    let transaction = await this.tx.transaction.findUnique({
      where: { id: params.id.value },
    });
    if (transaction === null) {
      transaction = {
        id: params.id.value,
        chainId: params.id.chainId.value,
        txHash: params.txHash,
        from: params.from,
        blockNumber: params.blockNumber,
        blockHash: params.blockHash,
        time: new Date(params.timestamp.epochMs),
      };
      await this.tx.transaction.create({ data: transaction });
    }
    return transaction;
  }

  public async checkBlockNumber(blockNumber: number, chainId: ChainId) {
    const count = await this.tx.transaction.count({
      where: {
        blockNumber: {
          gte: blockNumber
        },
        chainId: {
          equals: chainId.value
        }
      }
    })
    return count != 0;
  }
}
