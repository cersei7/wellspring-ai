'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const CATEGORY_COLORS: Record<string, string> = {
  food: 'bg-amber-50 text-amber-900 border-amber-200',
  baby: 'bg-pink-50 text-pink-900 border-pink-200',
  clothing: 'bg-blue-50 text-blue-900 border-blue-200',
  hygiene: 'bg-teal-50 text-teal-900 border-teal-200',
  household: 'bg-purple-50 text-purple-900 border-purple-200',
  other: 'bg-gray-50 text-gray-900 border-gray-200',
};

export default function InventoryGrid() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [summary, setSummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setInventory(data.inventory ?? []);
        setSummary(data.categorySummary ?? []);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-medium">Current Inventory</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Live stock across categories. Computed from received donations minus distributions.
          </p>
        </div>
        <Button onClick={load} variant="outline" size="sm">
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {error && (
        <div className="p-3 rounded bg-red-50 border border-red-200 text-red-800 text-sm mb-4">
          ✗ {error}
        </div>
      )}

      {/* 按类别汇总 */}
      {summary.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {summary.map((s) => (
            <div
              key={s.category}
              className={`p-4 rounded-lg border ${CATEGORY_COLORS[s.category] ?? CATEGORY_COLORS.other}`}
            >
              <p className="text-xs uppercase tracking-wide opacity-70">
                {s.category}
              </p>
              <p className="text-2xl font-medium mt-1">{s.total}</p>
              <p className="text-xs opacity-60 mt-1">items available</p>
            </div>
          ))}
        </div>
      )}

      {/* 详细列表 */}
      {!loading && inventory.length === 0 && !error && (
        <div className="p-8 text-center text-muted-foreground">
          <p>No inventory yet. Go to Intake to add donations.</p>
        </div>
      )}

      {inventory.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 font-medium">Category</th>
                <th className="text-left p-3 font-medium">Item</th>
                <th className="text-right p-3 font-medium">Received</th>
                <th className="text-right p-3 font-medium">Distributed</th>
                <th className="text-right p-3 font-medium">Available</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-3">
                    <Badge variant="secondary" className="capitalize">
                      {item.category}
                    </Badge>
                  </td>
                  <td className="p-3">{item.name}</td>
                  <td className="p-3 text-right text-muted-foreground">
                    {item.received} {item.unit}
                  </td>
                  <td className="p-3 text-right text-muted-foreground">
                    {item.distributed} {item.unit}
                  </td>
                  <td className="p-3 text-right font-medium">
                    {item.available} {item.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
