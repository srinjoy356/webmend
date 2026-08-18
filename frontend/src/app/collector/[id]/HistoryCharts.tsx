"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BentoCard } from "@/components/ui/bento-card";

export function HistoryCharts({ rows }: { rows: any[] }) {
  if (!rows || rows.length === 0) {
    return null;
  }

  const chartData = rows.map((row, idx) => {
    // Attempt to parse price handling both string "$99" and object { value: 99, currency: "USD" }
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
    
    // Safety check for NaN
    if (priceVal !== null && isNaN(priceVal)) {
      priceVal = null;
    }

    // Attempt to parse availability/stock
    const stockStr = row.availability || row.stock_status || '';
    const lowerStock = stockStr.toLowerCase();
    const isAvailable = lowerStock.includes('in stock') || lowerStock.includes('available') || lowerStock.includes('delivered') ? 1 : 0;

    let timeLabel = `Point ${idx + 1}`;
    if (row._scraped_at) {
      timeLabel = new Date(row._scraped_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return {
      timeLabel,
      price: priceVal,
      availability: isAvailable,
      rawStock: stockStr
    };
  });

  const hasPrice = chartData.some(d => d.price !== null && !isNaN(d.price));
  const hasAvailability = chartData.some(d => d.rawStock !== undefined && d.rawStock !== '');

  if (!hasPrice && !hasAvailability) return null;

  return (
    <div className="flex flex-col gap-6 mb-6">
      {hasPrice && (
        <BentoCard className="p-6">
          <h3 className="text-lg font-display font-bold mb-4 opacity-80">Price History</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" opacity={0.2} />
                <XAxis dataKey="timeLabel" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} width={60} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1c1c17', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: '#aaa', marginBottom: '4px' }}
                />
                <Line type="monotone" dataKey="price" stroke="#8B001C" strokeWidth={3} dot={{ fill: '#8B001C', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </BentoCard>
      )}

      {hasAvailability && (
        <BentoCard className="p-6">
          <h3 className="text-lg font-display font-bold mb-4 opacity-80">Availability Trend</h3>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" opacity={0.2} />
                <XAxis dataKey="timeLabel" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis 
                  stroke="#888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  domain={[0, 1]} 
                  ticks={[0, 1]} 
                  tickFormatter={(val) => val === 1 ? 'In Stock' : 'Out'}
                  width={80}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1c1c17', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: '#aaa', marginBottom: '4px' }}
                  formatter={(val: any) => [val === 1 ? 'In Stock' : 'Out of Stock', 'Status']}
                />
                <Line type="stepAfter" dataKey="availability" stroke="#1A3A32" strokeWidth={3} dot={{ fill: '#1A3A32', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </BentoCard>
      )}
    </div>
  );
}
