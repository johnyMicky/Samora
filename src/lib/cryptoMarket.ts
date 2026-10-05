export type CryptoMarketQuote = {
  symbol: string;
  priceUsd: number;
  change24h: number | null;
  sparkline: number[];
  updatedAt: number;
};

const COINGECKO_IDS: Record<string, string> = {
  BTC: 'bitcoin', ETH: 'ethereum', USDT: 'tether', USDC: 'usd-coin',
  BNB: 'binancecoin', SOL: 'solana', XRP: 'ripple', ADA: 'cardano',
  DOGE: 'dogecoin', TRX: 'tron', LTC: 'litecoin', DOT: 'polkadot',
  AVAX: 'avalanche-2', LINK: 'chainlink', MATIC: 'matic-network',
  POL: 'matic-network', SHIB: 'shiba-inu', BCH: 'bitcoin-cash', XLM: 'stellar',
  DAI: 'dai', TON: 'the-open-network'
};

export async function fetchCryptoMarketQuotes(symbols: string[]): Promise<Record<string, CryptoMarketQuote>> {
  const uniqueSymbols = [...new Set(symbols.map(s => s.trim().toUpperCase()).filter(Boolean))];
  const pairs = uniqueSymbols.map(symbol => ({ symbol, id: COINGECKO_IDS[symbol] })).filter(p => p.id);
  if (!pairs.length) return {};

  const ids = [...new Set(pairs.map(p => p.id))];
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${encodeURIComponent(ids.join(','))}&price_change_percentage=24h&sparkline=true`;
  const response = await fetch(url, { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`Market data request failed (${response.status})`);
  const rows = await response.json() as Array<any>;
  const byId = new Map(rows.map(row => [row.id, row]));
  const now = Date.now();
  const result: Record<string, CryptoMarketQuote> = {};

  for (const pair of pairs) {
    const row = byId.get(pair.id);
    const price = Number(row?.current_price);
    if (!row || !Number.isFinite(price) || price <= 0) continue;
    result[pair.symbol] = {
      symbol: pair.symbol,
      priceUsd: price,
      change24h: Number.isFinite(Number(row.price_change_percentage_24h)) ? Number(row.price_change_percentage_24h) : null,
      sparkline: Array.isArray(row.sparkline_in_7d?.price) ? row.sparkline_in_7d.price.filter((n: unknown) => Number.isFinite(Number(n))).map(Number) : [],
      updatedAt: now
    };
  }
  return result;
}
