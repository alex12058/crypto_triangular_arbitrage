
import ccxt = require('ccxt');
import { Ticker } from './ticker';
import { ChainBuilder } from '../chain_builder';

export class Exchange {
    private readonly _exchange: ccxt.Exchange;
    private readonly _tickers: Map<string, Ticker> = new Map();
    private readonly _chainBuilder: ChainBuilder;

    constructor(name: string) {
        this._exchange = new (ccxt as any)[name]();
        this._chainBuilder = new ChainBuilder(this);
    }

    get tickers() {
        return new Map(this._tickers);
    }

    async initialize() {
        await this.fetch_tickers();
        await this.create_chains();
    }

    private async fetch_tickers() {
        this._tickers.clear();
        const tickers =  await this._exchange.fetchTickers();
        Object.keys(tickers).forEach(key => {
            this._tickers.set(key, new Ticker((tickers as any)[key]));
        });
    }

    private async create_chains() {
        await this._chainBuilder.create_chains();
    }
}