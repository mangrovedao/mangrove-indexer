import { Token } from "@generated/type-graphql";
import { Transaction } from "@prisma/client";
import { Field, ObjectType } from "type-graphql";


@ObjectType()
export class KandelOffer{

  constructor(params:{
    gives: number,
    wants: number,
    index: number,
    base: Token,
    quote: Token,
    offerId: number,
    live: boolean,
    price: number,
    gasreq: number,
    gasprice: number,
    gasbase: number,
    offerType: string,
    deprovision: boolean,
    initialTxHash: string
  }){
    this.gives = params.gives
    this.wants = params.wants
    this.index = params.index
    this.base = params.base
    this.quote = params.quote
    this.offerId = params.offerId
    this.live = params.live
    this.price = params.price
    this.gasreq = params.gasreq
    this.gasprice = params.gasprice
    this.gasbase = params.gasbase
    this.offerType = params.offerType
    this.deprovision = params.deprovision
    this.initialTxHash = params.initialTxHash
  }


  @Field()
  gives!: number;

  @Field()
  wants!: number;

  @Field()
  base!: Token

  @Field()
  quote!: Token

  @Field()
  offerId!: number

  @Field()
  index!: number

  @Field()
  live!: boolean

  @Field()
  price!: number

  @Field()
  offerType!: string

  @Field()
  gasreq!: number
  
  @Field()
  gasprice!: number

  @Field()
  gasbase!: number

  @Field()
  deprovision!: boolean

  @Field()
  initialTxHash!: string

}

@ObjectType()
export class KandelStrategy{

  constructor(params?: {
    name: string,
    address: string,
    reserve: string,
    base: Token,
    quote: Token,
    return:string,
    type: string,
    offers: KandelOffer[]
  }) {
    if( params ){
      this.name = params.name
      this.address = params.address
      this.reserve = params.reserve
      this.base = params.base
      this.quote = params.quote
      this.return = params.return
      this.type = params.type
      this.offers = params.offers
    }
  }

  @Field()
  name?:string

  @Field()
  address?:string

  @Field()
  reserve?:string

  @Field()
  base?: Token

  @Field()
  quote?: Token
 
  @Field()
  return?:string

  @Field()
  type?:string

  @Field( type => [KandelOffer])
  offers?: KandelOffer[]
  
}



@ObjectType()
export class KandelFill {
  constructor( params:{
    baseAmount: number,
    quoteAmount: number,
    base: Token,
    quote: Token,
    offerType: string,
    price: number,
    date: Date,
    txHash: string
} ){
    this.baseAmount = params.baseAmount;
    this.quoteAmount = params.quoteAmount;
    this.base = params.base;
    this.quote = params.quote;
    this.date = params.date;
    this.offerType = params.offerType;
    this.price = params.price;
    this.txHash = params.txHash;
  }
  
  @Field()
  date!: Date;

  @Field()
  quoteAmount!: number;

  @Field()
  baseAmount!: number;

  @Field()
  base!: Token

  @Field()
  quote!: Token

  @Field()
  offerType!: string

  @Field()
  price!: number

  @Field()
  txHash!: string

}


@ObjectType()
export class KandelFailedOffer {

  constructor( params:{
    base: Token,
    quote: Token,
    baseAmount: number,
    quoteAmount: number,
    date: Date,
    txHash: string
} ){
    this.base = params.base;
    this.quote = params.quote;
    this.baseAmount = params.baseAmount;
    this.quoteAmount = params.quoteAmount;
    this.date = params.date;
    this.txHash = params.txHash;
  }
  @Field()
  date!: Date;

  @Field()
  baseAmount!: number;

  @Field()
  quoteAmount!: number;

  @Field()
  quote!: Token

  @Field()
  base!: Token

  @Field()
  txHash!: string

}



@ObjectType()
export class KandelDepositWithdraw {

  constructor(params:{
    valueReceived: number;
    currency: Token;
    date: Date;
    event: "deposit" | "withdraw"; 
    txHash: string;
}){
    this.currency = params.currency;
    this.valueReceived = params.valueReceived;
    this.date = params.date;
    this.event = params.event;
    this.txHash = params.txHash;
  }

  @Field()
  date!: Date;

  @Field()
  event!: "deposit" | "withdraw";

  @Field()
  currency!: Token; 

  @Field()
  valueReceived!: number

  @Field()
  txHash!: string

}

@ObjectType()
export class KandelParameter {

  constructor(params: {
    event: {
            tx: Transaction | undefined;
            prevVersion:  string | undefined;
    };
    value: string;
    type: "admin" | "compoundRateBase" | "compoundRateQuote" | "gasReq" | "gasPrice" | "spread" | "ratio" | "length" | "router";
  }){
    this.date = params.event.tx?.time;
    this.parameter = params.type;
    this.previousValue = params.event.prevVersion
    this.newValue = params.value
    this.txHash = params.event.tx?.txHash
  }
  @Field()
  date?: Date;

  @Field()
  parameter!:"admin" | "compoundRateBase" | "compoundRateQuote" | "gasReq" | "gasPrice" | "spread" | "ratio" | "length" | "router" | "newKandel";

  @Field()
  previousValue?: string; 

  @Field()
  newValue!: string

  @Field()
  txHash?: string

}

@ObjectType()
export class KandelPopulateRetract {
  constructor(params: {
    base: Token;
    baseAmount: number;
    quote: Token;
    quoteAmount: number;
    event: "populate" | "retract";
    date: Date | undefined;
    txHash: string;
}){
    this.date = params.date;
    this.event = params.event;
    this.base = params.base;
    this.baseAmount = params.baseAmount
    this.quote = params.quote;
    this.quoteAmount = params.quoteAmount;
    this.txHash = params.txHash;
  }

  @Field()
  date?: Date;

  @Field()
  event!: "populate" | "retract";

  @Field()
  base!: Token; 

  @Field()
  baseAmount!: number

  @Field()
  quote!: Token; 

  @Field()
  quoteAmount!: number

  @Field()
  txHash!: string

}