import type { BuildCoreFeatureKnowledge, BuildCoreFeatureKnowledgeIndex } from '../../src/platform/docs/docsFeatureKnowledgeTypes';
import type { BuildCoreFeatureWorkflowKnowledge, BuildCoreFeatureWorkflowKnowledgeIndex } from '../../src/platform/docs/docsWorkflowKnowledgeTypes';
import {
  mergeWorkflowEditorialOverride,
  parseBuildcoreWorkflowEditorial,
} from '../../src/platform/docs/parseBuildcoreWorkflowEditorial';

function stepsToWorkflowLines(feature: BuildCoreFeatureKnowledge): readonly string[] {
  const flows = [feature.creationFlow, feature.editFlow, feature.deleteFlow].filter(
    (flow): flow is NonNullable<typeof flow> => flow != null,
  );

  const lines: string[] = [];
  for (const flow of flows) {
    if (flow.summary.trim() !== '') {
      lines.push(flow.summary.trim());
    }

    for (const step of flow.steps ?? []) {
      const labels = step.uiLabels?.filter((label) => label.trim() !== '') ?? [];
      lines.push(labels.length > 0 ? `${step.description} (${labels.join(', ')})` : step.description);
    }
  }

  if (lines.length > 0) {
    return lines;
  }

  return feature.navigationPath.length > 0 ? [...feature.navigationPath] : [`Use ${feature.name} from its project context.`];
}

function seedWorkflowFromFeature(feature: BuildCoreFeatureKnowledge): BuildCoreFeatureWorkflowKnowledge {
  return {
    feature: feature.id,
    purpose: feature.purpose,
    primaryWorkflow: stepsToWorkflowLines(feature),
    alternateWorkflows: feature.whereItExists.filter((entry) => !feature.navigationPath.includes(entry)),
    prerequisites: feature.relationships.slice(0, 3),
    userTips: feature.limitations.slice(0, 2).map((item) => `Remember: ${item}`),
    commonMistakes: [],
    source: 'generated',
  };
}

export function extractBuildCoreWorkflowKnowledge(
  buildCoreRoot: string,
  featureIndex: BuildCoreFeatureKnowledgeIndex,
  editorialMarkdown: string,
): BuildCoreFeatureWorkflowKnowledgeIndex {
  const editorialOverrides = parseBuildcoreWorkflowEditorial(editorialMarkdown);
  const overrideByFeature = new Map(editorialOverrides.map((item) => [item.feature, item] as const));

  const features = featureIndex.features.map((feature) =>
    mergeWorkflowEditorialOverride(seedWorkflowFromFeature(feature), overrideByFeature.get(feature.id)),
  );

  return {
    generatedAt: new Date().toISOString(),
    sourceRoot: buildCoreRoot,
    features,
  };
}
