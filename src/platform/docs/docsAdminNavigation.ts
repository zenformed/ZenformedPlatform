export const docsAdminNavigation = {
  routes: {
    console: '/admin/docs',
    articleEditor: (editorId: string) => `/admin/docs/articles/${editorId}`,
    articlePreview: (editorId: string) => `/admin/docs/articles/${editorId}/preview`,
  },
} as const;
