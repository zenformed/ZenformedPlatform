import type { BuildCoreDocsKnowledge } from '@/platform/docs/docsProductKnowledgeTypes';
import type { BuildCoreFeatureKnowledge } from '@/platform/docs/docsFeatureKnowledgeTypes';
import type { BuildCoreFeatureImplementationKnowledge } from '@/platform/docs/docsImplementationKnowledgeTypes';
import { collectImplementationUiVocabulary } from '@/platform/docs/docsImplementationKnowledgeTypes';

const GENERIC_DOC_TERMS = [
  'BuildCore',
  'Zenformed',
  'Note',
  'Tip',
  'Warning',
  'Important',
  'Projects',
  'Workflow tasks',
  'Payments',
  'Documents',
  'Budget',
  'Reports',
  'Teams',
] as const;

function collectGlobalUiVocabulary(global: BuildCoreDocsKnowledge): string[] {
  const values: string[] = [];

  for (const item of global.navigation.sidebar) {
    values.push(item.label, item.title);
  }
  for (const item of global.navigation.header) {
    values.push(item.label);
  }
  for (const field of global.projectsList.createProject.formFields) {
    values.push(field.label);
  }
  values.push(
    global.projectsList.createProject.modalTitle,
    global.projectsList.createProject.submitButton,
    global.projectsList.createProject.cancelButton,
    global.projectsList.createProject.plusButtonAria,
    global.projectDetail.editModalTitle,
    global.projectDetail.backLabel,
  );
  for (const section of global.projectDetail.sections) {
    values.push(section.label);
  }

  return values;
}

function collectFeatureUiVocabulary(feature: BuildCoreFeatureKnowledge): string[] {
  return [
    ...feature.buttons.map((button) => button.label),
    ...feature.modals.map((modal) => modal.title),
    ...feature.formFields.map((field) => field.label),
    ...feature.statusValues,
    ...feature.validation,
    ...(feature.creationFlow?.steps?.flatMap((step) => step.uiLabels ?? []) ?? []),
    ...(feature.editFlow?.steps?.flatMap((step) => step.uiLabels ?? []) ?? []),
    ...(feature.deleteFlow?.steps?.flatMap((step) => step.uiLabels ?? []) ?? []),
  ];
}

export function buildDocsAuthoringUiVocabulary(options: {
  readonly globalProductContext: BuildCoreDocsKnowledge;
  readonly featureKnowledge?: BuildCoreFeatureKnowledge;
  readonly implementationKnowledge?: BuildCoreFeatureImplementationKnowledge;
}): readonly string[] {
  const vocabulary = new Set<string>(GENERIC_DOC_TERMS);

  for (const value of collectGlobalUiVocabulary(options.globalProductContext)) {
    const trimmed = value.trim();
    if (trimmed.length >= 2) {
      vocabulary.add(trimmed);
    }
  }

  if (options.featureKnowledge != null) {
    for (const value of collectFeatureUiVocabulary(options.featureKnowledge)) {
      const trimmed = value.trim();
      if (trimmed.length >= 2) {
        vocabulary.add(trimmed);
      }
    }
  }

  if (options.implementationKnowledge != null) {
    for (const value of collectImplementationUiVocabulary(options.implementationKnowledge)) {
      vocabulary.add(value);
    }
  }

  return [...vocabulary].sort((left, right) => left.localeCompare(right));
}
