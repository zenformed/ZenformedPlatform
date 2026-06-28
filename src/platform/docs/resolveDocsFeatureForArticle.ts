import type {
  BuildCoreFeatureKnowledge,
  BuildCoreFeatureKnowledgeIndex,
  DocsFeatureLookupInput,
  DocsFeatureLookupResult,
} from '@/platform/docs/docsFeatureKnowledgeTypes';

const MIN_MATCH_SCORE = 8;

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function tokenize(value: string): readonly string[] {
  const normalized = normalizeText(value);
  if (normalized === '') {
    return [];
  }
  return normalized.split(/\s+/).filter((token) => token.length > 1);
}

function scoreFeature(feature: BuildCoreFeatureKnowledge, input: DocsFeatureLookupInput): DocsFeatureLookupResult {
  const reasons: string[] = [];
  let score = 0;

  if (feature.docCategories.includes(input.category)) {
    score += 12;
    reasons.push(`category:${input.category}`);
  }

  const haystack = normalizeText([input.title, input.summary ?? '', ...(input.tags ?? [])].join(' '));
  const featureName = normalizeText(feature.name);
  if (haystack.includes(featureName)) {
    score += 10;
    reasons.push(`title-contains-feature-name:${feature.name}`);
  }

  if (haystack.includes(normalizeText(feature.id.replace(/-/g, ' ')))) {
    score += 8;
    reasons.push(`title-contains-feature-id:${feature.id}`);
  }

  for (const keyword of feature.keywords) {
    const normalizedKeyword = normalizeText(keyword);
    if (normalizedKeyword === '') {
      continue;
    }

    if (haystack.includes(normalizedKeyword)) {
      score += 5;
      reasons.push(`keyword:${keyword}`);
    }
  }

  const titleTokens = tokenize(input.title);
  for (const token of titleTokens) {
    if (feature.keywords.some((keyword) => normalizeText(keyword).includes(token))) {
      score += 2;
      reasons.push(`title-token:${token}`);
    }
  }

  return { feature, score, matchReasons: reasons };
}

export function resolveDocsFeatureForArticle(
  index: BuildCoreFeatureKnowledgeIndex | undefined,
  input: DocsFeatureLookupInput,
): DocsFeatureLookupResult | undefined {
  if (index == null || input.product !== 'buildcore') {
    return undefined;
  }

  const scored = index.features
    .map((feature) => scoreFeature(feature, input))
    .sort((left, right) => right.score - left.score);

  const best = scored[0];
  if (best == null || best.score < MIN_MATCH_SCORE) {
    return undefined;
  }

  return best;
}

export function loadBuildCoreFeatureKnowledgeIndexFromJson(
  json: unknown,
): BuildCoreFeatureKnowledgeIndex | undefined {
  if (json == null || typeof json !== 'object') {
    return undefined;
  }

  const record = json as { buildcore?: BuildCoreFeatureKnowledgeIndex };
  if (record.buildcore == null || !Array.isArray(record.buildcore.features)) {
    return undefined;
  }

  return record.buildcore;
}
