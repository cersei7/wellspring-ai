'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { UI } from '@/lib/i18n';

interface InventoryItem {
  category: string;
  name: string;
  available_quantity: number;
  unit: string;
}

export default function InventoryGrid() {
  const { locale } = useLanguage();
  const t = UI[locale];
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchInventory() {
    setLoading(true);
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInventory();
  }, []);

  // 按类别分组
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, InventoryItem[]>);

  const categoryLabels: Record<string, string> = {
    baby: locale === 'zh' ? '婴儿' : locale === 'es' ? 'Bebé' : 'Baby',
    food: locale === 'zh' ? '食品' : locale === 'es' ? 'Comida' : 'Food',
    clothing: locale === 'zh' ? '衣物' : locale === 'es' ? 'Ropa' : 'Clothing',
    hygiene: locale === 'zh' ? '卫生' : locale === 'es' ? 'Higiene' : 'Hygiene',
    household: locale === 'zh' ? '家居' : locale === 'es' ? 'Hogar' : 'Household',
    other: locale === 'zh' ? '其他' : locale === 'es' ? 'Otro' : 'Other',
  };

  const refreshText = {
    en: 'Refresh',
    zh: '刷新',
    es: 'Actualizar',
  };

  const descriptionText = {
    en: 'Live stock across categories. Computed from received donations minus distributions.',
    zh: '实时库存，根据接收捐赠和分发记录计算。',
    es: 'Inventario en vivo calculado a partir de donaciones recibidas y distribuciones.',
  };

  const loadingText = {
    en: 'Loading...',
    zh: '加载中...',
    es: 'Cargando...',
  };

  const emptyText = {
    en: 'No inventory data',
    zh: '暂无库存数据',
    es: 'No hay datos de inventario',
  };

  const itemHeader = {
    en: 'Item',
    zh: '物资',
    es: 'Artículo',
  };

  const availableHeader = {
    en: 'Available',
    zh: '可用数量',
    es: 'Disponible',
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">{t.tabInventory || 'Inventory'}</h2>
        <Button onClick={fetchInventory} variant="outline" size="sm">
          {refreshText[locale]}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        {descriptionText[locale]}
      </p>

      {loading ? (
        <div className="text-center py-8">{loadingText[locale]}</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, catItems]) => (
            <div key={category}>
              <h3 className="font-medium text-lg mb-2 capitalize">{categoryLabels[category] || category}</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 text-left">{itemHeader[locale]}</th>
                      <th className="p-2 text-left">{availableHeader[locale]}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catItems.map((item, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2">{item.name}</td>
                        <td className="p-2">{item.available_quantity} {item.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {emptyText[locale]}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
