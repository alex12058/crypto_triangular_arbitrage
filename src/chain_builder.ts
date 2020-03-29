import { Ticker } from "./classes/ticker";
import { Exchange } from "./classes/exchange";

interface ChainNode {
    ticker: Ticker;
    tickerName: string;
    prevCurrency: string;
    nextCurrency: string;
}

export class ChainBuilder {

    private readonly exchange: Exchange;
    private tickers: Map<string, Ticker>;

    constructor(exchange: Exchange) {
        this.exchange = exchange;
        this.tickers = exchange.tickers;
    }

    async create_chains() {
        this.tickers = this.exchange.tickers;
        const firstTicker = this.tickers.get(Array.from(this.tickers.keys())[0]);
        if(firstTicker) console.log((await this.build_chain(firstTicker.baseCurrency)));
    }

    /**
     * 
     * @param startCurrency Currency the chain starts from
     * @param currentCurrency Currency the chain is currently at
     * @param visited List of visited nodes in the chain
     */
    private async build_chain(
        startCurrency: string, 
        currentCurrency: string = startCurrency, 
        visited: ChainNode[] = []
    ): Promise<ChainNode[][]> {
        const possibleTickers: string[] = [];
        for(const key of Array.from(this.tickers.keys())) {
            // Ticker already visited
            if(visited.some(visited => visited.tickerName === key)) continue;

            // No way to connect to ticker
            const ticker = this.tickers.get(key);
            if(!ticker) continue;
            if(!ticker.has_currency(currentCurrency)) continue;

            // Must connect back to startCurrency if this will be the last (3rd) node
            if(visited.length < 2 || ticker.opposite(currentCurrency) === startCurrency) {
                possibleTickers.push(key);
            }
        }

        const chains: ChainNode[][] = [];

        // Take all possible paths
        for(const possibleTicker of possibleTickers) {
            const ticker = this.tickers.get(possibleTicker);
            if(!ticker) throw new Error('Ticker not found on map');

            const nextCurrency = ticker.opposite(currentCurrency);
            const nextNode: ChainNode = {
                ticker,
                tickerName: possibleTicker,
                prevCurrency: currentCurrency,
                nextCurrency
            };
            const nextVisitedState = visited.slice();
            nextVisitedState.push(nextNode);

            // If the chain ends here
            if(nextCurrency === startCurrency || visited.length === 2) {
                chains.push(nextVisitedState);
            }
            else {
                // Else, continue the chain
                const continuedChains = await this.build_chain(startCurrency, nextCurrency, nextVisitedState);
                continuedChains.forEach(c => {
                    if(c.length) {
                        chains.push(c);
                    }
                });
            }
        }
        return chains;
    }
}