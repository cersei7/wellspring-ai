import { askClaude } from './claude';

export async function generateReport(stats: {
  period: string;
  totalDonations: number;
  totalDistributed: number;
  topCategories: Array<{ name: string; count: number }>;
  beneficiariesServed: number;
  shortages: string[];
}) {
  const prompt = `你是 WellSpring 妇女中心的报告撰写助手。
基于以下数据，写一份 250 字左右的中文专业报告，自然流畅，包含数据洞察。

时间段: ${stats.period}
接收捐赠: ${stats.totalDonations} 件
已分发: ${stats.totalDistributed} 件
受益家庭/个人: ${stats.beneficiariesServed}
热门类别: ${stats.topCategories.map(c => `${c.name}(${c.count})`).join(', ')}
短缺预警: ${stats.shortages.join(', ') || '无'}

格式：第一段总览，第二段分配亮点，第三段建议。`;

  return askClaude(prompt, undefined, 800);
}
