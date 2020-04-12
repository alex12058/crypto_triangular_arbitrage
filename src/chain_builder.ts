import { Market } from "./classes/market";
import { Exchange } from "./classes/exchange";
import { Chain } from "./classes/chain";

export interface ChainNode {
	market: Market;
	prevCurrency: string;
	nextCurrency: string;
}

interface ChainBuildState {
	currentCurrency: string;
	visited: ChainNode[];
}

export class ChainBuilder {

	private readonly exchange: Exchange;
	private readonly MAX_CHAIN_LENGTH = 3;

	constructor(exchange: Exchange) {
		this.exchange = exchange;
	}

	async createChains() {
		const chainsFromQuotes = await this.buildChainsFromQuotes();
		const chainMap = new Map<string, Chain>();
		chainsFromQuotes.forEach(primativeChain => {
			const chain = new Chain(this.exchange, primativeChain);
			if(chainMap.get(chain.hash) === undefined) {
				chainMap.set(chain.hash, chain);
			}
		});
		return chainMap;
	}

	async buildChainsFromQuotes(): Promise<ChainNode[][]> {
		const markets = this.exchange.markets;
		return Promise.all(
			this.exchange.quoteCurrencies.map(quote => {
				return this.buildChain(quote, markets);
			})
		).then(createdChains => this.concatChains(createdChains));
	}

	private async buildChain(
		startCurrency: string,
		markets: Map<string, Market>,
		chainBuildState: ChainBuildState = {
			currentCurrency: startCurrency,
			visited: []
		}
	): Promise<ChainNode[][]> {
		return Promise.all(
			this.getPossibleLink(startCurrency, markets, chainBuildState)
				.map(market => {
					return this.takePaths(
						market,
						startCurrency,
						markets,
						chainBuildState
					);
				})
		).then(createdChains => this.concatChains(createdChains));
	}

	private getPossibleLink(
		startCurrency: string,
		markets: Map<string, Market>,
		chainBuildState: ChainBuildState
	): Market[] {
		return Array.from(markets.values()).filter(market => {
			return this.marketIsPossibleLink(
				market,
				startCurrency,
				chainBuildState
			);
		});
	}

	private marketIsPossibleLink(
		market: Market,
		startCurrency: string,
		chainBuildState: ChainBuildState): boolean
	{
		const { currentCurrency, visited } = chainBuildState;
			return !this.market_visited(market, visited)
				&& market.hasCurrency(currentCurrency)
				&& (
					visited.length < this.MAX_CHAIN_LENGTH - 1
					|| market.opposite(currentCurrency) === startCurrency
				);
	}

	private market_visited(market: Market, visited: ChainNode[]): boolean {
		return visited.some(visited => visited.market.symbol === market.symbol);
	}

	private endOfChain(startCurrency: string, nextCurrency: string, 
		chainLength: number): boolean
	{
		return startCurrency === nextCurrency || chainLength === this.MAX_CHAIN_LENGTH;
	}

	private async takePaths(
		nextMarket: Market,
		startCurrency: string,
		markets: Map<string, Market>,
		chainBuildState: ChainBuildState
	): Promise<ChainNode[][]> {
		const { currentCurrency, visited } = chainBuildState;

		const nextCurrency = nextMarket.opposite(currentCurrency);
		const nextNode: ChainNode = {
			market: nextMarket,
			prevCurrency: currentCurrency,
			nextCurrency
		};
		const nextVisited = visited.slice();
		nextVisited.push(nextNode);

		if(this.endOfChain(startCurrency, nextCurrency, nextVisited.length)) {
			return [ nextVisited ];
		}
		else {
			// Else, continue the chain
			return this.buildChain(
				startCurrency,
				markets,
				{
					currentCurrency: nextCurrency,
					visited: nextVisited
				}
			);
		}
	}

	/**
	 * Merge chains that were created from taking separate paths into a singular
	 * array of chains
	 */
	private concatChains(chains: ChainNode[][][]): ChainNode[][] {
		return chains.reduce((curr, next) => {
			return curr.concat(next);
		}, []);
	}
}
