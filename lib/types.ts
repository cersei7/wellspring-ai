export interface Beneficiary {
  id: string;
  anonymous_id: string;
  needs: string[];
  urgency_level: number;
  last_received_at: string | null;
  has_infant: boolean;
  has_elderly: boolean;
  has_disability: boolean;
  real_name?: string;
  contact?: string;
  address?: string;
  notes?: string;
  created_at: string;
}

export interface FamilyRelation {
  id: string;
  beneficiary_a: string;
  beneficiary_b: string;
  relationship_type: 'parent_child' | 'married' | 'siblings' | 'other';
}

export interface AllocationUnit {
  id: string;
  type: 'individual' | 'family';
  memberIds: string[];
  members: Beneficiary[];
}

export interface ParsedDonationItem {
  category: string;
  name: string;
  quantity: number;
  unit: string;
  attributes: Record<string, any>;
}

export interface ScoreBreakdown {
  needMatch: number;
  waitTime: number;
  urgency: number;
  vulnerability: number;
  total: number;
}

export interface Recommendation {
  rank: number;
  unit: AllocationUnit;
  score: ScoreBreakdown;
  explanation: string;
}
