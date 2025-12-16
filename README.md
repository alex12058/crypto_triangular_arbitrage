# GTS Crypto Arbitrage

A triangular arbitrage detection and simulation tool for cryptocurrency exchanges built with TypeScript.

⚠️ **Status**: Simulation only - Does not execute actual trades

## Overview

This tool identifies triangular arbitrage opportunities on cryptocurrency exchanges and simulates potential profits. Triangular arbitrage exploits price discrepancies between three trading pairs on the same exchange.

**Important**: This is a simulation and analysis tool. It does not execute actual trades - it only calculates and displays potential arbitrage opportunities.

## What is Triangular Arbitrage?

Triangular arbitrage involves trading through three currency pairs to exploit pricing inefficiencies. For example:
1. BTC → ETH
2. ETH → USDT
3. USDT → BTC

If the exchange rates create a profitable cycle, the bot can execute trades to capture the difference.

## Features

- Automated detection of triangular arbitrage opportunities
- Real-time price monitoring using CCXT library
- Chain cycle testing and validation
- Support for multiple exchanges (starting with Binance)
- Price table visualization
- Configurable connecting and value currencies

## Technology Stack

- **Language**: TypeScript 3.7
- **Runtime**: Node.js
- **Exchange API**: CCXT 1.25
- **Code Style**: Google TypeScript Style (GTS)
- **Dev Tools**: Nodemon for hot-reload

## Prerequisites

- Node.js (v10 or higher)
- npm
- Exchange API credentials (for live trading)

## Installation

```bash
# Install dependencies
npm install
```

## Usage

### Development Mode

```bash
# Run with auto-reload on changes
npm start
```

### Build

```bash
# Compile TypeScript to JavaScript
npm run compile
```

### Code Quality

```bash
# Check code style
npm run check

# Auto-fix style issues
npm run fix

# Clean build artifacts
npm run clean
```

## Project Structure

```
gts-crypto-arbitrage/
├── src/
│   ├── index.ts              # Main entry point
│   ├── chain_builder.ts      # Builds arbitrage chains
│   ├── helper.ts             # Utility functions
│   └── classes/
│       ├── chain.ts          # Arbitrage chain logic
│       ├── currency.ts       # Currency representation
│       ├── exchange.ts       # Exchange interface
│       ├── market.ts         # Market data handling
│       └── order_simulator.ts # Trade simulation
└── package.json
```

## Configuration

The bot can be configured with:
- **Exchange name**: Which exchange to monitor (e.g., 'binance')
- **Connecting currency**: The intermediate currency (e.g., 'BTC')
- **Value currency**: The base currency for profit calculation (e.g., 'USDT')

Example configuration in `index.ts`:
```typescript
const binance = await new Exchange({ 
    name: 'binance', 
    connectingCurrency: 'BTC',
    valueCurrency: 'USDT'
}).initialize();
```

## Key Components

### Exchange Class
Handles connection to exchanges, retrieves market data, and executes trades.

### Chain Class
Represents a triangular arbitrage opportunity and calculates potential profits.

### Order Simulator
Simulates order execution to estimate actual profits after fees and slippage.

## How It Works

1. **Initialize Exchange**: Connect to exchange and load all available trading pairs
2. **Build Chains**: Construct all possible triangular arbitrage paths
3. **Monitor Prices**: Continuously fetch real-time prices for all markets
4. **Detect Opportunities**: Calculate profit potential for each chain
5. **Execute Trades**: When profitable opportunity is found, execute the trade sequence

## Risk Considerations

⚠️ **IMPORTANT**:
- **Execution Speed**: Arbitrage opportunities can disappear in milliseconds
- **Trading Fees**: Must account for exchange fees on all three trades
- **Slippage**: Market orders may execute at worse prices than expected
- **API Latency**: Network delays can eliminate arbitrage profits
- **Market Risk**: Prices can move against you during execution

## Development Notes

- Uses Google TypeScript Style (GTS) for consistent code formatting
- Nodemon provides hot-reload during development
- ESLint with Airbnb base configuration for code quality
- TypeScript for type safety and better IDE support

## Future Enhancements

- Multi-exchange arbitrage support
- Websocket connections for faster price updates
- Order book depth analysis
- Backtesting framework
- Profit/loss tracking and reporting
- Automated trade execution with safety limits

## License

Private project

## Notes

This is a legacy project migrated from Bitbucket. Before using in production:
- Update dependencies to latest versions
- Implement proper error handling and recovery
- Add comprehensive logging
- Consider using websockets instead of REST API for faster updates
- Implement circuit breakers and safety limits
