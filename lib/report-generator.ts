import { askClaude } from './claude';
import { Locale, LOCALE_INSTRUCTION } from './i18n';

export async function generateReport(
  stats: {
    period: string;
    totalDonations: number;
    totalDistributed: number;
    topCategories: Array<{ name: string; count: number }>;
    beneficiariesServed: number;
    shortages: string[];
  },
  locale: Locale = 'en'
) {
  const prompt = `${LOCALE_INSTRUCTION[locale]}

You are a report writer for WellSpring Women's Center.
Based on the data below, write a ~250-word professional report with natural flow and data insights.

Period: ${stats.period}
Donations received: ${stats.totalDonations}
Distributed: ${stats.totalDistributed}
Beneficiaries served: ${stats.beneficiariesServed}
Top categories: ${stats.topCategories.map(c => `${c.name}(${c.count})`).join(', ')}
Shortage alerts: ${stats.shortages.join(', ') || 'none'}

Format: paragraph 1 = overview, paragraph 2 = distribution highlights, paragraph 3 = recommendations.`;

  return askClaude(prompt, undefined, 800);
}
