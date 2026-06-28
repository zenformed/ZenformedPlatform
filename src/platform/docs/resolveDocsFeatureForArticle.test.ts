import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { BuildCoreFeatureKnowledgeIndex } from '@/platform/docs/docsFeatureKnowledgeTypes';
import { resolveDocsFeatureForArticle } from '@/platform/docs/resolveDocsFeatureForArticle';

const sampleIndex: BuildCoreFeatureKnowledgeIndex = {
  generatedAt: '2026-01-01T00:00:00.000Z',
  sourceRoot: '/BuildCore',
  features: [
    {
      id: 'projects',
      name: 'Projects',
      purpose: 'Projects feature',
      whereItExists: [],
      navigationPath: [],
      modals: [],
      buttons: [],
      formFields: [],
      validation: [],
      statusValues: [],
      relationships: [],
      limitations: [],
      relatedFeatures: [],
      routes: [],
      reactComponents: [],
      apiEndpoints: [],
      domainServices: [],
      databaseTables: [],
      docCategories: ['projects', 'getting-started'],
      keywords: ['project', 'create project', 'subproject'],
    },
    {
      id: 'workflow-tasks',
      name: 'Workflow Tasks',
      purpose: 'Workflow tasks feature',
      whereItExists: [],
      navigationPath: [],
      modals: [],
      buttons: [],
      formFields: [],
      validation: [],
      statusValues: [],
      relationships: [],
      limitations: [],
      relatedFeatures: [],
      routes: [],
      reactComponents: [],
      apiEndpoints: [],
      domainServices: [],
      databaseTables: [],
      docCategories: ['workflow'],
      keywords: ['workflow task', 'task', 'stage'],
    },
  ],
};

describe('resolveDocsFeatureForArticle', () => {
  it('matches workflow tasks for workflow category articles', () => {
    const match = resolveDocsFeatureForArticle(sampleIndex, {
      product: 'buildcore',
      category: 'workflow',
      title: 'Manage Workflow Tasks',
      summary: 'How to work with tasks on a project',
    });

    assert.equal(match?.feature.id, 'workflow-tasks');
    assert.ok((match?.score ?? 0) >= 8);
  });

  it('matches projects for create project articles', () => {
    const match = resolveDocsFeatureForArticle(sampleIndex, {
      product: 'buildcore',
      category: 'projects',
      title: 'Create a Project',
      summary: 'Walk through the New project modal',
    });

    assert.equal(match?.feature.id, 'projects');
  });

  it('returns undefined when no feature is a strong match', () => {
    const match = resolveDocsFeatureForArticle(sampleIndex, {
      product: 'buildcore',
      category: 'release-notes',
      title: 'BuildCore 2.0',
      summary: 'Release summary',
    });

    assert.equal(match, undefined);
  });
});
