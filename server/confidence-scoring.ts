import type { 
  Confidence, 
  Claim, 
  EvidenceReference, 
  ClaimTag,
  ConfidenceLevel,
  ReliabilityGrade
} from "@shared/schema";

// Confidence scoring rules based on GIA tech spec
// Base score adjustments
const SCORE_ADJUSTMENTS = {
  // Evidence-based adjustments
  EVIDENCE_SOURCE: 0.20, // +0.20 per corroborating evidence source
  ASSUMPTION_PENALTY: -0.15, // -0.15 for ASSUMPTION tag
  UNKNOWN_PENALTY: -0.25, // -0.25 for UNKNOWN tag
  
  // Reliability adjustments (per evidence grade)
  RELIABILITY_A: 0.15,
  RELIABILITY_B: 0.10,
  RELIABILITY_C: 0.05,
  RELIABILITY_D: 0.00,
  RELIABILITY_E: -0.05,
  
  // Temporal adjustments
  RECENT_24H: 0.10, // Evidence within 24 hours
  RECENT_7D: 0.05, // Evidence within 7 days
  STALE_30D: -0.10, // Evidence older than 30 days
  
  // Coverage adjustments
  PMESII_COMPLETE: 0.15, // All 6 dimensions covered
  PMESII_PARTIAL: 0.05, // 4-5 dimensions covered
  
  // Multi-source corroboration
  MULTI_SOURCE_2: 0.10, // 2 independent sources
  MULTI_SOURCE_3_PLUS: 0.20, // 3+ independent sources
};

// Confidence level thresholds
const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.70,
  MED: 0.45,
  // Below 0.45 is LOW
};

export interface ConfidenceContext {
  evidenceCount: number;
  reliabilityGrades: ReliabilityGrade[];
  hasRecentEvidence: boolean;
  evidenceAgeHours?: number;
  pmesiiDimensionsCovered?: number;
  independentSources?: number;
  claimTag?: ClaimTag;
}

export function calculateDeterministicConfidence(
  context: ConfidenceContext
): Confidence {
  let score = 0.50; // Base score
  const basis: string[] = [];

  // Apply evidence source adjustments
  if (context.evidenceCount > 0) {
    const evidenceBonus = Math.min(context.evidenceCount * SCORE_ADJUSTMENTS.EVIDENCE_SOURCE, 0.40);
    score += evidenceBonus;
    basis.push(`${context.evidenceCount}_evidence_sources`);
  }

  // Apply reliability adjustments
  for (const grade of context.reliabilityGrades) {
    switch (grade) {
      case 'A':
        score += SCORE_ADJUSTMENTS.RELIABILITY_A;
        break;
      case 'B':
        score += SCORE_ADJUSTMENTS.RELIABILITY_B;
        break;
      case 'C':
        score += SCORE_ADJUSTMENTS.RELIABILITY_C;
        break;
      case 'D':
        score += SCORE_ADJUSTMENTS.RELIABILITY_D;
        break;
      case 'E':
        score += SCORE_ADJUSTMENTS.RELIABILITY_E;
        break;
    }
  }
  if (context.reliabilityGrades.length > 0) {
    basis.push(`reliability_grades_${context.reliabilityGrades.join('')}`);
  }

  // Apply temporal adjustments
  if (context.evidenceAgeHours !== undefined) {
    if (context.evidenceAgeHours <= 24) {
      score += SCORE_ADJUSTMENTS.RECENT_24H;
      basis.push('recent_24h');
    } else if (context.evidenceAgeHours <= 168) { // 7 days
      score += SCORE_ADJUSTMENTS.RECENT_7D;
      basis.push('recent_7d');
    } else if (context.evidenceAgeHours > 720) { // 30 days
      score += SCORE_ADJUSTMENTS.STALE_30D;
      basis.push('stale_evidence');
    }
  }

  // Apply PMESII coverage adjustments
  if (context.pmesiiDimensionsCovered !== undefined) {
    if (context.pmesiiDimensionsCovered >= 6) {
      score += SCORE_ADJUSTMENTS.PMESII_COMPLETE;
      basis.push('pmesii_complete');
    } else if (context.pmesiiDimensionsCovered >= 4) {
      score += SCORE_ADJUSTMENTS.PMESII_PARTIAL;
      basis.push('pmesii_partial');
    }
  }

  // Apply multi-source corroboration
  if (context.independentSources !== undefined) {
    if (context.independentSources >= 3) {
      score += SCORE_ADJUSTMENTS.MULTI_SOURCE_3_PLUS;
      basis.push('multi_source_corroboration');
    } else if (context.independentSources >= 2) {
      score += SCORE_ADJUSTMENTS.MULTI_SOURCE_2;
      basis.push('dual_source_corroboration');
    }
  }

  // Apply claim tag penalties
  if (context.claimTag === 'ASSUMPTION') {
    score += SCORE_ADJUSTMENTS.ASSUMPTION_PENALTY;
    basis.push('assumption_tag');
  } else if (context.claimTag === 'UNKNOWN') {
    score += SCORE_ADJUSTMENTS.UNKNOWN_PENALTY;
    basis.push('unknown_tag');
  }

  // Clamp score to valid range
  score = Math.max(0, Math.min(1, score));

  // Determine level
  const level: ConfidenceLevel = 
    score >= CONFIDENCE_THRESHOLDS.HIGH ? 'High' :
    score >= CONFIDENCE_THRESHOLDS.MED ? 'Med' : 'Low';

  return { level, score: Math.round(score * 100) / 100, basis };
}

export function calculateClaimConfidence(claim: Partial<Claim>): Confidence {
  const context: ConfidenceContext = {
    evidenceCount: claim.evidence?.length || 0,
    reliabilityGrades: claim.evidence?.map(e => e.reliability) || [],
    hasRecentEvidence: false,
    claimTag: claim.tag,
  };

  // Calculate evidence age if timestamps available
  const now = Date.now();
  const evidenceTimestamps = claim.evidence
    ?.filter(e => e.timestamp)
    .map(e => new Date(e.timestamp!).getTime()) || [];
  
  if (evidenceTimestamps.length > 0) {
    const mostRecentEvidence = Math.max(...evidenceTimestamps);
    context.evidenceAgeHours = (now - mostRecentEvidence) / (1000 * 60 * 60);
    context.hasRecentEvidence = context.evidenceAgeHours <= 24;
  }

  // Count independent sources
  if (claim.evidence) {
    const uniqueSources = new Set(claim.evidence.map(e => e.artifact_id));
    context.independentSources = uniqueSources.size;
  }

  return calculateDeterministicConfidence(context);
}

export function validateClaimTag(claim: Partial<Claim>): ClaimTag {
  if (!claim.evidence || claim.evidence.length === 0) {
    return 'ASSUMPTION';
  }

  const hasHighReliability = claim.evidence.some(e => 
    e.reliability === 'A' || e.reliability === 'B'
  );

  const hasMultipleSources = new Set(claim.evidence.map(e => e.artifact_id)).size >= 2;

  if (hasHighReliability || hasMultipleSources) {
    return 'SUPPORTED';
  }

  return 'UNKNOWN';
}

export function aggregateConfidences(confidences: Confidence[]): Confidence {
  if (confidences.length === 0) {
    return { level: 'Low', score: 0.3, basis: ['no_data'] };
  }

  const avgScore = confidences.reduce((sum, c) => sum + c.score, 0) / confidences.length;
  const allBasis = Array.from(new Set(confidences.flatMap(c => c.basis)));

  const level: ConfidenceLevel = 
    avgScore >= CONFIDENCE_THRESHOLDS.HIGH ? 'High' :
    avgScore >= CONFIDENCE_THRESHOLDS.MED ? 'Med' : 'Low';

  return {
    level,
    score: Math.round(avgScore * 100) / 100,
    basis: allBasis,
  };
}

export function formatConfidenceDisplay(confidence: Confidence): string {
  const percentage = Math.round(confidence.score * 100);
  const levelEmoji = confidence.level === 'High' ? '●' : 
                     confidence.level === 'Med' ? '◐' : '○';
  return `${levelEmoji} ${confidence.level} (${percentage}%)`;
}
