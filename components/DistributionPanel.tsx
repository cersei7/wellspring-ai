'use client';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

const DIST_UI = {
  en: {
    title: 'AI Distribution Recommendations',
    subtitle: 'Select a donation. Claude analyzes beneficiary needs, family relationships, and urgency to suggest a fair allocation order.',
    donationLabel: 'Donation:',
    choosePlaceholder: '-- Choose --',
    analyzeBtn: 'Get AI Recommendations',
    analyzing: 'Claude is analyzing...',
    scarcityTitle: '⚠ Scarcity Mode',
    scarcityDesc: 'Supply is limited. Family members merged into shared allocation units.',
    abundantTitle: '✓ Abundant Mode',
    abundantDesc: 'Supply is sufficient. Each beneficiary treated as an individual unit.',
    priorityTitle: 'Priority Ranking:',
    familyUnit: 'Family unit',
    individual: 'Individual',
    scoreNeed: 'Need', scoreWait: 'Wait', scoreUrgency: 'Urgency',
    scoreVuln: 'Vulnerability', scoreTotal: 'Total',
  },
  zh: {
    title: 'AI 分配建议',
    subtitle: '选择一批捐赠物资，Claude 将分析受益人需求、家庭关系和紧急程度，提出公平的分配顺序。',
    donationLabel: '捐赠物资：',
    choosePlaceholder: '-- 请选择 --',
    analyzeBtn: '获取 AI 建议',
    analyzing: 'Claude 分析中...',
    scarcityTitle: '⚠ 稀缺模式',
    scarcityDesc: '物资有限，家庭成员已合并为共同分配单位。',
    abundantTitle: '✓ 充足模式',
    abundantDesc: '物资充足，每位受益人作为独立单位处理。',
    priorityTitle: '优先级排名：',
    familyUnit: '家庭单位',
    individual: '个人',
    scoreNeed: '需求', scoreWait: '等待', scoreUrgency: '紧急',
    scoreVuln: '脆弱性', scoreTotal: '总分',
  },
  es: {
    title: 'Recomendaciones de Distribución IA',
    subtitle: 'Selecciona una donación. Claude analiza las necesidades de los beneficiarios, relaciones familiares y urgencia para sugerir un orden de asignación justo.',
    donationLabel: 'Donación:',
    choosePlaceholder: '-- Elegir --',
    analyzeBtn: 'Obtener Recomendaciones IA',
    analyzing: 'Claude está analizando...',
    scarcityTitle: '⚠ Modo Escasez',
    scarcityDesc: 'El suministro es limitado. Los miembros de la familia se combinaron en unidades de asignación compartidas.',
    abundantTitle: '✓ Modo Abundante',
    abundantDesc: 'El suministro es suficiente. Cada beneficiario es tratado como una unidad individual.',
    priorityTitle: 'Ranking de Prioridad:',
    familyUnit: 'Unidad familiar',
    individual: 'Individual',
    scoreNeed: 'Necesidad', scoreWait: 'Espera', scoreUrgency: 'Urgencia',
    scoreVuln: 'Vulnerabilidad', scoreTotal: 'Total',
  },
};

export default function DistributionPanel() {
  const { locale } = useLanguage();
  const t = DIST_UI[locale];
  const [donations, setDonations] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/donations')
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
        body: JSON.stringify({ donationId: selectedId, locale }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-medium mb-2">{t.title}</h2>
      <p className="text-sm text-muted-foreground mb-4">{t.subtitle}</p>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">{t.donationLabel}</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">{t.choosePlaceholder}</option>
          {donations.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.quantity} {d.unit}) — {d.category}
            </option>
          ))}
        </select>
      </div>

      <Button onClick={handleRecommend} disabled={!selectedId || loading}>
        {loading ? t.analyzing : t.analyzeBtn}
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
              {result.scarcityMode ? t.scarcityTitle : t.abundantTitle}
            </p>
            <p className="text-xs mt-1">
              {result.scarcityMode ? t.scarcityDesc : t.abundantDesc}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium">{t.priorityTitle}</h3>
            {result.recommendations.map((rec: any) => (
              <div key={rec.unit.id} className="p-4 border rounded-lg bg-white">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {rec.rank}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium">
                        {rec.unit.type === 'family' ? t.familyUnit : t.individual}
                      </span>
                      <Badge variant={rec.unit.type === 'family' ? 'default' : 'secondary'}>
                        {rec.unit.members.map((m: any) => m.anonymous_id).join(' + ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground italic mb-2">"{rec.explanation}"</p>
                    <div className="flex gap-3 text-xs text-muted-foreground flex-wrap">
                      <span>{t.scoreNeed}: {(rec.score.needMatch * 100).toFixed(0)}%</span>
                      <span>{t.scoreWait}: {(rec.score.waitTime * 100).toFixed(0)}%</span>
                      <span>{t.scoreUrgency}: {(rec.score.urgency * 100).toFixed(0)}%</span>
                      <span>{t.scoreVuln}: {(rec.score.vulnerability * 100).toFixed(0)}%</span>
                      <span className="font-medium text-black">
                        {t.scoreTotal}: {(rec.score.total * 100).toFixed(0)}%
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
