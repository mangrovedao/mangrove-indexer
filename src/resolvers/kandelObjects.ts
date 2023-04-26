import { Token } from "@generated/type-graphql";
import { Field, ObjectType } from "type-graphql";



@ObjectType()
export class KandelOffer{

  constructor(params:{
    inbound:Token,
    outbound:Token,
    inboundAmount: string,
    outboundAmount: string,
    id: number,
    index: number
  }){
    this.inbound = params.inbound
    this.outbound = params.outbound
    this.inboundAmount = params.inboundAmount
    this.outboundAmount = params.outboundAmount
    this.id = params.id
    this.index = params.index
  }


  @Field()
  inboundAmount!: string;

  @Field()
  outboundAmount!: string;

  @Field()
  inbound!: Token

  @Field()
  outbound!: Token

  @Field()
  id!: number

  @Field()
  index!: number

}

@ObjectType()
export class KandelStrategy{

  constructor(params?: {
    name: string,
    address: string,
    reserve: string,
    tokenA: Token,
    tokenB: Token,
    return:string,
    status: "active" | "closed"
  }) {
    if( params ){
      this.name = params.name
      this.address = params.address
      this.reserve = params.reserve
      this.tokenA = params.tokenA
      this.tokenB = params.tokenB
      // this.tokenAAmount = params.tokenAAmount // call on chain for values
      // this.tokenBAmount = params.tokenBAmount
      this.return = params.return
      this.status = params.status
    }
  }

  @Field()
  name?:string

  @Field()
  address?:string

  @Field()
  reserve?:string

  @Field()
  tokenA?: Token

  @Field()
  tokenB?: Token
 
  @Field()
  return?:string

  @Field()
  status?: "active" | "closed"
}

@ObjectType()
export class KandelFill {
  constructor( params:{
    takerGave: string;
    takerGot: string;
    order: {
        tx: {
            time: Date;
        };
        offerListing: {
            inboundToken: Token;
            outboundToken: Token;
        };
    };
} ){
    this.date = params.order.tx.time;
    this.inboundAmount = params.takerGave;
    this.outboundAmount = params.takerGot;
    this.inbound = params.order.offerListing.inboundToken;
    this.outbound = params.order.offerListing.outboundToken;
  }
  
  @Field()
  date!: Date;

  @Field()
  inboundAmount!: string;

  @Field()
  outboundAmount!: string;

  @Field()
  inbound!: Token

  @Field()
  outbound!: Token

  // Cannot give buy/sell
  // Cannot give base/quote (market)
  // Cannot give price
}


@ObjectType()
export class KandelFailedOffer {

  constructor( params:{
    takerGave: string;
    takerGot: string;
    order: {
        tx: {
            time: Date;
        };
        offerListing: {
            inboundToken: Token;
            outboundToken: Token;
        };
    };
} ){
    this.date = params.order.tx.time;
    this.inboundAmount = params.takerGave;
    this.outboundAmount = params.takerGot;
    this.inbound = params.order.offerListing.inboundToken;
    this.outbound = params.order.offerListing.outboundToken;
  }
  @Field()
  date!: Date;

  @Field()
  inboundAmount!: string;

  @Field()
  outboundAmount!: string;

  @Field()
  inbound!: Token

  @Field()
  outbound!: Token

  // Cannot give buy/sell
  // Cannot give base/quote (market)
  // Cannot give price
  // Cannot give bounty / penalty
}



@ObjectType()
export class KandelDepositWithdraw {

  constructor(params:{
    value: string;
    tokenBalanceEvent: {
        tokenBalanceVersion: {
            tx: {
                time: Date;
            };
        };
        token: Token;
    },
   event: "deposit" | "withdraw"; 
}){
    this.date = params.tokenBalanceEvent.tokenBalanceVersion.tx.time;
    this.event = params.event;
    this.currency = params.tokenBalanceEvent.token;
    this.valueReceived = params.value;
  }

  @Field()
  date!: Date;

  @Field()
  event!: "deposit" | "withdraw";

  @Field()
  currency!: Token; // Is currency and value Recevied the same token?

  @Field()
  valueReceived!: string


  // Cannot give price
  // Cannot give gas
}

@ObjectType()
export class KandelParameter {

  constructor(params: {
    event: {
            tx: {
                time: Date | undefined;
            };
            prevVersion:  string | undefined;
    };
    value: string;
    type: "admin" | "compoundRateBase" | "compoundRateQuote" | "gasReq" | "gasPrice" | "spread" | "ratio" | "length" | "router";
  }){
    this.date = params.event.tx.time;
    this.parameter = params.type;
    this.previousValue = params.event.prevVersion
    this.newValue = params.value
  }
  @Field()
  date?: Date;

  @Field()
  parameter!:"admin" | "compoundRateBase" | "compoundRateQuote" | "gasReq" | "gasPrice" | "spread" | "ratio" | "length" | "router" | "newKandel";

  @Field()
  previousValue?: string; 

  @Field()
  newValue!: string

  // Cannot give gas
}

@ObjectType()
export class KandelPopulateRetract {
  constructor(params: {
    tokenA: Token;
    tokenAAmount: string;
    tokenB: Token;
    tokenBAmount: string;
    event: "populate" | "retract";
    date: Date | undefined;
}){
    this.date = params.date;
    this.event = params.event;
    this.tokenA = params.tokenA;
    this.tokenAAmount = params.tokenAAmount
    this.tokenB = params.tokenB;
    this.tokenBAmount = params.tokenBAmount
  }

  @Field()
  date?: Date;

  @Field()
  event!: "populate" | "retract";

  @Field()
  tokenA!: Token; 

  @Field()
  tokenAAmount!: string

  @Field()
  tokenB!: Token; 

  @Field()
  tokenBAmount!: string

  // Cannot give gas
}