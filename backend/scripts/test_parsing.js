const rows = [
  { _scraped_at: '2026-08-17T10:00:00Z', price: { value: 99.99, currency: "USD" }, availability: "In Stock" },
  { _scraped_at: '2026-08-17T11:00:00Z', price: "$105.50", availability: "Available" },
  { _scraped_at: '2026-08-17T12:00:00Z', price: "Contact for price", availability: "Out of Stock" }, // Missing parsable price
  { _scraped_at: '2026-08-17T13:00:00Z', price: null, availability: "Unknown" }, // Null price
  { _scraped_at: '2026-08-17T14:00:00Z', price: { value: "NaN", currency: "USD" }, availability: "In Stock" }, // NaN Edge case
];

const chartData = rows.map((row, idx) => {
  const rawPrice = row.price || row.current_price || row.regular_price;
  let priceVal = null;
  
  if (rawPrice) {
    if (typeof rawPrice === 'object' && rawPrice.value !== undefined) {
      priceVal = parseFloat(rawPrice.value);
    } else {
      const match = String(rawPrice).match(/[\d,.]+/);
      if (match) priceVal = parseFloat(match[0].replace(/,/g, ''));
    }
  }
  
  if (isNaN(priceVal)) {
    priceVal = null;
  }

  const stockStr = row.availability || row.stock_status || '';
  const isAvailable = stockStr.toLowerCase().includes('in stock') || stockStr.toLowerCase().includes('available') ? 1 : 0;

  return {
    rawInput: row.price,
    parsedPrice: priceVal,
    availability: isAvailable,
  };
});

console.log(JSON.stringify(chartData, null, 2));
