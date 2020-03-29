
import ccxt = require('ccxt');

export class Ticker {
    readonly baseCurrency: string;
    readonly quoteCurrency: string;
    readonly ticker: ccxt.Ticker;

    constructor(ticker: ccxt.Ticker) {
        const currencies = ticker.symbol.split('/'); // BTC/USD
        this.baseCurrency = currencies[0]; // BTC
        this.quoteCurrency = currencies[1]; // USD
        this.ticker = ticker;
    }

    opposite(currency: string) {
        return currency === this.baseCurrency
            ? this.quoteCurrency
            : this.baseCurrency;
    }

    has_currency(currency: string) {
        return this.baseCurrency === currency
            || this.quoteCurrency === currency;
    }
}
