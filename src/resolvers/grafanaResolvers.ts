import { Arg, Ctx, Query, Resolver } from "type-graphql";
import { MarketInfo, OfferList } from "./grafanaObjects";
import { Offer, OfferListing, OfferListingVersion, OfferVersion, PrismaClient, Token } from "@prisma/client";
import { mangrove } from "@proximaone/stream-schema-mangrove/dist/streams";
import { off } from "process";
import { of } from "rxjs";


type Context = {
    prisma: PrismaClient;
};


@Resolver()
export class GrafanaResolver {


    @Query(() => MarketInfo)
    async marketInfo(
        @Arg("base") base: string,
        @Arg("quote") quote: string,
        @Arg("mangrove") mangrove: string,
        @Ctx() ctx: Context

    ): Promise<MarketInfo> {
        const offerListing1 = await this.getOfferListingWithExtraInfo(ctx, base, quote, mangrove)
        const offerListing2 = await this.getOfferListingWithExtraInfo(ctx, quote, base, mangrove)
        const kandelsDeployed  = await ctx.prisma.kandel.count({ where: { 
            type: "NewKandel",
            mangrove: { address: { contains: mangrove.toLowerCase() , mode: "insensitive" } },
            baseToken: { OR: [ { address: { contains: base.toLowerCase() , mode: "insensitive"}}, { address: { contains: quote.toLowerCase() , mode: "insensitive" } } ] },
            quoteToken: { OR: [ { address: { contains: base.toLowerCase() , mode: "insensitive"}}, { address: { contains: quote.toLowerCase() , mode: "insensitive" } } ] } 
        } });

        const aaveKandelsDeployed  = await ctx.prisma.kandel.count({ where: {
            type: "NewAaveKandel",
            mangrove: { address: { contains: mangrove.toLowerCase() , mode: "insensitive" } },
            baseToken: { OR: [ { address: { contains: base.toLowerCase() , mode: "insensitive"}}, { address: { contains: quote.toLowerCase() , mode: "insensitive" } } ] },
            quoteToken: { OR: [ { address: { contains: base.toLowerCase() , mode: "insensitive"}}, { address: { contains: quote.toLowerCase() , mode: "insensitive" } } ] } 
        } });

        const activeKandels  = await ctx.prisma.kandel.count({ where: {
            type: "NewKandel",
            mangrove: { address: { contains: mangrove.toLowerCase() , mode: "insensitive" } },
            baseToken: { OR: [ { address: { contains: base.toLowerCase() , mode: "insensitive"}}, { address: { contains: quote.toLowerCase() , mode: "insensitive" } } ] },
            quoteToken: { OR: [ { address: { contains: base.toLowerCase() , mode: "insensitive"}}, { address: { contains: quote.toLowerCase() , mode: "insensitive" } } ] } ,
            strat: { offers: { some: { currentVersion: { live: true } } } }
        } });

        const activeAaveKandels  = await ctx.prisma.kandel.count({ where: {
            type: "NewAaveKandel",
            mangrove: { address: { contains: mangrove.toLowerCase() , mode: "insensitive" } },
            baseToken: { OR: [ { address: { contains: base.toLowerCase() , mode: "insensitive"}}, { address: { contains: quote.toLowerCase() , mode: "insensitive" } } ] },
            quoteToken: { OR: [ { address: { contains: base.toLowerCase() , mode: "insensitive"}}, { address: { contains: quote.toLowerCase() , mode: "insensitive" } } ] } ,
            strat: { offers: { some: { currentVersion: { live: true } } } }
        } });

        const mangroveOrders = await ctx.prisma.mangroveOrder.count({ where: {
            mangrove: { address: { contains: mangrove.toLowerCase() , mode: "insensitive" } },
            offerListing: {
                inboundToken: { OR: [ { address: { contains: base.toLowerCase() , mode: "insensitive"}}, { address: { contains: quote.toLowerCase() , mode: "insensitive" } } ] },
                outboundToken: { OR: [ { address: { contains: base.toLowerCase() , mode: "insensitive"}}, { address: { contains: quote.toLowerCase() , mode: "insensitive" } } ] },
            }
        } });

        const marketOrders = await ctx.prisma.order.count({ where: {
            mangrove: { address: { contains: mangrove.toLowerCase() , mode: "insensitive" } },
            MangroveOrder: undefined,
            offerListing: {
                inboundToken: { OR: [ { address: { contains: base.toLowerCase() , mode: "insensitive" } }, { address: { contains: quote.toLowerCase() , mode: "insensitive" } } ] },
                outboundToken: { OR: [ { address: { contains: base.toLowerCase() , mode: "insensitive"}}, { address: { contains: quote.toLowerCase() , mode: "insensitive" } } ] },
            }
        } });


        return new MarketInfo({
            kandelsDeployed: kandelsDeployed,
            aaveKandelsDeployed: aaveKandelsDeployed,
            activeKandels: activeKandels,
            activeAaveKandels: activeAaveKandels,
            mangroveOrders: mangroveOrders,
            marketOrders: marketOrders,
            askSide: this.createGrafanaOfferList(offerListing1),
            bidSide: this.createGrafanaOfferList(offerListing2)
        });
    }


    private createGrafanaOfferList(offerListing1: (OfferListing & { offers: (Offer & { currentVersion: OfferVersion | null; })[]; currentVersion: OfferListingVersion | null; inboundToken: Token; outboundToken: Token; }) | null): OfferList {
        return new OfferList({
            active: offerListing1?.currentVersion?.active || false,
            fee: offerListing1?.currentVersion?.fee || "0",
            gasbase: offerListing1?.currentVersion?.gasbase || 0,
            density: offerListing1?.currentVersion?.density || "0",
            inbound: offerListing1?.inboundToken?.name || "",
            outbound: offerListing1?.outboundToken?.name || "",
            outboundVolume: offerListing1?.offers.reduce((acc, offer) => acc + (offer.currentVersion?.givesNumber ?? 0), 0) || 0,
        });
    }

    private async getOfferListingWithExtraInfo(ctx: Context, inbound: string, outbound: string, mangrove: string) {
        return await ctx.prisma.offerListing.findFirst({
            where: {
                inboundToken: {
                    address: { contains: inbound.toLowerCase(), mode: 'insensitive' }
                },
                outboundToken: {
                    address: { contains: outbound.toLowerCase(), mode: 'insensitive' }
                },
                mangrove: {
                    address: { contains: mangrove.toLowerCase(), mode: 'insensitive' }
                }
            },
            include: {
                inboundToken: true,
                outboundToken: true,
                currentVersion: true,
                offers: {
                    where: {
                        currentVersion: {
                            live: true
                        }
                    },
                    include: {
                        currentVersion: true,
                    }
                }
            }
        });
    }
}
