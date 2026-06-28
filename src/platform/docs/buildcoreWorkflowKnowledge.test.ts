import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mergeWorkflowEditorialOverride, parseBuildcoreWorkflowEditorial } from '@/platform/docs/parseBuildcoreWorkflowEditorial';
import { resolveDocsWorkflowForFeature } from '@/platform/docs/resolveDocsWorkflowForFeature';
import type { BuildCoreFeatureWorkflowKnowledgeIndex } from '@/platform/docs/docsWorkflowKnowledgeTypes';

const platformRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const workflowsPath = path.join(platformRoot, 'docs/generated/buildcore.workflows.json');
const editorialPath = path.join(platformRoot, 'docs/architecture/BUILDCORE_WORKFLOWS.editorial.md');

describe('buildcore feature workflows', () => {
  it('parses editorial workflow overrides for major features', () => {
    const editorial = fs.readFileSync(editorialPath, 'utf8');
    const overrides = parseBuildcoreWorkflowEditorial(editorial);
    const documents = overrides.find((item) => item.feature === 'documents');

    assert.ok(documents != null);
    assert.ok((documents.primaryWorkflow?.length ?? 0) >= 4);
    assert.ok((documents.commonMistakes?.length ?? 0) >= 2);
    assert.match(documents.primaryWorkflow?.join('\n') ?? '', /paperclip/i);
  });

  it('merges editorial primary workflow over generated seed', () => {
    const merged = mergeWorkflowEditorialOverride(
      {
        feature: 'documents',
        purpose: 'Generated purpose',
        primaryWorkflow: ['Open Documents and upload'],
        alternateWorkflows: [],
        prerequisites: [],
        userTips: [],
        commonMistakes: [],
        source: 'generated',
      },
      {
        feature: 'documents',
        primaryWorkflow: ['Open project', 'Go to Workflow Tasks', 'Use paperclip attachment'],
        commonMistakes: ['Assuming there is a standalone Documents page with a primary Upload button.'],
      },
    );

    assert.equal(merged.primaryWorkflow[0], 'Open project');
    assert.equal(merged.commonMistakes.length, 1);
    assert.equal(merged.source, 'editorial+generated');
  });

  it('loads generated workflow index with documents workflow', () => {
    if (!fs.existsSync(workflowsPath)) {
      return;
    }

    const json = JSON.parse(fs.readFileSync(workflowsPath, 'utf8')) as {
      buildcore?: BuildCoreFeatureWorkflowKnowledgeIndex;
    };
    const workflow = resolveDocsWorkflowForFeature(json.buildcore, 'documents');

    assert.ok(workflow != null);
    assert.ok(workflow.primaryWorkflow.some((step) => /workflow tasks/i.test(step)));
    assert.ok(
      workflow.commonMistakes.some((item) =>
        /standalone Documents page/i.test(item.replace(/\*\*/g, '')),
      ),
    );
  });
});
