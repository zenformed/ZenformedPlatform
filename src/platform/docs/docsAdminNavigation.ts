export const docsAdminNavigation = {
  routes: {
    console: '/admin/docs',
    articleEditor: (editorId: string) => `/admin/docs/articles/${editorId}`,
  },
} as const;
