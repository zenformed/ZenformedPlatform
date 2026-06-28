import type { BuildCoreFeatureWorkflowKnowledge } from './docsWorkflowKnowledgeTypes';

type MutableBuildCoreWorkflowEditorialOverride = {
  feature: string;
  purpose?: string;
  primaryWorkflow?: string[];
  alternateWorkflows?: string[];
  prerequisites?: string[];
  userTips?: string[];
  commonMistakes?: string[];
};

export type BuildCoreWorkflowEditorialOverride = {
  readonly feature: string;
  readonly purpose?: string;
  readonly primaryWorkflow?: readonly string[];
  readonly alternateWorkflows?: readonly string[];
  readonly prerequisites?: readonly string[];
  readonly userTips?: readonly string[];
  readonly commonMistakes?: readonly string[];
};

const FEATURE_HEADING_PATTERN = /^##\s+([a-z0-9-]+)\s*$/i;
const SUBSECTION_HEADING_PATTERN = /^###\s+(Primary workflow|Alternate workflows|Prerequisites|User tips|Common mistakes)\s*$/i;

type EditorialSectionKey = 'primaryWorkflow' | 'alternateWorkflows' | 'prerequisites' | 'userTips' | 'commonMistakes';

function parseListItems(block: string): readonly string[] {
  return block
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- ') || /^\d+\.\s+/.test(line))
    .map((line) => line.replace(/^-+\s*/, '').replace(/^\d+\.\s+/, '').trim())
    .filter((line) => line !== '');
}

function parsePurpose(block: string): string | undefined {
  const trimmed = block.trim();
  if (trimmed === '') {
    return undefined;
  }

  const paragraph = trimmed
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line !== '' && !line.startsWith('#') && !line.startsWith('- ') && !/^\d+\.\s+/.test(line));

  return paragraph;
}

function subsectionKey(label: string): EditorialSectionKey {
  switch (label.toLowerCase()) {
    case 'primary workflow':
      return 'primaryWorkflow';
    case 'alternate workflows':
      return 'alternateWorkflows';
    case 'prerequisites':
      return 'prerequisites';
    case 'user tips':
      return 'userTips';
    default:
      return 'commonMistakes';
  }
}

export function parseBuildcoreWorkflowEditorial(markdown: string): readonly BuildCoreWorkflowEditorialOverride[] {
  const overrides = new Map<string, MutableBuildCoreWorkflowEditorialOverride>();
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');

  let currentFeature: string | undefined;
  let currentSection: EditorialSectionKey | 'purpose' | undefined;
  let sectionLines: string[] = [];

  const ensureFeature = (featureId: string): MutableBuildCoreWorkflowEditorialOverride => {
    const existing = overrides.get(featureId);
    if (existing != null) {
      return existing;
    }

    const created = { feature: featureId };
    overrides.set(featureId, created);
    return created;
  };

  const flushSection = (): void => {
    if (currentFeature == null || currentSection == null) {
      sectionLines = [];
      currentSection = undefined;
      return;
    }

    const block = sectionLines.join('\n').trim();
    const target = ensureFeature(currentFeature);

    if (currentSection === 'purpose') {
      const purpose = parsePurpose(block);
      if (purpose != null) {
        target.purpose = purpose;
      }
    } else {
      const items = parseListItems(block);
      if (items.length > 0) {
        target[currentSection] = [...items];
      }
    }

    sectionLines = [];
    currentSection = undefined;
  };

  for (const line of lines) {
    const featureMatch = line.match(FEATURE_HEADING_PATTERN);
    if (featureMatch != null) {
      flushSection();
      currentFeature = featureMatch[1].toLowerCase();
      currentSection = 'purpose';
      sectionLines = [];
      continue;
    }

    const subsectionMatch = line.match(SUBSECTION_HEADING_PATTERN);
    if (subsectionMatch != null && currentFeature != null) {
      flushSection();
      currentSection = subsectionKey(subsectionMatch[1]);
      sectionLines = [];
      continue;
    }

    if (currentFeature != null && currentSection != null) {
      sectionLines.push(line);
    }
  }

  flushSection();

  return [...overrides.values()];
}

export function mergeWorkflowEditorialOverride(
  generated: BuildCoreFeatureWorkflowKnowledge,
  editorial: BuildCoreWorkflowEditorialOverride | undefined,
): BuildCoreFeatureWorkflowKnowledge {
  if (editorial == null) {
    return generated;
  }

  const hasEditorialLists =
    (editorial.primaryWorkflow?.length ?? 0) > 0 ||
    (editorial.alternateWorkflows?.length ?? 0) > 0 ||
    (editorial.prerequisites?.length ?? 0) > 0 ||
    (editorial.userTips?.length ?? 0) > 0 ||
    (editorial.commonMistakes?.length ?? 0) > 0;

  return {
    feature: generated.feature,
    purpose: editorial.purpose ?? generated.purpose,
    primaryWorkflow:
      editorial.primaryWorkflow != null && editorial.primaryWorkflow.length > 0
        ? editorial.primaryWorkflow
        : generated.primaryWorkflow,
    alternateWorkflows:
      editorial.alternateWorkflows != null && editorial.alternateWorkflows.length > 0
        ? editorial.alternateWorkflows
        : generated.alternateWorkflows,
    prerequisites:
      editorial.prerequisites != null && editorial.prerequisites.length > 0
        ? editorial.prerequisites
        : generated.prerequisites,
    userTips:
      editorial.userTips != null && editorial.userTips.length > 0 ? editorial.userTips : generated.userTips,
    commonMistakes:
      editorial.commonMistakes != null && editorial.commonMistakes.length > 0
        ? editorial.commonMistakes
        : generated.commonMistakes,
    source: hasEditorialLists || editorial.purpose != null ? 'editorial+generated' : generated.source,
  };
}
