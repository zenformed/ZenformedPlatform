export type DocsArticleBodyTemplateSection = {
  readonly heading: string;
  readonly placeholder?: string;
};

export const docsArticleBodyTemplate = {
  sections: [
    { heading: 'Overview', placeholder: 'Briefly describe what this article covers.' },
    { heading: 'Step-by-Step', placeholder: 'Walk through the process in clear steps.' },
    { heading: 'Tips', placeholder: 'Share helpful tips, shortcuts, or best practices.' },
    { heading: 'Related Articles', placeholder: 'Link to related documentation where helpful.' },
  ],
} as const satisfies { readonly sections: readonly DocsArticleBodyTemplateSection[] };

export function buildDocsArticleBodyTemplate(title: string): string {
  const sections = docsArticleBodyTemplate.sections
    .map((section) => {
      const lines = [`## ${section.heading}`];
      if (section.placeholder != null && section.placeholder.trim() !== '') {
        lines.push('', section.placeholder);
      }
      return lines.join('\n');
    })
    .join('\n\n');

  return `# ${title}\n\n${sections}\n`;
}
