export type BuildCoreApiOperation = {
  readonly route: string;
  readonly method: string;
  readonly description?: string;
};

export type BuildCoreContentPathRef = {
  readonly path: string;
  readonly value: string;
  readonly sourceFile?: string;
};

export type BuildCoreImplementationWorkflowStep = {
  readonly order: number;
  readonly description: string;
  readonly uiLabels?: readonly string[];
};

export type BuildCoreFeatureImplementationKnowledge = {
  readonly featureId: string;
  readonly componentFiles: readonly string[];
  readonly domainFiles: readonly string[];
  readonly apiRoutes: readonly BuildCoreApiOperation[];
  readonly buttons: readonly string[];
  readonly modalTitles: readonly string[];
  readonly fieldLabels: readonly string[];
  readonly columnLabels: readonly string[];
  readonly menuItems: readonly string[];
  readonly emptyStates: readonly string[];
  readonly confirmationDialogs: readonly string[];
  readonly statusValues: readonly string[];
  readonly validation: readonly string[];
  readonly permissions: readonly string[];
  readonly workflow: readonly BuildCoreImplementationWorkflowStep[];
  readonly apiOperations: readonly BuildCoreApiOperation[];
  readonly relatedComponents: readonly string[];
  readonly contentPathRefs: readonly BuildCoreContentPathRef[];
  readonly snippets: readonly { readonly file: string; readonly label: string; readonly code: string }[];
};

export type BuildCoreImplementationKnowledgeIndex = {
  readonly generatedAt: string;
  readonly sourceRoot: string;
  readonly features: readonly BuildCoreFeatureImplementationKnowledge[];
};

export function collectImplementationUiVocabulary(
  implementation: BuildCoreFeatureImplementationKnowledge,
): readonly string[] {
  const values = new Set<string>();

  for (const group of [
    implementation.buttons,
    implementation.modalTitles,
    implementation.fieldLabels,
    implementation.columnLabels,
    implementation.menuItems,
    implementation.emptyStates,
    implementation.confirmationDialogs,
    implementation.statusValues,
    implementation.validation,
    implementation.permissions,
    implementation.contentPathRefs.map((ref) => ref.value),
    implementation.workflow.flatMap((step) => step.uiLabels ?? []),
  ]) {
    for (const value of group) {
      const trimmed = value.trim();
      if (trimmed.length >= 2 && trimmed.length <= 120) {
        values.add(trimmed);
      }
    }
  }

  return [...values].sort((left, right) => left.localeCompare(right));
}
