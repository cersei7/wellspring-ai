'use client';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function DistributionPanel() {
  const [donations, setDonations] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/distribute')
      .then((r) => r.json())
      .then((d) => setDonations(d.donations || []))
      .catch((e) => setError(e.message));
  }, []);

  async function handleRecommend() {
    if (!selectedId) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch('/api/distribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donationId: selectedId }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-medium mb-2">AI Distribution Recommendations</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Select a donation. Claude analyzes beneficiary needs, family relationships,
        and urgency to suggest a fair allocation order.
      </p>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Donation:</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">-- Choose --</option>
          {donations.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.quantity} {d.unit}) — {d.category}
            </option>
          ))}
        </select>
      </div>

      <Button onClick={handleRecommend} disabled={!selectedId || loading}>
        {loading ? 'Claude is analyzing...' : 'Get AI Recommendations'}
      </Button>

      {error && (
        <div className="mt-4 p-3 rounded bg-red-50 border border-red-200 text-red-800 text-sm">
          ✗ {error}
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-4">
          <div className={`p-3 rounded border ${
            result.scarcityMode
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-green-50 border-green-200 text-green-900'
          }`}>
            <p className="text-sm font-medium">
              {result.scarcityMode ? '⚠ Scarcity Mode' : '✓ Abundant Mode'}
            </p>
            <p className="text-xs mt-1">
              {result.scarcityMode
                ? 'Supply is limited. Family members merged into shared allocation units.'
                : 'Supply is sufficient. Each beneficiary treated as an individual unit.'}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium">Priority Ranking:</h3>
            {result.recommendations.map((rec: any) => (
              <div key={rec.unit.id} className="p-4 border rounded-lg bg-white">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {rec.rank}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium">
                        {rec.unit.type === 'family' ? 'Family unit' : 'Individual'}
                      </span>
                      <Badge variant={rec.unit.type === 'family' ? 'default' : 'secondary'}>
                        {rec.unit.members.map((m: any) => m.anonymous_id).join(' + ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground italic mb-2">
                      "{rec.explanation}"
                    </p>
                    <div className="flex gap-3 text-xs text-muted-foreground flex-wrap">
                      <span>Need: {(rec.score.needMatch * 100).toFixed(0)}%</span>
                      <span>Wait: {(rec.score.waitTime * 100).toFixed(0)}%</span>
                      <span>Urgency: {(rec.score.urgency * 100).toFixed(0)}%</span>
                      <span>Vulnerability: {(rec.score.vulnerability * 100).toFixed(0)}%</span>
                      <span className="font-medium text-black">
                        Total: {(rec.score.total * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
