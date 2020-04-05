import { Ticker } from "./classes/ticker";
import { Exchange } from "./classes/exchange";

interface ChainNode {
	ticker: Ticker;
	tickerName: string;
	prevCurrency: string;
	nextCurrency: string;
}

interface ChainBuildState {
	currentCurrency: string;
	visited: ChainNode[];
}

export class ChainBuilder {

	private readonly exchange: Exchange;

	constructor(exchange: Exchange) {
		this.exchange = exchange;
	}

	async create_chains() {
		const chains_from_quotes = await this.build_chains_from_quotes();
		console.log(chains_from_quotes);
	}

	async build_chains_from_quotes(): Promise<ChainNode[][]> {
		const tickers = this.exchange.tickers;
		return Promise.all(
			this.exchange.quoteCurrencies.map(quote => {
				return this.build_chain(quote, tickers);
			})
		).then(createdChains => this.concat_chains(createdChains));
	}

	private async build_chain(
		startCurrency: string,
		tickers: Map<string, Ticker>,
		chainBuildState: ChainBuildState = {
			currentCurrency: startCurrency,
			visited: []
		}
	): Promise<ChainNode[][]> {
		return Promise.all(
			this.get_possible_links(startCurrency, tickers, chainBuildState)
				.map(ticker => {
					return this.take_paths(
						ticker,
						startCurrency,
						tickers,
						chainBuildState
					);
				})
		).then(createdChains => this.concat_chains(createdChains));
	}

	private get_possible_links(
		startCurrency: string,
		tickers: Map<string, Ticker>,
		chainBuildState: ChainBuildState
	): Ticker[] {
		return Array.from(tickers.values()).filter(ticker => {
			return this.ticker_is_possible_link(
				ticker,
				startCurrency,
				chainBuildState
			);
		});
	}

	private ticker_is_possible_link(
		ticker: Ticker,
		startCurrency: string,
		chainBuildState: ChainBuildState): boolean
	{
		const { currentCurrency, visited } = chainBuildState;
			return !this.ticker_visited(ticker, visited)
				&& ticker.has_currency(currentCurrency)
				&& (
					visited.length < 2
					|| ticker.opposite(currentCurrency) === startCurrency
				);
	}

	private ticker_visited(ticker: Ticker, visited: ChainNode[]): boolean {
		return visited.some(visited => visited.tickerName === ticker.name);
	}

	private end_of_chain(startCurrency: string, nextCurrency: string, 
		chainLength: number): boolean
	{
		return startCurrency === nextCurrency || chainLength === 3;
	}

	private async take_paths(
		nextTicker: Ticker,
		startCurrency: string,
		tickers: Map<string, Ticker>,
		chainBuildState: ChainBuildState
	): Promise<ChainNode[][]> {
		const { currentCurrency, visited } = chainBuildState;

		const nextCurrency = nextTicker.opposite(currentCurrency);
		const nextNode: ChainNode = {
			ticker: nextTicker,
			tickerName: nextTicker.name,
			prevCurrency: currentCurrency,
			nextCurrency
		};
		const nextVisited = visited.slice();
		nextVisited.push(nextNode);

		if(this.end_of_chain(startCurrency, nextCurrency, nextVisited.length)) {
			return [ nextVisited ];
		}
		else {
			// Else, continue the chain
			return this.build_chain(
				startCurrency,
				tickers,
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
	private concat_chains(chains: ChainNode[][][]): ChainNode[][] {
		return chains.reduce((curr, next) => {
			return curr.concat(next);
		}, []);
	}
}