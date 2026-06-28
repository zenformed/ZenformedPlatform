import type { BuildCoreFeatureWorkflowKnowledgeIndex } from '@/platform/docs/docsWorkflowKnowledgeTypes';

export function loadBuildCoreWorkflowKnowledgeIndexFromJson(
  json: { buildcore?: BuildCoreFeatureWorkflowKnowledgeIndex } | undefined,
): BuildCoreFeatureWorkflowKnowledgeIndex | undefined {
  const index = json?.buildcore;
  if (index == null || !Array.isArray(index.features)) {
    return undefined;
  }

  return index;
}

export function resolveDocsWorkflowForFeature(
  index: BuildCoreFeatureWorkflowKnowledgeIndex | undefined,
  featureId: string | undefined,
): BuildCoreFeatureWorkflowKnowledgeIndex['features'][number] | undefined {
  if (index == null || featureId == null || featureId.trim() === '') {
    return undefined;
  }

  return index.features.find((feature) => feature.feature === featureId);
}
