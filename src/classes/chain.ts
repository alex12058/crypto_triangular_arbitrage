import { ChainNode } from "../chain_builder";
import { reverseIndex as calcReverseIndex, nextLoopableIndex, prevLoopableIndex, reverseIndex, changeFirstIndex, XOR } from "../helper";
import { Market } from "./market";
import { Exchange } from "./exchange";

export class Chain {

    private readonly exchange: Exchange;
    private readonly markets: Market[];
    readonly hash: string;

    constructor(exchange: Exchange, chainNodes: ChainNode[]) {
        this.exchange = exchange;
        this.markets = this.getHashableOrder(chainNodes);
        this.hash = this.generateHash(this.markets);
    }

    private getHashableOrder(chainNodes: ChainNode[]) {
        const markets = chainNodes.map(link => link.market);
        const sortedMarketSymbols = this.sortMarketSymbols(markets);
        const firstMarket = sortedMarketSymbols[0];
        let firstMarketIndex = markets.findIndex(market => {
            return market.symbol === firstMarket;
        });
        if(this.needToReverseOrder(markets, sortedMarketSymbols, firstMarketIndex)) {
            markets.reverse();
            firstMarketIndex = reverseIndex(firstMarketIndex, markets.length);
        }
        return changeFirstIndex(markets, firstMarketIndex);
    }

    private sortMarketSymbols(markets: Market[]) {
        return markets.slice().sort((a, b) => {
            const aHasQuoteBase = a.baseIsQuote();
            const bhasQuoteBase = b.baseIsQuote();

            // If one market has a non quote base (other has a quote base)
            // Then prioritise the one that does not have the quote base
            if(XOR(aHasQuoteBase, bhasQuoteBase)) {
                if(bhasQuoteBase) return -1;
                if(aHasQuoteBase) return 1;
            }

            // Else compare using market symbol
            return a.symbol < b.symbol
                ? -1
                : 1;
        }).map(market => market.symbol);
    }

    private needToReverseOrder(markets: Market[], sortedMarketSymbols: string[],
        firstMarketIndex: number)
    {
        const nextMarketIndex = nextLoopableIndex(firstMarketIndex, markets.length);
        const prevMarketIndex = prevLoopableIndex(firstMarketIndex, markets.length);
        if (nextMarketIndex === prevMarketIndex) return false;

        const nextMarketName = markets[nextMarketIndex].symbol;
        const prevMarketName = markets[prevMarketIndex].symbol;

        // Lower number means higher priority
        const nextPriority = sortedMarketSymbols.indexOf(nextMarketName);
        const prevPriority = sortedMarketSymbols.indexOf(prevMarketName);
        return nextPriority > prevPriority;
    }

    private generateHash(markets: Market[]) {
        const firstMarket = markets[0];
        const secondMarket = markets[1];
        const firstCurrency = [
            firstMarket.baseCurrency,
            firstMarket.quoteCurrency
        ].find(currency => {
            return secondMarket.hasCurrency(currency);
        })!;
        let lastCurrency = firstCurrency;
        const currencyOrder: string[] = [ firstCurrency ];
        for(let i = 1; i < markets.length; i++) {
            const nextCurrency = markets[i].opposite(lastCurrency);
            currencyOrder.push(lastCurrency = nextCurrency);
        }
        return currencyOrder.join('/');
    }
}
