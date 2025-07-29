import yahooFinance from 'yahoo-finance2';

export async function financialService(tickers) {
    const results = [];

    for (const ticker of tickers) {
        try {
            const quote = await yahooFinance.quote(ticker);
            results.push({
                ticker: ticker,
                price: quote.regularMarketPrice,
                change: quote.regularMarketChange,
                changePercent: quote.regularMarketChangePercent
            });
        } catch (err) {
            console.error(`Error fetching data for ${ticker}:`, err);
        }
    }

    return results;
}
