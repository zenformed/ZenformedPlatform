#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractBuildCoreDocsKnowledge, resolveBuildCoreRoot } from './docsContext/buildcoreExtractor';
import { extractBuildCoreFeatureKnowledge } from './docsContext/buildcoreFeatureExtractor';
import { extractBuildCoreImplementationKnowledge } from './docsContext/buildcoreImplementationExtractor';
import { extractBuildCoreWorkflowKnowledge } from './docsContext/buildcoreWorkflowExtractor';
import { renderBuildCoreContextMarkdown } from './docsContext/renderBuildCoreContext';
import { formatDocsAuthoringGroundingForAi } from '../src/platform/docs/formatDocsAuthoringGroundingForAi';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const platformRoot = path.resolve(scriptDir, '..');

const generatedDir = path.join(platformRoot, 'docs', 'generated');
const jsonOutputPath = path.join(generatedDir, 'buildcore.context.json');
const featuresOutputPath = path.join(generatedDir, 'buildcore.features.json');
const implementationOutputPath = path.join(generatedDir, 'buildcore.implementation.json');
const workflowsOutputPath = path.join(generatedDir, 'buildcore.workflows.json');
const markdownOutputPath = path.join(platformRoot, 'docs', 'architecture', 'BUILDCORE_DOCS_CONTEXT.md');
const editorialPath = path.join(platformRoot, 'docs', 'architecture', 'BUILDCORE_DOCS_CONTEXT.editorial.md');
const workflowsEditorialPath = path.join(platformRoot, 'docs', 'architecture', 'BUILDCORE_WORKFLOWS.editorial.md');

function main(): void {
  const buildCoreRoot = resolveBuildCoreRoot(platformRoot);
  console.log(`Scanning BuildCore at: ${buildCoreRoot}`);

  const knowledge = extractBuildCoreDocsKnowledge(buildCoreRoot);
  const featureKnowledge = extractBuildCoreFeatureKnowledge(buildCoreRoot, knowledge);
  const implementationKnowledge = extractBuildCoreImplementationKnowledge(buildCoreRoot, featureKnowledge.features);

  if (!fs.existsSync(editorialPath)) {
    throw new Error(`Missing editorial overlay: ${editorialPath}`);
  }

  if (!fs.existsSync(workflowsEditorialPath)) {
    throw new Error(`Missing workflow editorial overlay: ${workflowsEditorialPath}`);
  }

  const editorialMarkdown = fs.readFileSync(editorialPath, 'utf8');
  const workflowsEditorialMarkdown = fs.readFileSync(workflowsEditorialPath, 'utf8');
  const workflowKnowledge = extractBuildCoreWorkflowKnowledge(buildCoreRoot, featureKnowledge, workflowsEditorialMarkdown);
  const markdown = renderBuildCoreContextMarkdown(knowledge, editorialMarkdown);
  const documentsWorkflow = workflowKnowledge.features.find((feature) => feature.feature === 'documents');
  const workflowImplementation = implementationKnowledge.features.find((feature) => feature.featureId === 'documents');
  const aiContextPreviewLength = formatDocsAuthoringGroundingForAi({
    editorialPolicy: editorialMarkdown,
    globalProductContext: knowledge,
    articleMetadata: {
      title: 'Uploading Documents',
      summary: '',
      product: 'buildcore',
      category: 'documents',
      categoryTitle: 'Documents',
      tags: [],
    },
    featureKnowledge: featureKnowledge.features.find((feature) => feature.id === 'documents'),
    featureWorkflow: documentsWorkflow,
    implementationKnowledge: workflowImplementation,
  }).length;

  fs.mkdirSync(generatedDir, { recursive: true });
  fs.writeFileSync(jsonOutputPath, `${JSON.stringify({ buildcore: knowledge }, null, 2)}\n`, 'utf8');
  fs.writeFileSync(featuresOutputPath, `${JSON.stringify({ buildcore: featureKnowledge }, null, 2)}\n`, 'utf8');
  fs.writeFileSync(
    implementationOutputPath,
    `${JSON.stringify({ buildcore: implementationKnowledge }, null, 2)}\n`,
    'utf8',
  );
  fs.writeFileSync(
    workflowsOutputPath,
    `${JSON.stringify({ buildcore: workflowKnowledge }, null, 2)}\n`,
    'utf8',
  );
  fs.writeFileSync(markdownOutputPath, markdown, 'utf8');

  console.log(`Wrote ${path.relative(platformRoot, jsonOutputPath)}`);
  console.log(`Wrote ${path.relative(platformRoot, featuresOutputPath)} (${featureKnowledge.features.length} features)`);
  console.log(
    `Wrote ${path.relative(platformRoot, implementationOutputPath)} (${implementationKnowledge.features.length} implementation profiles)`,
  );
  console.log(
    `Wrote ${path.relative(platformRoot, workflowsOutputPath)} (${workflowKnowledge.features.length} feature workflows)`,
  );
  console.log(`Wrote ${path.relative(platformRoot, markdownOutputPath)}`);
  console.log(`AI grounding payload size (documents workflow sample): ${aiContextPreviewLength} characters`);
  if (documentsWorkflow != null) {
    console.log(`Documents workflow steps: ${documentsWorkflow.primaryWorkflow.length}`);
  }
  if (workflowImplementation != null) {
    console.log(`Documents implementation buttons: ${workflowImplementation.buttons.slice(0, 5).join(', ')}`);
  }
}
main();
