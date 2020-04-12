
import ccxt = require('ccxt');
import { Exchange } from './exchange';
import { contains } from '../helper';

export class Market {
    private readonly exchange: Exchange;
    readonly baseCurrency: string;
    readonly quoteCurrency: string;
    readonly market: ccxt.Market;
    readonly symbol: string;

    constructor(exchange: Exchange, market: ccxt.Market) {
        this.exchange = exchange;
        this.baseCurrency = market.base;
        this.quoteCurrency = market.quote;
        this.market = market;
        this.symbol = market.symbol;
    }

    opposite(currency: string) {
        return currency === this.baseCurrency
            ? this.quoteCurrency
            : this.baseCurrency;
    }

    hasCurrency(currency: string) {
        return this.baseCurrency === currency
            || this.quoteCurrency === currency;
    }

    baseIsQuote() {
        return contains(this.exchange.quoteCurrencies, this.baseCurrency);
    }
}
