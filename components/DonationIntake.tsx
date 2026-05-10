'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function DonationIntake() {
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
        body: JSON.stringify({ text }),
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
      <h2 className="text-xl font-medium mb-4">Add Donation (Natural Language)</h2>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g. got 3 boxes of canned food, 2 winter coats size L, 10 cans of baby formula..."
        className="mb-4 min-h-[100px]"
      />
      <Button onClick={handleParse} disabled={loading || !text}>
        {loading ? 'Parsing...' : 'Parse with AI'}
      </Button>

      {parsed.length > 0 && (
        <div className="mt-6 space-y-2">
          <h3 className="font-medium">Parsed items:</h3>
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
            {saving ? 'Saving...' : 'Confirm & Save'}
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
