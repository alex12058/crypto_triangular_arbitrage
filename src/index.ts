import Exchange from './classes/exchange';

async function main() {
  const binance = await new Exchange('binance').initialize();
}
main();
