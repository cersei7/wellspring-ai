import { askClaude } from './claude';
import { ParsedDonationItem } from './types';
import { Locale, LOCALE_INSTRUCTION } from './i18n';

function getParseSystem(locale: Locale): string {
  return `${LOCALE_INSTRUCTION[locale]}

You are a donation intake assistant AND a translator.
When the user describes items in any language (Chinese, Spanish, etc.), you MUST translate the item name and unit into **English**.
The output JSON must contain:
- category: one of "food", "clothing", "hygiene", "baby", "household", "other"
- name: the item name **translated to English** (e.g., "奶粉" → "baby formula", "冬衣" → "winter coat")
- quantity: integer
- unit: the unit **translated to English** (e.g., "箱" → "boxes", "罐" → "cans")
- attributes: any extra properties

CRITICAL: The "name" and "unit" fields MUST be in English after translation. Do NOT output the original language.
Output only a valid JSON array. No extra text.`;
}

export async function parseDonation(text: string, locale: Locale = 'en'): Promise<ParsedDonationItem[]> {
  try {
    const response = await askClaude(text, getParseSystem(locale), 1024);
    const cleaned = response.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('Parse failed:', e);
    return [];
  }
}
