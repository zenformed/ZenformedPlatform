import type { BuildCoreDocsKnowledge } from '../../src/platform/docs/docsProductKnowledgeTypes';

function renderTable(headers: readonly string[], rows: readonly (readonly string[])[]): string {
  if (rows.length === 0) {
    return '_None extracted._\n';
  }

  const headerLine = `| ${headers.join(' | ')} |`;
  const divider = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map((row) => `| ${row.join(' | ')} |`).join('\n');
  return `${headerLine}\n${divider}\n${body}\n`;
}

export function renderBuildCoreContextMarkdown(knowledge: BuildCoreDocsKnowledge, editorialMarkdown: string): string {
  const lines: string[] = [
    '<!-- AUTO-GENERATED — do not edit manually. Run: npm run generate:docs-context -->',
    '',
    '# BuildCore — Documentation AI Product Context',
    '',
    '_Generated: ' + knowledge.generatedAt + '_',
    '_Source: `' + knowledge.sourceRoot + '`_',
    '',
    'This file combines **generated product knowledge** scanned from the BuildCore application with **manual editorial rules**. Staff authoring AI must treat both sections as authoritative.',
    '',
    '---',
    '',
    '## Product identity (generated)',
    '',
    renderTable(['Field', 'Value'], [
      ['Product name', knowledge.product.name],
      ['Product slug', `\`${knowledge.product.slug}\``],
      ['Description', knowledge.product.description],
      ['Dashboard route', `\`${knowledge.product.dashboardRoute}\``],
      ['Parent platform', 'Zenformed'],
    ]),
    '',
    '## Primary navigation (generated)',
    '',
    '### Sidebar',
    '',
    renderTable(
      ['Label', 'Route', 'Notes'],
      knowledge.navigation.sidebar.map((item) => [item.label, `\`${item.route}\``, item.title]),
    ),
    '',
    '### Header controls',
    '',
    renderTable(
      ['Control', 'Label', 'Notes'],
      knowledge.navigation.header.map((item) => [item.id, item.label, item.context ?? '']),
    ),
    '',
    '## Routes (generated)',
    '',
    '### App routes',
    '',
    renderTable(
      ['Id', 'Pattern'],
      knowledge.routes.static.map((route) => [route.id, `\`${route.pattern}\``]),
    ),
    '',
    '### Project detail routes',
    '',
    renderTable(
      ['Section', 'Pattern', 'Description'],
      knowledge.routes.projectDetail.map((route) => [
        route.id,
        `\`${route.pattern}\``,
        route.description ?? '',
      ]),
    ),
    '',
    '## Projects list — create project (generated)',
    '',
    '1. Open the **Projects** view (`/dashboard`).',
    '2. Select the **plus (+) button** (`' + knowledge.projectsList.createProject.plusButtonAria + '`).',
    `3. The **${knowledge.projectsList.createProject.modalTitle}** modal opens.`,
    `4. Submit with **${knowledge.projectsList.createProject.submitButton}**.`,
    '',
    renderTable(
      ['Element', 'Label'],
      [
        ['Plus button (aria)', knowledge.projectsList.createProject.plusButtonAria],
        ['Modal title', knowledge.projectsList.createProject.modalTitle],
        ['Submit button', knowledge.projectsList.createProject.submitButton],
        ['Cancel button', knowledge.projectsList.createProject.cancelButton],
      ],
    ),
    '',
    '### Create project form fields',
    '',
    renderTable(
      ['Field id', 'Label'],
      knowledge.projectsList.createProject.formFields.map((field) => [field.id, field.label]),
    ),
    '',
    '## Project detail (generated)',
    '',
    `- Back navigation: **${knowledge.projectDetail.backLabel}**`,
    `- Edit modal title: **${knowledge.projectDetail.editModalTitle}**`,
    '',
    renderTable(
      ['Section id', 'Label'],
      knowledge.projectDetail.sections.map((section) => [section.id, section.label]),
    ),
    '',
    '## Subprojects (generated)',
    '',
    renderTable(
      ['Element', 'Label'],
      [
        ['Section title', knowledge.subprojects.sectionTitle],
        ['Plus button (aria)', knowledge.subprojects.plusButtonAria],
        ['Modal title', knowledge.subprojects.modalTitle],
        ['Submit button', knowledge.subprojects.submitButton],
      ],
    ),
    '',
    '## Settings & organization pages (generated)',
    '',
    renderTable(
      ['Page', 'Title', 'Breadcrumb'],
      knowledge.settingsPages.map((page) => [page.id, page.title, page.breadcrumb ?? '']),
    ),
    '',
    '## Reports (generated)',
    '',
    renderTable(
      ['Field', 'Value'],
      [
        ['Title', knowledge.reports.title],
        ['Breadcrumb', knowledge.reports.breadcrumb],
      ],
    ),
    '',
    '## Default pipeline stages (generated fallback catalog)',
    '',
    renderTable(
      ['Slug', 'Label', 'Order'],
      knowledge.workflow.defaultPipelineStages.map((stage) => [
        `\`${stage.slug}\``,
        stage.label,
        String(stage.sortOrder),
      ]),
    ),
    '',
    '## Feature flags & demo behavior (generated)',
    '',
    renderTable(
      ['Id', 'Description'],
      knowledge.featureFlags.map((flag) => [flag.id, flag.description]),
    ),
    '',
    '---',
    '',
    editorialMarkdown.trim(),
    '',
  ];

  return lines.join('\n');
}
