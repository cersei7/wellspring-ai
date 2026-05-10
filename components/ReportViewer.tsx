'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { UI } from '@/lib/i18n';

export default function ReportViewer() {
  const { locale } = useLanguage();
  const t = UI[locale];
  const [report, setReport] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setReport(data.report);
        setStats(data.stats);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-medium mb-2">{t.reportTitle}</h2>
      <p className="text-sm text-muted-foreground mb-4">{t.reportSubtitle}</p>

      <Button onClick={generate} disabled={loading}>
        {loading ? t.reportGenerating : t.reportGenerateBtn}
      </Button>

      {error && (
        <div className="mt-4 p-3 rounded bg-red-50 border border-red-200 text-red-800 text-sm">
          ✗ {error}
        </div>
      )}

      {stats && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatBox label={t.reportDonationsReceived} value={stats.totalDonations} />
          <StatBox label={t.reportItemsDistributed} value={stats.totalDistributed} />
          <StatBox label={t.reportBeneficiariesServed} value={stats.beneficiariesServed} />
          <StatBox label={t.reportCategoriesAtRisk} value={stats.shortages.length} />
        </div>
      )}

      {stats && stats.topCategories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">{t.reportTopCategories}</span>
          {stats.topCategories.map((c: any) => (
            <Badge key={c.name} variant="secondary">
              {c.name} ({c.count})
            </Badge>
          ))}
        </div>
      )}

      {report && (
        <div className="mt-6 p-5 border rounded-lg bg-white">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              {t.reportGeneratedBy}
            </span>
          </div>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap leading-relaxed">
            {report}
          </div>
        </div>
      )}
    </Card>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-3 rounded-lg border bg-white">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-medium mt-1">{value}</p>
    </div>
  );
}
