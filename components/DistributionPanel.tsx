'use client';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

const T = {
  en: { title: 'AI Distribution Recommendations', subtitle: 'Select a donation...', donationLabel: 'Donation:', choose: '-- Choose --', analyzeBtn: 'Get AI Recommendations', analyzing: 'Claude is analyzing...', scarcityTitle: '⚠ Scarcity Mode', scarcityDesc: 'Supply limited.', abundantTitle: '✓ Abundant Mode', abundantDesc: 'Supply sufficient.', priorityTitle: 'Priority Ranking:', familyUnit: 'Family unit', individual: 'Individual', need: 'Need', wait: 'Wait', urgency: 'Urgency', vuln: 'Vulnerability', total: 'Total', allocateBtn: 'Allocate', allocatedMsg: 'Allocated successfully!' },
  zh: { title: 'AI 分配建议', subtitle: '选择捐赠...', donationLabel: '捐赠物资：', choose: '-- 请选择 --', analyzeBtn: '获取 AI 建议', analyzing: 'Claude 分析中...', scarcityTitle: '⚠ 稀缺模式', scarcityDesc: '物资有限', abundantTitle: '✓ 充足模式', abundantDesc: '物资充足', priorityTitle: '优先级排名：', familyUnit: '家庭单位', individual: '个人', need: '需求', wait: '等待', urgency: '紧急', vuln: '脆弱性', total: '总分', allocateBtn: '分配', allocatedMsg: '分配成功！' },
  es: { title: 'Recomendaciones IA', subtitle: 'Selecciona una donación...', donationLabel: 'Donación:', choose: '-- Elegir --', analyzeBtn: 'Recomendar', analyzing: 'Analizando...', scarcityTitle: '⚠ Escasez', scarcityDesc: 'Familias combinadas', abundantTitle: '✓ Abundante', abundantDesc: 'Suficiente', priorityTitle: 'Prioridad:', familyUnit: 'Unidad familiar', individual: 'Individual', need: 'Necesidad', wait: 'Espera', urgency: 'Urgencia', vuln: 'Vulnerabilidad', total: 'Total', allocateBtn: 'Asignar', allocatedMsg: 'Asignado exitosamente!' },
};

export default function DistributionPanel() {
  const { locale } = useLanguage();
  const t = T[locale as keyof typeof T] || T.en;
  const [donations, setDonations] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allocating, setAllocating] = useState(false);
  const [allocMessage, setAllocMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchDonations();
  }, []);

  async function fetchDonations() {
    try {
      const res = await fetch('/api/donations');
      const data = await res.json();
      setDonations(data.donations || []);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleRecommend() {
    if (!selectedId) return;
    setLoading(true);
    setError(null);
    setAllocMessage(null);
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

  async function handleAllocate(beneficiaryId?: string) {
    if (!selectedId) {
      setAllocMessage('Please select a donation first');
      return;
    }
    // 获取当前选中捐赠的数量（从 donations 列表中找到对应项）
    const donation = donations.find(d => d.id === selectedId);
    if (!donation) {
      setAllocMessage('Donation not found');
      return;
    }
    const quantityToAllocate = 1; // 或者分配全部：donation.quantity
    setAllocating(true);
    try {
      const res = await fetch('/api/allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donationId: selectedId, quantity: quantityToAllocate, beneficiaryId }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAllocMessage(`${t.allocatedMsg} Remaining: ${data.remaining}`);
      // 刷新捐赠列表和推荐结果（可选）
      await fetchDonations();
      if (selectedId) handleRecommend(); // 重新获取推荐，反映库存变化
    } catch (err: any) {
      setAllocMessage(err.message);
    } finally {
      setAllocating(false);
      setTimeout(() => setAllocMessage(null), 3000);
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
          <option value="">{t.choose}</option>
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

      {error && <div className="mt-4 p-3 bg-red-50 text-red-800 rounded">✗ {error}</div>}
      {allocMessage && <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded">{allocMessage}</div>}

      {result && (
        <div className="mt-6 space-y-4">
          <div className={`p-3 rounded border ${result.scarcityMode ? 'bg-amber-50' : 'bg-green-50'}`}>
            <p className="text-sm font-medium">{result.scarcityMode ? t.scarcityTitle : t.abundantTitle}</p>
            <p className="text-xs mt-1">{result.scarcityMode ? t.scarcityDesc : t.abundantDesc}</p>
          </div>
          <div className="space-y-3">
            <h3 className="font-medium">{t.priorityTitle}</h3>
            {result.recommendations.map((rec: any) => (
              <div key={rec.rank} className="p-4 border rounded-lg bg-white">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-medium">{rec.rank}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium">{rec.unit.type === 'family' ? t.familyUnit : t.individual}</span>
                      <Badge variant={rec.unit.type === 'family' ? 'default' : 'secondary'}>
                        {rec.unit.members.map((m: any) => m.anonymous_id).join(' + ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground italic mb-2">"{rec.explanation}"</p>
                    <div className="flex gap-3 text-xs text-muted-foreground flex-wrap">
                      <span>{t.need}: {(rec.score.needMatch*100).toFixed(0)}%</span>
                      <span>{t.wait}: {(rec.score.waitTime*100).toFixed(0)}%</span>
                      <span>{t.urgency}: {(rec.score.urgency*100).toFixed(0)}%</span>
                      <span>{t.vuln}: {(rec.score.vulnerability*100).toFixed(0)}%</span>
                      <span className="font-medium text-black">{t.total}: {(rec.score.total*100).toFixed(0)}%</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => handleAllocate(rec.unit.members[0]?.id)}
                      disabled={allocating}
                    >
                      {allocating ? '...' : t.allocateBtn}
                    </Button>
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
