
import { assert } from 'console';
import Market from './market';
import ChainBuilder from '../chain_builder';
import { unique } from '../helper';
import Chain from './chain';

import ccxt = require('ccxt');


export default class Exchange {
    private readonly _exchange: ccxt.Exchange;

    private readonly _markets: Map<string, Market> = new Map();

    private readonly _chainBuilder: ChainBuilder;

    private _chains: Map<string, Chain> = new Map();

    private _quoteCurrencies: string[] = [];

    constructor(name: string) {
      this._exchange = new (ccxt as any)[name]();
      this.checkExchangeHasMethods();
      this._chainBuilder = new ChainBuilder(this);
    }

    private checkExchangeHasMethods() {
      // Markets / Price data
      assert(this._exchange.has.fetchMarkets);
      assert(this._exchange.has.fetchL2OrderBook);

      // Trade management
      assert(this._exchange.has.fetchTradingFees);
      assert(this._exchange.has.fetchTrades);

      // Order management
      assert(this._exchange.has.createOrder);
      assert(this._exchange.has.cancelOrder);
      assert(this._exchange.has.fetchOpenOrders);
    }

    get markets() {
      return new Map(this._markets);
    }

    get getMarketsArray() {
      return Array.from(this._markets.values()).slice();
    }

    get quoteCurrencies() {
      return this._quoteCurrencies.slice();
    }

    async initialize() {
      await this.loadMarkets();
      await this.createChains();
      return this;
    }

    private async loadMarkets() {
      this._markets.clear();
      const markets = await this._exchange.loadMarkets(true);
      Object.keys(markets).forEach((key) => {
        this._markets.set(key, new Market(this, (markets as any)[key]));
      });
      this.loadQuoteCurrencies();
    }

    /**
     * Get a list of quote currencies from the market.
     */
    private loadQuoteCurrencies() {
      const markets = Array.from(this._markets.values());

      // All the currencies listed as quote currencies
      const firstPass = unique(markets.map((market) => market.quoteCurrency));

      // Exclude quote currencies that are only quote currencies to other quote
      // currencies
      this._quoteCurrencies = Array.from(
        unique(markets
          .filter((market) => !firstPass.has(market.baseCurrency))
          .map((market) => market.quoteCurrency)),
      );
    }

    private async createChains() {
      this._chains = await this._chainBuilder.createChains();
      console.log(this._chains.keys());
    }
}
