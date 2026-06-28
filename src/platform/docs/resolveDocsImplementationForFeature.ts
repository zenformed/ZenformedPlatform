import type { BuildCoreFeatureImplementationKnowledge } from '@/platform/docs/docsImplementationKnowledgeTypes';
import type { BuildCoreImplementationKnowledgeIndex } from '@/platform/docs/docsImplementationKnowledgeTypes';

export function loadBuildCoreImplementationKnowledgeIndexFromJson(
  json: unknown,
): BuildCoreImplementationKnowledgeIndex | undefined {
  if (json == null || typeof json !== 'object') {
    return undefined;
  }

  const record = json as { buildcore?: BuildCoreImplementationKnowledgeIndex };
  if (record.buildcore == null || !Array.isArray(record.buildcore.features)) {
    return undefined;
  }

  return record.buildcore;
}

export function resolveDocsImplementationForFeature(
  index: BuildCoreImplementationKnowledgeIndex | undefined,
  featureId: string | undefined,
): BuildCoreFeatureImplementationKnowledge | undefined {
  if (index == null || featureId == null || featureId.trim() === '') {
    return undefined;
  }

  return index.features.find((feature) => feature.featureId === featureId);
}
