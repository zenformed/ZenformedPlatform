import path from 'node:path';
import type { BuildCoreDocsKnowledge } from '../../src/platform/docs/docsProductKnowledgeTypes';
import type {
  BuildCoreFeatureButton,
  BuildCoreFeatureFlow,
  BuildCoreFeatureFormField,
  BuildCoreFeatureKnowledge,
  BuildCoreFeatureKnowledgeIndex,
  BuildCoreFeatureModal,
} from '../../src/platform/docs/docsFeatureKnowledgeTypes';
import {
  buildFlowSteps,
  collectLimitationStrings,
  extractBlock,
  extractConstArray,
  extractConstRecordLabels,
  extractFieldsBlock,
  extractQuoted,
  extractStringLiterals,
  extractSupabaseTablesFromFiles,
  filterApiRoutes,
  listApiRoutes,
  listComponentFiles,
  listDomainServiceFiles,
  mapFieldsRecord,
  readUtf8,
} from './buildcoreSourceUtils';

type FeatureBuildContext = {
  readonly buildCoreRoot: string;
  readonly contentSource: string;
  readonly globalKnowledge: BuildCoreDocsKnowledge;
  readonly apiRoutes: readonly string[];
};

function contentBlock(ctx: FeatureBuildContext, ...segments: string[]): string {
  let current = ctx.contentSource;
  for (const segment of segments) {
    const next = extractBlock(current, segment);
    if (next == null) {
      return '';
    }
    current = next;
  }
  return current;
}

function buttonsFromLabels(labels: Record<string, string | undefined>, context?: string): BuildCoreFeatureButton[] {
  return Object.entries(labels)
    .filter((entry): entry is [string, string] => entry[1] != null && entry[1].trim() !== '')
    .map(([id, label]) => ({ id, label, context }));
}

function modalsFromTitles(titles: Record<string, string | undefined>): BuildCoreFeatureModal[] {
  return Object.entries(titles)
    .filter((entry): entry is [string, string] => entry[1] != null && entry[1].trim() !== '')
    .map(([id, title]) => ({ id, title }));
}

function formFieldsFromRecord(record: Record<string, string>, validationNotes: readonly string[] = []): BuildCoreFeatureFormField[] {
  return mapFieldsRecord(record).map((field) => ({
    ...field,
    validation: validationNotes.find((note) => note.toLowerCase().includes(field.id)) ?? undefined,
  }));
}

function buildProjectsFeature(ctx: FeatureBuildContext): BuildCoreFeatureKnowledge {
  const crmBlock = contentBlock(ctx, 'crm');
  const createBlock = extractBlock(crmBlock, 'create') ?? '';
  const editBlock = contentBlock(ctx, 'projectDetail', 'edit');
  const deleteBlock = extractBlock(crmBlock, 'delete') ?? '';
  const subprojectsBlock = contentBlock(ctx, 'projectDetail', 'subprojects');
  const projectDetailBlock = contentBlock(ctx, 'projectDetail');
  const createFields = extractFieldsBlock(crmBlock, 'create');
  const editFields = extractFieldsBlock(projectDetailBlock, 'edit');

  const serviceFiles = listDomainServiceFiles(ctx.buildCoreRoot, [
    /^crmCreateService\.ts$/,
    /^crmUpdateProjectService\.ts$/,
    /^crmReadService\.ts$/,
    /^crmArchiveProjectService\.ts$/,
    /^crmMarkProjects(In)?activeService\.ts$/,
  ]);

  const apiEndpoints = filterApiRoutes(ctx.apiRoutes, [
    /^\/api\/crm\/projects$/,
    /^\/api\/crm\/projects\/\[slug\]$/,
    /^\/api\/crm\/projects\/mark-/,
    /^\/api\/crm\/projects\/bulk-/,
    /^\/api\/crm\/projects\/\[slug\]\/subprojects$/,
  ]);

  const validationPath = path.join(ctx.buildCoreRoot, 'src/domain/crm/projectFormFieldValidation.ts');
  const validationSource = readUtf8(validationPath);
  const validation = [
    'Notes (Max 200) — max 200 characters (MAX_PROJECT_NOTES_LENGTH)',
    ...validationSource.match(/message: '([^']+)'/g)?.map((match) => match.replace(/^message: '/, '').replace(/'$/, '')) ?? [],
  ];

  const creationFlow: BuildCoreFeatureFlow = {
    summary: 'Create a parent project from the Projects list using the header plus (+) button.',
    steps: buildFlowSteps([
      {
        order: 1,
        description: 'Open the Projects view.',
        uiLabels: [ctx.globalKnowledge.projectsList.panelTitle],
      },
      {
        order: 2,
        description: 'Select the plus (+) button in the header.',
        uiLabels: [ctx.globalKnowledge.projectsList.createProject.plusButtonAria],
      },
      {
        order: 3,
        description: 'Complete the New project modal and submit.',
        uiLabels: [
          ctx.globalKnowledge.projectsList.createProject.modalTitle,
          ctx.globalKnowledge.projectsList.createProject.submitButton,
        ],
      },
    ]),
  };

  const editFlow: BuildCoreFeatureFlow = {
    summary: 'Edit an existing project from project detail.',
    steps: buildFlowSteps([
      {
        order: 1,
        description: 'Open a project from the Projects list.',
      },
      {
        order: 2,
        description: 'Open the Edit project drawer/modal and save changes.',
        uiLabels: [extractQuoted(editBlock, 'title') ?? 'Edit project', extractQuoted(editBlock, 'submit') ?? 'Save changes'],
      },
    ]),
  };

  const deleteFlow: BuildCoreFeatureFlow = {
    summary: 'Delete a project from the Projects list actions menu with confirmation.',
    steps: buildFlowSteps([
      {
        order: 1,
        description: 'Open the project row actions menu on the Projects list.',
      },
      {
        order: 2,
        description: 'Choose Delete project and confirm in the destructive confirmation workflow.',
        uiLabels: [
          extractQuoted(deleteBlock, 'action') ?? 'Delete project',
          extractQuoted(extractBlock(deleteBlock, 'workflow') ?? '', 'finalActionLabel') ?? 'Delete Project',
        ],
      },
    ]),
  };

  return {
    id: 'projects',
    name: 'Projects',
    purpose: 'Manage construction CRM projects and subprojects from the Projects list and project detail pages.',
    whereItExists: ['Projects sidebar (/dashboard)', 'Project detail (/projects/{slug})', 'Subproject detail (/projects/{parentSlug}/{subSlug})'],
    navigationPath: ['Sidebar → Projects', 'Header → plus (+) button → New project modal'],
    creationFlow,
    editFlow,
    deleteFlow,
    modals: modalsFromTitles({
      createProject: extractQuoted(createBlock, 'title'),
      editProject: extractQuoted(editBlock, 'title'),
      newSubproject: extractQuoted(subprojectsBlock, 'newSubprojectTitle'),
      deleteProject: extractQuoted(extractBlock(deleteBlock, 'workflow') ?? '', 'title'),
    }),
    buttons: buttonsFromLabels({
      newProject: ctx.globalKnowledge.projectsList.createProject.plusButtonAria,
      createProject: extractQuoted(createBlock, 'submit'),
      saveProject: extractQuoted(createBlock, 'saveProject'),
      editProject: extractQuoted(editBlock, 'submit'),
      deleteProject: extractQuoted(deleteBlock, 'action'),
      newSubproject: extractQuoted(subprojectsBlock, 'newSubprojectAriaLabel'),
    }),
    formFields: formFieldsFromRecord({ ...createFields, ...editFields }, validation),
    validation,
    statusValues: ['active', 'inactive', 'complete', 'priority'],
    relationships: ['Subprojects belong to parent projects', 'Projects link to contacts/clients', 'Projects contain workflow tasks, payments, budget entries, and documents'],
    limitations: collectLimitationStrings(`${createBlock}\n${deleteBlock}`),
    relatedFeatures: ['workflow-tasks', 'payments', 'budget', 'documents', 'customers'],
    routes: ctx.globalKnowledge.routes.projectDetail,
    reactComponents: listComponentFiles(ctx.buildCoreRoot, ['CrmProjects', 'CrmProjectDetail']),
    apiEndpoints,
    domainServices: serviceFiles,
    databaseTables: extractSupabaseTablesFromFiles(ctx.buildCoreRoot, serviceFiles),
    docCategories: ['getting-started', 'projects'],
    keywords: ['project', 'subproject', 'parent', 'create project', 'edit project', 'delete project', 'pipeline', 'search', 'filter'],
  };
}

function buildWorkflowTasksFeature(ctx: FeatureBuildContext): BuildCoreFeatureKnowledge {
  const workflowBlock = contentBlock(ctx, 'projectDetail', 'workflow');
  const workflowFields = extractFieldsBlock(workflowBlock, 'fields');
  const workflowStatusesPath = path.join(ctx.buildCoreRoot, 'src/domain/crm/workflowTaskStatuses.ts');
  const workflowStatusesSource = readUtf8(workflowStatusesPath);
  const statusSlugs = extractConstArray(workflowStatusesSource, 'WORKFLOW_TASK_STATUSES');
  const statusLabels = extractConstRecordLabels(workflowStatusesSource, 'WORKFLOW_TASK_STATUS_LABELS');

  const serviceFiles = listDomainServiceFiles(ctx.buildCoreRoot, [/^crmWorkflowTaskService\.ts$/, /^crmProjectStageCompletionService\.ts$/]);
  const apiEndpoints = filterApiRoutes(ctx.apiRoutes, [
    /^\/api\/crm\/projects\/\[slug\]\/tasks/,
    /^\/api\/crm\/tasks/,
    /^\/api\/crm\/projects\/\[slug\]\/stages/,
    /^\/api\/crm\/projects\/workflow-/,
  ]);

  return {
    id: 'workflow-tasks',
    name: 'Workflow Tasks',
    purpose: 'Track and complete workflow tasks grouped by pipeline stage on a project.',
    whereItExists: ['Project detail → Workflow tasks section', 'Dedicated route /projects/{slug}/tasks'],
    navigationPath: ['Open project → Workflow tasks section or /projects/{slug}/tasks'],
    creationFlow: {
      summary: 'Add a workflow task to a project stage from the Workflow tasks section.',
      steps: buildFlowSteps([
        { order: 1, description: 'Open Workflow tasks on a project.', uiLabels: [extractQuoted(workflowBlock, 'viewAll') ?? 'View all Workflow Tasks'] },
        { order: 2, description: 'Choose Add task, pick a pipeline stage, and save.', uiLabels: [extractQuoted(workflowBlock, 'addTask') ?? 'Add task', extractQuoted(workflowBlock, 'taskSubmit') ?? 'Save task'] },
      ]),
    },
    editFlow: {
      summary: 'Edit an existing workflow task from the task row actions or drawer.',
      steps: buildFlowSteps([
        { order: 1, description: 'Open task actions and choose Edit task.', uiLabels: [extractQuoted(workflowBlock, 'editTask') ?? 'Edit task'] },
        { order: 2, description: 'Update fields and save.', uiLabels: [extractQuoted(workflowBlock, 'taskDrawerEdit') ?? 'Edit workflow task', extractQuoted(workflowBlock, 'taskSubmit') ?? 'Save task'] },
      ]),
    },
    deleteFlow: {
      summary: 'Delete (archive) a workflow task with confirmation.',
      steps: buildFlowSteps([
        { order: 1, description: 'Open task actions and choose Delete task.', uiLabels: [extractQuoted(workflowBlock, 'deleteTask') ?? 'Delete task'] },
        { order: 2, description: 'Confirm deletion.', uiLabels: [extractQuoted(workflowBlock, 'archiveTaskConfirmTitle') ?? 'Delete task?'] },
      ]),
    },
    modals: modalsFromTitles({
      createTask: extractQuoted(workflowBlock, 'taskDrawerCreate'),
      editTask: extractQuoted(workflowBlock, 'taskDrawerEdit'),
      deleteTask: extractQuoted(workflowBlock, 'archiveTaskConfirmTitle'),
      notifyAssigned: extractQuoted(extractBlock(workflowBlock, 'assignedNotify') ?? '', 'title'),
      notifyCustomer: extractQuoted(extractBlock(workflowBlock, 'customerNotify') ?? '', 'title'),
    }),
    buttons: buttonsFromLabels({
      addTask: extractQuoted(workflowBlock, 'addTask'),
      saveTask: extractQuoted(workflowBlock, 'taskSubmit'),
      editTask: extractQuoted(workflowBlock, 'editTask'),
      deleteTask: extractQuoted(workflowBlock, 'deleteTask'),
      markStageComplete: extractQuoted(workflowBlock, 'markStageComplete'),
      notifyAssigned: extractQuoted(workflowBlock, 'notifyAssigned'),
    }),
    formFields: formFieldsFromRecord(workflowFields),
    validation: [],
    statusValues: statusLabels.map((entry) => `${entry.id} (${entry.label})`),
    relationships: ['Tasks belong to projects and pipeline stages', 'Tasks may require documents', 'Payment milestone tasks link to payments feature'],
    limitations: collectLimitationStrings(workflowBlock),
    relatedFeatures: ['projects', 'workflow-settings', 'documents', 'payments', 'permissions'],
    routes: [{ pattern: '/projects/{slug}/tasks', description: 'Workflow tasks page' }],
    reactComponents: listComponentFiles(ctx.buildCoreRoot, ['CrmProjectDetail']).filter((file) => /Workflow/i.test(file)),
    apiEndpoints,
    domainServices: serviceFiles,
    databaseTables: extractSupabaseTablesFromFiles(ctx.buildCoreRoot, serviceFiles),
    docCategories: ['workflow'],
    keywords: ['workflow task', 'task', 'stage', 'pipeline', 'assign', 'complete', 'mark complete', 'customer task'],
  };
}

function buildPaymentsFeature(ctx: FeatureBuildContext): BuildCoreFeatureKnowledge {
  const paymentsBlock = contentBlock(ctx, 'projectDetail', 'payments');
  const workflowBlock = contentBlock(ctx, 'projectDetail', 'workflow');
  const serviceFiles = listDomainServiceFiles(ctx.buildCoreRoot, [/Payment/i, /Milestone/i, /crmReadService\.ts$/]);
  const apiEndpoints = filterApiRoutes(ctx.apiRoutes, [/payment/i, /milestone/i, /financials/i]);

  return {
    id: 'payments',
    name: 'Payments',
    purpose: 'Track payment milestones and collected amounts on project financials.',
    whereItExists: ['Project detail → Payments section', 'Route /projects/{slug}/financials'],
    navigationPath: ['Open project → Payments section'],
    creationFlow: {
      summary: 'Add a payment milestone from the Payments section.',
      steps: buildFlowSteps([
        { order: 1, description: 'Open Payments on a project.', uiLabels: [extractQuoted(paymentsBlock, 'title') ?? 'Payments'] },
        { order: 2, description: 'Choose Add payment milestone and save.', uiLabels: [extractQuoted(paymentsBlock, 'addMilestone') ?? 'Add payment milestone', extractQuoted(paymentsBlock, 'saveMilestone') ?? 'Save payment milestone'] },
      ]),
    },
    editFlow: {
      summary: 'Edit an existing payment milestone.',
      steps: buildFlowSteps([
        { order: 1, description: 'Open milestone drawer and save changes.', uiLabels: [extractQuoted(paymentsBlock, 'milestoneDrawerEdit') ?? 'Edit payment milestone'] },
      ]),
    },
    deleteFlow: undefined,
    modals: modalsFromTitles({
      createMilestone: extractQuoted(paymentsBlock, 'milestoneDrawerCreate'),
      editMilestone: extractQuoted(paymentsBlock, 'milestoneDrawerEdit'),
    }),
    buttons: buttonsFromLabels({
      addMilestone: extractQuoted(paymentsBlock, 'addMilestone'),
      saveMilestone: extractQuoted(paymentsBlock, 'saveMilestone'),
      paymentMilestoneTask: extractQuoted(workflowBlock, 'taskKindPayment'),
    }),
    formFields: [
      { id: 'invoiced', label: extractQuoted(extractBlock(paymentsBlock, 'columns') ?? '', 'invoiced') ?? 'Invoiced' },
      { id: 'paid', label: extractQuoted(extractBlock(paymentsBlock, 'columns') ?? '', 'paid') ?? 'Paid' },
      { id: 'amountUsd', label: extractFieldsBlock(workflowBlock, 'fields').amountUsd ?? 'Amount (USD)' },
    ],
    validation: [],
    statusValues: ['invoiced', 'paid'],
    relationships: ['Payment milestones appear in Payments section and may exist as payment-type workflow tasks', 'Project Value / Collected / Balance shown on project detail'],
    limitations: collectLimitationStrings(paymentsBlock),
    relatedFeatures: ['projects', 'workflow-tasks', 'budget', 'reports'],
    routes: [{ pattern: '/projects/{slug}/financials', description: 'Project financials / payments' }],
    reactComponents: listComponentFiles(ctx.buildCoreRoot, ['CrmProjectDetail']).filter((file) => /Payment|Milestone|Financial/i.test(file)),
    apiEndpoints,
    domainServices: serviceFiles,
    databaseTables: extractSupabaseTablesFromFiles(ctx.buildCoreRoot, serviceFiles),
    docCategories: ['payments'],
    keywords: ['payment', 'milestone', 'financial', 'revenue', 'collected', 'balance', 'invoiced'],
  };
}

function buildBudgetFeature(ctx: FeatureBuildContext): BuildCoreFeatureKnowledge {
  const budgetBlock = contentBlock(ctx, 'projectDetail', 'budget');
  const categoryLabels = extractFieldsBlock(budgetBlock, 'categoryLabels');
  const serviceFiles = listDomainServiceFiles(ctx.buildCoreRoot, [/^crmBudgetService\.ts$/, /^crmBudgetEntryDocumentService\.ts$/]);
  const apiEndpoints = filterApiRoutes(ctx.apiRoutes, [/budget/i]);

  return {
    id: 'budget',
    name: 'Budget',
    purpose: 'Add and track budget line items and costs on a project.',
    whereItExists: ['Project detail → Budget section', 'Route /projects/{slug}/budget'],
    navigationPath: ['Open project → Budget section'],
    creationFlow: {
      summary: 'Add a budget item from the Budget table.',
      steps: buildFlowSteps([
        { order: 1, description: 'Open Budget on a project.', uiLabels: [extractQuoted(budgetBlock, 'tableTitle') ?? 'Budget'] },
        { order: 2, description: 'Choose Add budget item, enter details, and save.', uiLabels: [extractQuoted(budgetBlock, 'addItem') ?? 'Add budget item', extractQuoted(budgetBlock, 'saveItem') ?? 'Save budget item'] },
      ]),
    },
    editFlow: {
      summary: 'Edit budget items inline in the Budget table.',
      steps: buildFlowSteps([{ order: 1, description: 'Update budget item fields and save.', uiLabels: [extractQuoted(budgetBlock, 'saveItem') ?? 'Save budget item'] }]),
    },
    deleteFlow: {
      summary: 'Delete a budget item with confirmation.',
      steps: buildFlowSteps([
        { order: 1, description: 'Choose Delete budget item and confirm.', uiLabels: [extractQuoted(budgetBlock, 'deleteItem') ?? 'Delete budget item', extractQuoted(budgetBlock, 'deleteItemConfirmTitle') ?? 'Delete budget item?'] },
      ]),
    },
    modals: modalsFromTitles({ deleteItem: extractQuoted(budgetBlock, 'deleteItemConfirmTitle') }),
    buttons: buttonsFromLabels({
      addItem: extractQuoted(budgetBlock, 'addItem'),
      saveItem: extractQuoted(budgetBlock, 'saveItem'),
      deleteItem: extractQuoted(budgetBlock, 'deleteItem'),
      generatePl: extractQuoted(extractBlock(budgetBlock, 'pl') ?? '', 'generatePl'),
    }),
    formFields: [
      { id: 'itemName', label: extractQuoted(budgetBlock, 'itemNamePlaceholder') ?? 'Item name', validation: extractQuoted(budgetBlock, 'itemNameRequired') ?? 'Item name is required.' },
      { id: 'category', label: extractQuoted(extractBlock(budgetBlock, 'columns') ?? '', 'category') ?? 'Category' },
      { id: 'costDate', label: extractQuoted(extractBlock(budgetBlock, 'columns') ?? '', 'costDate') ?? 'Cost Date', validation: extractQuoted(budgetBlock, 'costDateRequired') ?? 'Cost Date is required.' },
      ...mapFieldsRecord(categoryLabels).map((field) => ({ ...field, validation: undefined })),
    ],
    validation: [extractQuoted(budgetBlock, 'itemNameRequired') ?? 'Item name is required.', extractQuoted(budgetBlock, 'costDateRequired') ?? 'Cost Date is required.'].filter(Boolean),
    statusValues: mapFieldsRecord(categoryLabels).map((field) => field.id),
    relationships: ['Budget entries belong to projects', 'Budget entries may require documents'],
    limitations: collectLimitationStrings(budgetBlock),
    relatedFeatures: ['projects', 'documents', 'payments', 'reports'],
    routes: [{ pattern: '/projects/{slug}/budget', description: 'Project budget' }],
    reactComponents: listComponentFiles(ctx.buildCoreRoot, ['CrmProjectDetail']).filter((file) => /Budget/i.test(file)),
    apiEndpoints,
    domainServices: serviceFiles,
    databaseTables: extractSupabaseTablesFromFiles(ctx.buildCoreRoot, serviceFiles),
    docCategories: ['budget'],
    keywords: ['budget', 'cost', 'estimate', 'category', 'p&l', 'profit'],
  };
}

function buildDocumentsFeature(ctx: FeatureBuildContext): BuildCoreFeatureKnowledge {
  const documentsBlock = contentBlock(ctx, 'projectDetail', 'documents');
  const workflowBlock = contentBlock(ctx, 'projectDetail', 'workflow');
  const serviceFiles = listDomainServiceFiles(ctx.buildCoreRoot, [/^crmDocumentService\.ts$/, /Document/i]);
  const apiEndpoints = filterApiRoutes(ctx.apiRoutes, [/documents/i, /direct-uploads/i, /media/i]);

  return {
    id: 'documents',
    name: 'Documents',
    purpose: 'Upload and review project documents, including task-required and budget-required files.',
    whereItExists: ['Project detail → Documents section', 'Route /projects/{slug}/documents', 'Workflow task document uploads'],
    navigationPath: ['Open project → Documents section'],
    creationFlow: {
      summary: 'Upload documents to a project from the Documents section or attach files to workflow tasks when permitted.',
      steps: buildFlowSteps([
        { order: 1, description: 'Open Documents on a project.', uiLabels: [extractQuoted(documentsBlock, 'viewAll') ?? 'View all documents'] },
        { order: 2, description: 'Upload files using the project documents upload control.', uiLabels: [extractQuoted(workflowBlock, 'documentsUpload') ?? 'Upload'] },
      ]),
    },
    editFlow: undefined,
    deleteFlow: {
      summary: 'Delete a document from a task or project when permitted.',
      steps: buildFlowSteps([{ order: 1, description: 'Use document delete action.', uiLabels: [extractQuoted(workflowBlock, 'documentDelete') ?? 'Delete'] }]),
    },
    modals: modalsFromTitles({
      uploadConfirm: extractQuoted(workflowBlock, 'documentUploadConfirmTitle'),
    }),
    buttons: buttonsFromLabels({
      upload: extractQuoted(workflowBlock, 'documentsUpload'),
      download: extractQuoted(workflowBlock, 'documentDownload'),
      delete: extractQuoted(workflowBlock, 'documentDelete'),
      reviewFiles: extractQuoted(workflowBlock, 'documentsReview'),
    }),
    formFields: [],
    validation: [],
    statusValues: [
      extractQuoted(documentsBlock, 'statusReviewed') ?? 'Reviewed',
      extractQuoted(documentsBlock, 'statusPending') ?? 'Pending review',
      extractQuoted(extractBlock(documentsBlock, 'filters') ?? '', 'uploaded') ?? 'Uploaded',
      extractQuoted(extractBlock(documentsBlock, 'filters') ?? '', 'missing') ?? 'Missing',
    ],
    relationships: ['Documents belong to projects', 'Documents may be required by workflow tasks or budget entries'],
    limitations: collectLimitationStrings(`${documentsBlock}\n${workflowBlock}`),
    relatedFeatures: ['projects', 'workflow-tasks', 'budget'],
    routes: [{ pattern: '/projects/{slug}/documents', description: 'Project documents' }],
    reactComponents: listComponentFiles(ctx.buildCoreRoot, ['CrmProjectDetail']).filter((file) => /Document/i.test(file)),
    apiEndpoints,
    domainServices: serviceFiles,
    databaseTables: extractSupabaseTablesFromFiles(ctx.buildCoreRoot, serviceFiles),
    docCategories: ['documents'],
    keywords: ['document', 'upload', 'file', 'attachment', 'review', 'missing'],
  };
}

function buildCustomersFeature(ctx: FeatureBuildContext): BuildCoreFeatureKnowledge {
  const createFields = extractFieldsBlock(contentBlock(ctx, 'crm'), 'create');
  const editFields = extractFieldsBlock(contentBlock(ctx, 'projectDetail', 'edit'), 'edit');
  const leadCaptureBlock = contentBlock(ctx, 'leadCapture');
  const serviceFiles = listDomainServiceFiles(ctx.buildCoreRoot, [/leadCapture/i, /^crmCreateService\.ts$/, /^crmUpdateProjectService\.ts$/]);
  const apiEndpoints = filterApiRoutes(ctx.apiRoutes, [/^\/api\/lead\//]);

  return {
    id: 'customers',
    name: 'Customers',
    purpose: 'Store customer and contact details on projects; lead capture collects contact data into projects.',
    whereItExists: ['Project create/edit forms (contact fields)', 'Lead capture public form (/api/lead/{token})'],
    navigationPath: ['Project create/edit → contact fields', 'Lead capture link (when configured)'],
    creationFlow: {
      summary: 'Customer/contact data is captured during project create or lead capture submission.',
      steps: buildFlowSteps([
        { order: 1, description: 'Enter contact fields on New project or lead capture form.', uiLabels: Object.values(createFields).slice(0, 4) },
      ]),
    },
    editFlow: {
      summary: 'Update contact details from Edit project.',
      steps: buildFlowSteps([{ order: 1, description: 'Edit project contact fields and save.', uiLabels: [extractQuoted(contentBlock(ctx, 'projectDetail', 'edit'), 'submit') ?? 'Save changes'] }]),
    },
    deleteFlow: undefined,
    modals: modalsFromTitles({ leadCapture: extractQuoted(leadCaptureBlock, 'title') }),
    buttons: [],
    formFields: formFieldsFromRecord({ ...createFields, ...editFields }),
    validation: [],
    statusValues: [],
    relationships: ['Contacts/clients link to projects', 'Lead capture creates or updates CRM contacts/projects'],
    limitations: collectLimitationStrings(leadCaptureBlock),
    relatedFeatures: ['projects', 'workflow-tasks'],
    routes: [{ pattern: '/api/lead/{token}', description: 'Lead capture API' }],
    reactComponents: listComponentFiles(ctx.buildCoreRoot, ['leadCapture', 'CrmProjects']),
    apiEndpoints,
    domainServices: serviceFiles,
    databaseTables: extractSupabaseTablesFromFiles(ctx.buildCoreRoot, serviceFiles),
    docCategories: ['customers', 'projects', 'getting-started'],
    keywords: ['customer', 'contact', 'lead', 'email', 'phone', 'client'],
  };
}

function buildWorkflowSettingsFeature(ctx: FeatureBuildContext): BuildCoreFeatureKnowledge {
  const workflowSettingsBlock = contentBlock(ctx, 'workflowSettings');
  const workflowStagesBlock = contentBlock(ctx, 'workflowStages');
  const serviceFiles = listDomainServiceFiles(ctx.buildCoreRoot, [/pipelineStage/i, /OrganizationSettings/i, /customer-task-reminders/i]);
  const apiEndpoints = filterApiRoutes(ctx.apiRoutes, [/pipeline-stages/i, /customer-task-reminders/i, /workflow-settings/i]);

  return {
    id: 'workflow-settings',
    name: 'Workflow Settings',
    purpose: 'Configure organization pipeline stages and customer task alerts.',
    whereItExists: ['Sidebar → Workflow Settings (/workflow-settings)', 'Workflow Stages organization page'],
    navigationPath: ['Sidebar → Workflow Settings', 'Tabs → Workflow Stages | Customer Task Alerts'],
    creationFlow: undefined,
    editFlow: {
      summary: 'Customize workflow stages and customer task reminder settings at the organization level.',
      steps: buildFlowSteps([
        { order: 1, description: 'Open Workflow Settings from the sidebar.' },
        { order: 2, description: 'Use Workflow Stages or Customer Task Alerts tabs.', uiLabels: ctx.globalKnowledge.workflow.workflowSettingsTabs.map((tab) => tab.label) },
      ]),
    },
    deleteFlow: undefined,
    modals: [],
    buttons: buttonsFromLabels({
      workflowStagesTab: extractQuoted(extractBlock(workflowSettingsBlock, 'folderTabs') ?? '', 'workflowStages'),
      alertsTab: extractQuoted(extractBlock(workflowSettingsBlock, 'folderTabs') ?? '', 'alerts'),
    }),
    formFields: [],
    validation: [],
    statusValues: ctx.globalKnowledge.workflow.defaultPipelineStages.map((stage) => `${stage.slug} (${stage.label})`),
    relationships: ['Pipeline stages drive project stage and workflow task grouping', 'Customer task alerts relate to workflow tasks'],
    limitations: collectLimitationStrings(`${workflowSettingsBlock}\n${workflowStagesBlock}`),
    relatedFeatures: ['workflow-tasks', 'permissions'],
    routes: [
      { pattern: '/workflow-settings', description: 'Workflow settings' },
      { pattern: '/workflow-stages', description: 'Workflow stages page' },
    ],
    reactComponents: listComponentFiles(ctx.buildCoreRoot, ['BuildCoreWorkflowStages']),
    apiEndpoints,
    domainServices: serviceFiles,
    databaseTables: extractSupabaseTablesFromFiles(ctx.buildCoreRoot, serviceFiles),
    docCategories: ['workflow', 'settings'],
    keywords: ['workflow settings', 'pipeline stage', 'customer task alert', 'stage', 'organization'],
  };
}

function buildReportsFeature(ctx: FeatureBuildContext): BuildCoreFeatureKnowledge {
  const reportsBlock = contentBlock(ctx, 'reports');
  const serviceFiles = listDomainServiceFiles(ctx.buildCoreRoot, [/OrganizationExport/i, /crmReadService\.ts$/]);
  const apiEndpoints = filterApiRoutes(ctx.apiRoutes, [/reports/i, /export/i]);

  return {
    id: 'reports',
    name: 'Reports',
    purpose: 'View CRM reports and export organization data.',
    whereItExists: ['Sidebar → Reports (/reports)'],
    navigationPath: ['Sidebar → Reports'],
    creationFlow: undefined,
    editFlow: undefined,
    deleteFlow: undefined,
    modals: [],
    buttons: buttonsFromLabels({
      exportOrganization: extractQuoted(extractBlock(reportsBlock, 'organizationExport') ?? '', 'action') ?? 'Export',
      downloadPdf: extractQuoted(extractBlock(reportsBlock, 'pdfExport') ?? '', 'download') ?? 'Download PDF',
    }),
    formFields: [],
    validation: [],
    statusValues: extractStringLiterals(reportsBlock, 'periods'),
    relationships: ['Reports aggregate project, payment, and activity data'],
    limitations: collectLimitationStrings(reportsBlock),
    relatedFeatures: ['projects', 'payments', 'budget'],
    routes: [{ pattern: '/reports', description: ctx.globalKnowledge.reports.title }],
    reactComponents: listComponentFiles(ctx.buildCoreRoot, ['CrmReports']),
    apiEndpoints,
    domainServices: serviceFiles,
    databaseTables: extractSupabaseTablesFromFiles(ctx.buildCoreRoot, serviceFiles),
    docCategories: ['reports'],
    keywords: ['report', 'export', 'crm', 'analytics', 'pdf'],
  };
}

function buildPermissionsFeature(ctx: FeatureBuildContext): BuildCoreFeatureKnowledge {
  const teamsBlock = contentBlock(ctx, 'teams');
  const serviceFiles = listDomainServiceFiles(ctx.buildCoreRoot, [/Permission/i, /RoleAccess/i, /Visibility/i]);
  const apiEndpoints = filterApiRoutes(ctx.apiRoutes, [/role-permissions/i, /member-visibility/i, /payment-member-visibility/i, /app-access/i]);

  return {
    id: 'permissions',
    name: 'Permissions',
    purpose: 'Control BuildCore role capabilities and member visibility for workflow tasks, payments, and budget.',
    whereItExists: ['Teams → Permissions tabs (Task, Payment, Budget permissions)'],
    navigationPath: ['Sidebar → Teams → Permissions tabs'],
    creationFlow: undefined,
    editFlow: {
      summary: 'Adjust role-based permissions and member visibility toggles on Teams permission tabs.',
      steps: buildFlowSteps([
        { order: 1, description: 'Open Teams and choose a permissions tab.', uiLabels: [extractQuoted(extractBlock(teamsBlock, 'folderTabs') ?? '', 'taskPermissions') ?? 'Task Permissions'] },
      ]),
    },
    deleteFlow: undefined,
    modals: [],
    buttons: [],
    formFields: [
      { id: 'memberVisibility', label: extractQuoted(extractBlock(extractBlock(teamsBlock, 'workflowTaskPermissions') ?? '', 'memberVisibility') ?? '', 'toggleLabel') ?? 'Only assigned user can view' },
    ],
    validation: [],
    statusValues: [],
    relationships: ['Permissions apply to organization members with BuildCore roles', 'Visibility rules affect workflow tasks, payments, and budget views'],
    limitations: collectLimitationStrings(teamsBlock),
    relatedFeatures: ['team-members', 'workflow-tasks', 'payments', 'budget'],
    routes: [{ pattern: '/teams', description: 'Teams and permissions' }],
    reactComponents: listComponentFiles(ctx.buildCoreRoot, ['BuildCoreTeams']),
    apiEndpoints,
    domainServices: serviceFiles,
    databaseTables: extractSupabaseTablesFromFiles(ctx.buildCoreRoot, serviceFiles),
    docCategories: ['permissions', 'settings'],
    keywords: ['permission', 'role', 'access', 'visibility', 'assigned user'],
  };
}

function buildTeamMembersFeature(ctx: FeatureBuildContext): BuildCoreFeatureKnowledge {
  const teamsBlock = contentBlock(ctx, 'teams');
  const serviceFiles = listDomainServiceFiles(ctx.buildCoreRoot, [/organization\/members/i, /invites/i, /app-access/i, /assignment-identities/i]);
  const apiEndpoints = filterApiRoutes(ctx.apiRoutes, [/^\/api\/internal\/organization\/(members|invites|app-access|assignment-identities)/]);

  return {
    id: 'team-members',
    name: 'Team Members',
    purpose: 'View organization members, BuildCore access, and roles on the Teams page.',
    whereItExists: ['Sidebar → Teams (/teams)'],
    navigationPath: ['Sidebar → Teams → Members tab'],
    creationFlow: {
      summary: 'Invite organization members through organization membership flows (Zenformed organization APIs).',
      steps: buildFlowSteps([{ order: 1, description: 'Open Teams and review organization membership table.' }]),
    },
    editFlow: {
      summary: 'Toggle BuildCore access and assign BuildCore roles for members when permitted.',
      steps: buildFlowSteps([
        { order: 1, description: 'Use BuildCore access toggle and role controls on the Members table.', uiLabels: [extractQuoted(extractBlock(teamsBlock, 'table') ?? '', 'buildCoreAccess') ?? 'BuildCore access'] },
      ]),
    },
    deleteFlow: undefined,
    modals: [],
    buttons: buttonsFromLabels({
      membersTab: extractQuoted(extractBlock(teamsBlock, 'folderTabs') ?? '', 'members'),
    }),
    formFields: [
      { id: 'name', label: extractQuoted(extractBlock(teamsBlock, 'table') ?? '', 'name') ?? 'Name' },
      { id: 'email', label: extractQuoted(extractBlock(teamsBlock, 'table') ?? '', 'email') ?? 'Email' },
      { id: 'organizationRole', label: extractQuoted(extractBlock(teamsBlock, 'table') ?? '', 'organizationRole') ?? 'Organization role' },
      { id: 'buildCoreRole', label: extractQuoted(extractBlock(teamsBlock, 'table') ?? '', 'buildCoreRole') ?? 'BuildCore role' },
    ],
    validation: [],
    statusValues: [
      extractQuoted(extractBlock(teamsBlock, 'accessStatus') ?? '', 'enabled') ?? 'Enabled',
      extractQuoted(extractBlock(teamsBlock, 'accessStatus') ?? '', 'notConfigured') ?? 'Not configured',
    ],
    relationships: ['Organization membership is separate from BuildCore access', 'Members can be assigned to projects and workflow tasks'],
    limitations: collectLimitationStrings(teamsBlock),
    relatedFeatures: ['permissions', 'projects', 'workflow-tasks'],
    routes: [{ pattern: '/teams', description: 'Teams page' }],
    reactComponents: listComponentFiles(ctx.buildCoreRoot, ['BuildCoreTeams']),
    apiEndpoints,
    domainServices: serviceFiles,
    databaseTables: extractSupabaseTablesFromFiles(ctx.buildCoreRoot, serviceFiles),
    docCategories: ['permissions', 'settings'],
    keywords: ['team', 'member', 'invite', 'organization', 'buildcore access', 'role'],
  };
}

export function extractBuildCoreFeatureKnowledge(
  buildCoreRoot: string,
  globalKnowledge: BuildCoreDocsKnowledge,
): BuildCoreFeatureKnowledgeIndex {
  const contentPath = path.join(buildCoreRoot, 'src/platform/content/buildCoreDashboardContent.ts');
  const contentSource = readUtf8(contentPath);
  const apiRoutes = listApiRoutes(buildCoreRoot);

  const ctx: FeatureBuildContext = {
    buildCoreRoot,
    contentSource,
    globalKnowledge,
    apiRoutes,
  };

  const features = [
    buildProjectsFeature(ctx),
    buildWorkflowTasksFeature(ctx),
    buildPaymentsFeature(ctx),
    buildBudgetFeature(ctx),
    buildDocumentsFeature(ctx),
    buildCustomersFeature(ctx),
    buildWorkflowSettingsFeature(ctx),
    buildReportsFeature(ctx),
    buildPermissionsFeature(ctx),
    buildTeamMembersFeature(ctx),
  ];

  return {
    generatedAt: new Date().toISOString(),
    sourceRoot: buildCoreRoot,
    features,
  };
}
