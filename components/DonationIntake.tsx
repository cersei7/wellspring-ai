'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { UI } from '@/lib/i18n';

export default function DonationIntake() {
  const { locale } = useLanguage();
  const t = UI[locale];
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleParse() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, locale }),
      });
      const data = await res.json();
      setParsed(data.items || []);
    } catch (err: any) {
      setMessage(`Parse failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/donations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: parsed, rawInput: text }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`✓ Saved ${data.saved.length} items to database`);
        setText('');
        setParsed([]);
      } else {
        setMessage(`✗ Save failed: ${data.error}`);
      }
    } catch (err: any) {
      setMessage(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-medium mb-4">{t.intakeTitle}</h2>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t.intakePlaceholder}
        className="mb-4 min-h-[100px]"
      />
      <Button onClick={handleParse} disabled={loading || !text}>
        {loading ? t.intakeParsing : t.intakeParseBtn}
      </Button>

      {parsed.length > 0 && (
        <div className="mt-6 space-y-2">
          <h3 className="font-medium">{t.intakeParsedItems}</h3>
          {parsed.map((item, i) => (
            <div key={i} className="flex items-center gap-2 p-2 border rounded">
              <Badge>{item.category}</Badge>
              <span>{item.name}</span>
              <span className="text-muted-foreground">
                {item.quantity} {item.unit}
              </span>
            </div>
          ))}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? t.intakeSaving : t.intakeSaveBtn}
          </Button>
        </div>
      )}

      {message && (
        <div className={`mt-4 p-3 rounded text-sm ${
          message.startsWith('✓')
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}
    </Card>
  );
}
