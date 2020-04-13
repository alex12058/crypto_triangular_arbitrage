import Exchange from './exchange';
import { contains } from '../helper';

import ccxt = require('ccxt');

export default class Market {
    private readonly exchange: Exchange;

    readonly market: ccxt.Market;

    private orderBook!: ccxt.OrderBook;

    constructor(exchange: Exchange, market: ccxt.Market) {
      this.exchange = exchange;
      this.market = market;
    }

    async initialize() {
      this.orderBook = await this.fetchOrderBook();
      return this;
    }

    private fetchOrderBook = async() => {
      return this.exchange.exchange.fetchL2OrderBook(this.symbol);
    }

    get baseCurrency() {
      return this.market.base;
    }

    get quoteCurrency() {
      return this.market.quote;
    }

    get symbol() {
      return this.market.symbol;
    }

    isActive() {
      return this.market.active;
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
