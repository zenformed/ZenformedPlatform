export type BuildCoreFeatureFlowStep = {
  readonly order: number;
  readonly description: string;
  readonly uiLabels?: readonly string[];
};

export type BuildCoreFeatureFlow = {
  readonly summary: string;
  readonly steps?: readonly BuildCoreFeatureFlowStep[];
};

export type BuildCoreFeatureModal = {
  readonly id: string;
  readonly title: string;
};

export type BuildCoreFeatureButton = {
  readonly id: string;
  readonly label: string;
  readonly context?: string;
};

export type BuildCoreFeatureFormField = {
  readonly id: string;
  readonly label: string;
  readonly validation?: string;
};

export type BuildCoreFeatureRoute = {
  readonly pattern: string;
  readonly description?: string;
};

export type BuildCoreFeatureKnowledge = {
  readonly id: string;
  readonly name: string;
  readonly purpose: string;
  readonly whereItExists: readonly string[];
  readonly navigationPath: readonly string[];
  readonly creationFlow?: BuildCoreFeatureFlow;
  readonly editFlow?: BuildCoreFeatureFlow;
  readonly deleteFlow?: BuildCoreFeatureFlow;
  readonly modals: readonly BuildCoreFeatureModal[];
  readonly buttons: readonly BuildCoreFeatureButton[];
  readonly formFields: readonly BuildCoreFeatureFormField[];
  readonly validation: readonly string[];
  readonly statusValues: readonly string[];
  readonly relationships: readonly string[];
  readonly limitations: readonly string[];
  readonly relatedFeatures: readonly string[];
  readonly routes: readonly BuildCoreFeatureRoute[];
  readonly reactComponents: readonly string[];
  readonly apiEndpoints: readonly string[];
  readonly domainServices: readonly string[];
  readonly databaseTables: readonly string[];
  readonly docCategories: readonly string[];
  readonly keywords: readonly string[];
};

export type BuildCoreFeatureKnowledgeIndex = {
  readonly generatedAt: string;
  readonly sourceRoot: string;
  readonly features: readonly BuildCoreFeatureKnowledge[];
};

export type DocsFeatureLookupInput = {
  readonly product: string;
  readonly category: string;
  readonly title: string;
  readonly summary?: string;
  readonly tags?: readonly string[];
};

export type DocsFeatureLookupResult = {
  readonly feature: BuildCoreFeatureKnowledge;
  readonly score: number;
  readonly matchReasons: readonly string[];
};
