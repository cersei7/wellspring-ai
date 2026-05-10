import { askClaude } from './claude';
import { ParsedDonationItem } from './types';

const PARSE_SYSTEM = `你是捐赠物资解析助手。
将自然语言描述转换为 JSON 数组，每项包含:
- category: "food" | "clothing" | "hygiene" | "baby" | "household" | "other"
- name: 物资名称
- quantity: 数量 (整数)
- unit: 单位 (如 "boxes", "items", "lbs")
- attributes: 额外属性对象 (如尺码、年龄段)

仅输出 JSON，不要任何解释。`;

export async function parseDonation(text: string): Promise<ParsedDonationItem[]> {
  try {
    const response = await askClaude(text, PARSE_SYSTEM, 1024);
    const cleaned = response.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('Parse failed:', e);
    return [];
  }
}
