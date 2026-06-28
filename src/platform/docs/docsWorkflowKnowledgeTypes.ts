export type BuildCoreFeatureWorkflowKnowledge = {
  readonly feature: string;
  readonly purpose: string;
  readonly primaryWorkflow: readonly string[];
  readonly alternateWorkflows: readonly string[];
  readonly prerequisites: readonly string[];
  readonly userTips: readonly string[];
  readonly commonMistakes: readonly string[];
  readonly source: 'editorial' | 'generated' | 'editorial+generated';
};

export type BuildCoreFeatureWorkflowKnowledgeIndex = {
  readonly generatedAt: string;
  readonly sourceRoot: string;
  readonly features: readonly BuildCoreFeatureWorkflowKnowledge[];
};
