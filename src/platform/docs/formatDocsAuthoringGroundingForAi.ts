import type { BuildCoreDocsKnowledge } from '@/platform/docs/docsProductKnowledgeTypes';

import type { BuildCoreFeatureKnowledge } from '@/platform/docs/docsFeatureKnowledgeTypes';

import type { BuildCoreFeatureImplementationKnowledge } from '@/platform/docs/docsImplementationKnowledgeTypes';

import type { BuildCoreFeatureWorkflowKnowledge } from '@/platform/docs/docsWorkflowKnowledgeTypes';

export type DocsAuthoringArticleMetadata = {
  readonly title: string;
  readonly summary: string;
  readonly product: string;
  readonly category: string;
  readonly categoryTitle: string;
  readonly tags: readonly string[];
  readonly authorContext?: string;
};

export type DocsAuthoringGroundingLayers = {
  readonly authorContext?: string;
  readonly editorialPolicy: string;
  readonly globalProductContext: BuildCoreDocsKnowledge;
  readonly featureKnowledge?: BuildCoreFeatureKnowledge;
  readonly featureMatchReasons?: readonly string[];
  readonly featureWorkflow?: BuildCoreFeatureWorkflowKnowledge;
  readonly implementationKnowledge?: BuildCoreFeatureImplementationKnowledge;
  readonly articleMetadata: DocsAuthoringArticleMetadata;
};

export function formatDocsAuthoringGroundingForAi(layers: DocsAuthoringGroundingLayers): string {
  const authorContext = (layers.authorContext ?? layers.articleMetadata.authorContext ?? '').trim();

  const sections = [
    'Documentation AI grounding layers (authoritative — do not contradict):',
    '',
    'Generate Draft priority (highest to lowest):',
    '1. Author Context — authoritative for this specific article unless it violates forbidden URL or security rules.',
    '2. Feature Workflow — authoritative for intended user flows and procedural steps.',
    '3. Implementation Knowledge — primary source for UI labels, buttons, modals, fields, validation, and permissions.',
    '4. Global Product Context — navigation, routes, and cross-feature orientation.',
    '5. Editorial Policy — access patterns, forbidden assumptions, and documentation policy.',
    '',
    'When Author Context is supplied, treat it as authoritative for this article. Turn rough staff notes into clear documentation steps without inventing a different workflow.',
    'If a Feature Workflow is also supplied, align the draft with Author Context first, then use the feature workflow for structure and UI accuracy.',
    'If implementation context is provided, NEVER invent alternative labels.',
    'Do not invent UI labels, tabs, buttons, or steps that are not present in implementation or feature context.',
    '',
  ];

  if (authorContext !== '') {
    sections.push(
      '--- LAYER 1: AUTHOR CONTEXT (highest priority for this article) ---',
      authorContext,
      '--- END LAYER 1 ---',
      '',
    );
  } else {
    sections.push(
      '--- LAYER 1: AUTHOR CONTEXT ---',
      'No author context supplied for this article.',
      '--- END LAYER 1 ---',
      '',
    );
  }

  if (layers.featureWorkflow != null) {
    sections.push(
      '--- LAYER 2: FEATURE WORKFLOW (authoritative for user flows) ---',
      JSON.stringify(layers.featureWorkflow, null, 2),
      '--- END LAYER 2 ---',
      '',
    );
  } else {
    sections.push(
      '--- LAYER 2: FEATURE WORKFLOW ---',
      'No feature workflow matched — avoid inventing procedural steps; prefer generic orientation.',
      '--- END LAYER 2 ---',
      '',
    );
  }

  if (layers.implementationKnowledge != null) {
    sections.push(
      '--- LAYER 3: IMPLEMENTATION KNOWLEDGE (primary for UI labels) ---',
      JSON.stringify(layers.implementationKnowledge, null, 2),
      '--- END LAYER 3 ---',
      '',
    );
  } else {
    sections.push(
      '--- LAYER 3: IMPLEMENTATION KNOWLEDGE ---',
      'No implementation context matched — prefer generic wording over invented UI labels.',
      '--- END LAYER 3 ---',
      '',
    );
  }

  sections.push(
    '--- LAYER 4: GLOBAL PRODUCT CONTEXT ---',
    JSON.stringify(layers.globalProductContext, null, 2),
    '--- END LAYER 4 ---',
    '',
    '--- LAYER 5: EDITORIAL POLICY ---',
    layers.editorialPolicy.trim(),
    '--- END LAYER 5 ---',
  );

  if (layers.featureKnowledge != null) {
    sections.push(
      '',
      '--- LAYER 6: FEATURE KNOWLEDGE ---',
      ...(layers.featureMatchReasons != null && layers.featureMatchReasons.length > 0
        ? [`Match reasons: ${layers.featureMatchReasons.join(', ')}`, '']
        : []),
      JSON.stringify(layers.featureKnowledge, null, 2),
      '--- END LAYER 6 ---',
    );
  } else {
    sections.push(
      '',
      '--- LAYER 6: FEATURE KNOWLEDGE ---',
      'No specific feature match — use global product context only and avoid inventing workflows.',
      '--- END LAYER 6 ---',
    );
  }

  sections.push(
    '',
    '--- LAYER 7: CURRENT ARTICLE METADATA ---',
    JSON.stringify(layers.articleMetadata, null, 2),
    '--- END LAYER 7 ---',
  );

  return sections.join('\n');
}

/** @deprecated Prefer formatDocsAuthoringGroundingForAi for Generate Draft. */
export function formatBuildCoreKnowledgeForAi(
  knowledge: BuildCoreDocsKnowledge,
  editorialMarkdown: string,
): string {
  return formatDocsAuthoringGroundingForAi({
    editorialPolicy: editorialMarkdown,
    globalProductContext: knowledge,
    articleMetadata: {
      title: '',
      summary: '',
      product: knowledge.product.slug,
      category: '',
      categoryTitle: '',
      tags: [],
    },
  });
}

export function formatDocsProductKnowledgeForAi(
  globalKnowledge: BuildCoreDocsKnowledge,
  editorialMarkdown: string,
  articleMetadata: DocsAuthoringArticleMetadata,
  featureKnowledge?: BuildCoreFeatureKnowledge,
  featureMatchReasons?: readonly string[],
  featureWorkflow?: BuildCoreFeatureWorkflowKnowledge,
  implementationKnowledge?: BuildCoreFeatureImplementationKnowledge,
): string {
  return formatDocsAuthoringGroundingForAi({
    authorContext: articleMetadata.authorContext,
    editorialPolicy: editorialMarkdown,
    globalProductContext: globalKnowledge,
    featureKnowledge,
    featureMatchReasons,
    featureWorkflow,
    implementationKnowledge,
    articleMetadata,
  });
}
