import { Token } from "@generated/type-graphql";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class Market{

    constructor(params: {
        token1: Token,
        token2: Token
    }) {
        this.token1 = params.token1
        this.token2 = params.token2
    }


    @Field()
    token1!: Token

    @Field()
    token2!: Token
}

@ObjectType()
export class OfferList {

    constructor(params: {
        active: boolean,
        fee: string,
        gasbase: number,
        density: string,
        inbound: string,
        outbound: string,
        outboundVolume: number
    }){
        this.active = params.active
        this.fee = params.fee
        this.gasbase = params.gasbase
        this.density = params.density
        this.inbound = params.inbound
        this.outbound = params.outbound
        this.outboundVolume = params.outboundVolume
    }

    @Field()
    active!: boolean

    @Field()
    fee!: string

    @Field()
    gasbase!: number

    @Field()
    density!: string

    @Field()
    inbound!: string

    @Field()
    outbound!: string

    @Field()
    outboundVolume!: number

}

@ObjectType()
export class HighlevelInfo {

    constructor(params: {
        kandelsDeployed: number,
        aaveKandelsDeployed: number,
        activeKandels: number,
        activeAaveKandels: number,
        mangroveOrders: number,
        marketOrders: number
    }) {
        this.kandelsDeployed = params.kandelsDeployed
        this.aaveKandelsDeployed = params.aaveKandelsDeployed
        this.activeKandels = params.activeKandels
        this.activeAaveKandels = params.activeAaveKandels
        this.mangroveOrders = params.mangroveOrders
        this.marketOrders = params.marketOrders
    }

    @Field()
    kandelsDeployed!: number

    @Field()
    aaveKandelsDeployed!: number

    @Field()
    activeKandels!: number

    @Field()
    activeAaveKandels!: number

    @Field()
    mangroveOrders!: number

    @Field()
    marketOrders!: number

}



@ObjectType()
export class MarketInfo {

    constructor(params: {
        kandelsDeployed: number,
        aaveKandelsDeployed: number,
        activeKandels: number,
        activeAaveKandels: number,
        mangroveOrders: number,
        marketOrders: number,
        askSide: OfferList,
        bidSide: OfferList
    }) {
        this.kandelsDeployed = params.kandelsDeployed
        this.aaveKandelsDeployed = params.aaveKandelsDeployed
        this.activeKandels = params.activeKandels
        this.activeAaveKandels = params.activeAaveKandels
        this.mangroveOrders = params.mangroveOrders
        this.marketOrders = params.marketOrders
        this.askSide = params.askSide
        this.bidSide = params.bidSide
    }

    @Field()
    kandelsDeployed!: number

    @Field()
    aaveKandelsDeployed!: number

    @Field()
    activeKandels!: number

    @Field()
    activeAaveKandels!: number

    @Field()
    mangroveOrders!: number

    @Field()
    marketOrders!: number

    @Field( () => OfferList)
    askSide!: OfferList

    @Field(() => OfferList)
    bidSide!: OfferList

}

