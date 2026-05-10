import { askClaude } from './claude';
import { Beneficiary, FamilyRelation, AllocationUnit, ScoreBreakdown, Recommendation } from './types';

export function buildAllocationUnits(
  beneficiaries: Beneficiary[],
  relations: FamilyRelation[],
  scarcityMode: boolean
): AllocationUnit[] {
  if (!scarcityMode) {
    return beneficiaries.map((b) => ({
      id: `unit-${b.id}`,
      type: 'individual',
      memberIds: [b.id],
      members: [b],
    }));
  }

  const parent = new Map<string, string>();
  beneficiaries.forEach((b) => parent.set(b.id, b.id));

  const find = (x: string): string => {
    if (parent.get(x) === x) return x;
    const root = find(parent.get(x)!);
    parent.set(x, root);
    return root;
  };

  const union = (a: string, b: string) => {
    const rA = find(a), rB = find(b);
    if (rA !== rB) parent.set(rA, rB);
  };

  relations.forEach((r) => union(r.beneficiary_a, r.beneficiary_b));

  const groups = new Map<string, Beneficiary[]>();
  beneficiaries.forEach((b) => {
    const root = find(b.id);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root)!.push(b);
  });

  return Array.from(groups.entries()).map(([rootId, members]) => ({
    id: `unit-${rootId}`,
    type: members.length > 1 ? 'family' : 'individual',
    memberIds: members.map((m) => m.id),
    members,
  }));
}

export function calculateScore(
  unit: AllocationUnit,
  donation: { category: string; attributes: Record<string, any> }
): ScoreBreakdown {
  const needMatch = unit.members.some((m) => m.needs.includes(donation.category)) ? 1.0 : 0.2;
  const lastReceivedDays = Math.min(
    ...unit.members.map((m) =>
      m.last_received_at
        ? (Date.now() - new Date(m.last_received_at).getTime()) / 86400000
        : 30
    )
  );
  const waitTime = Math.min(lastReceivedDays / 30, 1);
  const urgency = Math.max(...unit.members.map((m) => m.urgency_level)) / 5;
  let vulnerability = unit.members.reduce((sum, m) => {
    let score = 0;
    if (m.has_infant) score += 0.4;
    if (m.has_elderly) score += 0.3;
    if (m.has_disability) score += 0.3;
    return sum + score;
  }, 0) / unit.members.length;
  vulnerability = Math.min(vulnerability, 1);

  const total = needMatch * 0.40 + waitTime * 0.25 + urgency * 0.20 + vulnerability * 0.15;
  return { needMatch, waitTime, urgency, vulnerability, total };
}

export async function explainRecommendation(
  unit: AllocationUnit,
  donation: any,
  score: ScoreBreakdown,
  rank: number
): Promise<string> {
  const prompt = `你是有经验的物资分配协调员。用 1-2 句中文解释为何这个分配单位排名第 ${rank}。
保持简洁、专业、富有同理心。不要使用真名，仅用单位 ID。

分配单位: ${unit.id} (${unit.type === 'family' ? `家庭单位 ${unit.memberIds.length} 人` : '个人'})
物资: ${donation.name} (${donation.category})
得分: 需求匹配 ${(score.needMatch*100).toFixed(0)}% | 等待 ${(score.waitTime*100).toFixed(0)}% | 紧急 ${(score.urgency*100).toFixed(0)}% | 脆弱性 ${(score.vulnerability*100).toFixed(0)}%`;

  return askClaude(prompt, undefined, 300);
}

export async function recommendDistribution(
  beneficiaries: Beneficiary[],
  relations: FamilyRelation[],
  donation: any,
  inventoryQty: number,
  totalDemand: number
): Promise<{ scarcityMode: boolean; recommendations: Recommendation[] }> {
  const scarcityMode = inventoryQty < totalDemand * 1.5;
  const units = buildAllocationUnits(beneficiaries, relations, scarcityMode);
  const scored = units.map((u) => ({ unit: u, score: calculateScore(u, donation) }));
  scored.sort((a, b) => b.score.total - a.score.total);
  const recommendations = await Promise.all(
    scored.slice(0, 5).map(async (s, i) => ({
      rank: i + 1,
      unit: s.unit,
      score: s.score,
      explanation: await explainRecommendation(s.unit, donation, s.score, i + 1),
    }))
  );
  return { scarcityMode, recommendations };
}
