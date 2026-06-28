export type BuildCoreNavigationItem = {
  readonly id: string;
  readonly label: string;
  readonly title: string;
  readonly route: string;
};

export type BuildCoreRoutePattern = {
  readonly id: string;
  readonly pattern: string;
  readonly description?: string;
};

export type BuildCoreUiLabel = {
  readonly id: string;
  readonly label: string;
  readonly context?: string;
};

export type BuildCoreFormField = {
  readonly id: string;
  readonly label: string;
};

export type BuildCorePipelineStage = {
  readonly slug: string;
  readonly label: string;
  readonly sortOrder: number;
};

export type BuildCoreFeatureFlag = {
  readonly id: string;
  readonly description: string;
};

export type BuildCoreDocsKnowledge = {
  readonly generatedAt: string;
  readonly sourceRoot: string;
  readonly product: {
    readonly slug: string;
    readonly name: string;
    readonly description: string;
    readonly descriptionShort: string;
    readonly dashboardRoute: string;
  };
  readonly navigation: {
    readonly sidebar: readonly BuildCoreNavigationItem[];
    readonly header: readonly BuildCoreUiLabel[];
  };
  readonly routes: {
    readonly static: readonly BuildCoreRoutePattern[];
    readonly projectDetail: readonly BuildCoreRoutePattern[];
    readonly auth: readonly BuildCoreRoutePattern[];
  };
  readonly pages: readonly { readonly path: string; readonly source: string }[];
  readonly projectsList: {
    readonly panelTitle: string;
    readonly searchPlaceholder: string;
    readonly filterLabels: readonly BuildCoreUiLabel[];
    readonly createProject: {
      readonly modalTitle: string;
      readonly submitButton: string;
      readonly cancelButton: string;
      readonly plusButtonAria: string;
      readonly formFields: readonly BuildCoreFormField[];
    };
  };
  readonly projectDetail: {
    readonly backLabel: string;
    readonly sections: readonly BuildCoreUiLabel[];
    readonly editModalTitle: string;
  };
  readonly subprojects: {
    readonly sectionTitle: string;
    readonly modalTitle: string;
    readonly plusButtonAria: string;
    readonly submitButton: string;
  };
  readonly settingsPages: readonly { readonly id: string; readonly title: string; readonly breadcrumb?: string }[];
  readonly workflow: {
    readonly defaultPipelineStages: readonly BuildCorePipelineStage[];
    readonly workflowSettingsTabs: readonly BuildCoreUiLabel[];
  };
  readonly reports: {
    readonly title: string;
    readonly breadcrumb: string;
  };
  readonly featureFlags: readonly BuildCoreFeatureFlag[];
};

export type DocsProductKnowledgeIndex = {
  readonly buildcore?: BuildCoreDocsKnowledge;
};
