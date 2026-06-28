import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatDocsAuthoringGroundingForAi } from '@/platform/docs/formatDocsAuthoringGroundingForAi';
import type { BuildCoreDocsKnowledge } from '@/platform/docs/docsProductKnowledgeTypes';

const minimalGlobalContext = {
  product: { slug: 'buildcore', name: 'BuildCore' },
  navigation: [],
  features: [],
  routes: [],
  accessPatterns: [],
} as unknown as BuildCoreDocsKnowledge;

describe('formatDocsAuthoringGroundingForAi', () => {
  it('places author context before feature workflow in generate draft grounding', () => {
    const formatted = formatDocsAuthoringGroundingForAi({
      authorContext: 'Open Workflow Tasks and use the paperclip attachment control.',
      editorialPolicy: 'Editorial policy text.',
      globalProductContext: minimalGlobalContext,
      featureWorkflow: {
        feature: 'documents',
        purpose: 'Upload through tasks.',
        primaryWorkflow: ['Go to Workflow Tasks.'],
        alternateWorkflows: [],
        prerequisites: [],
        userTips: [],
        commonMistakes: [],
        source: 'editorial+generated',
      },
      articleMetadata: {
        title: 'Uploading Documents',
        summary: 'How to upload documents.',
        product: 'buildcore',
        category: 'projects',
        categoryTitle: 'Projects',
        tags: ['documents'],
        authorContext: 'Open Workflow Tasks and use the paperclip attachment control.',
      },
    });

    const authorLayerIndex = formatted.indexOf('LAYER 1: AUTHOR CONTEXT');
    const workflowLayerIndex = formatted.indexOf('LAYER 2: FEATURE WORKFLOW');
    const implementationLayerIndex = formatted.indexOf('LAYER 3: IMPLEMENTATION KNOWLEDGE');
    const globalLayerIndex = formatted.indexOf('LAYER 4: GLOBAL PRODUCT CONTEXT');
    const editorialLayerIndex = formatted.indexOf('LAYER 5: EDITORIAL POLICY');

    assert.ok(authorLayerIndex >= 0);
    assert.ok(workflowLayerIndex > authorLayerIndex);
    assert.ok(implementationLayerIndex > workflowLayerIndex);
    assert.ok(globalLayerIndex > implementationLayerIndex);
    assert.ok(editorialLayerIndex > globalLayerIndex);
    assert.match(formatted, /paperclip attachment control/);
  });
});
