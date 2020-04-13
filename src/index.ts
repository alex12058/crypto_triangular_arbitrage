import Exchange from './classes/exchange';

async function main() {
  const binance = await new Exchange('binance')
    .setMaxRequestsPerSecond(10)
    .initialize();
}
main();
