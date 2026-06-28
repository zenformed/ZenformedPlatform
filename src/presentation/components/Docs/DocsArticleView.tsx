import type { ReactElement } from 'react';
import type { DocsArticle } from '@/platform/docs/docsArticleTypes';
import type { DocsCategory, DocsProduct } from '@/platform/docs/docsTypes';
import { docsCategoryPath, docsProductPath } from '@/platform/docs/docsTypes';
import { DocsArticleFeedback } from '@/presentation/components/Docs/DocsArticleFeedback';
import { DocsArticleMetadata } from '@/presentation/components/Docs/DocsArticleMetadata';
import { DocsArticlePagination } from '@/presentation/components/Docs/DocsArticlePagination';
import { DocsBreadcrumbs } from '@/presentation/components/Docs/DocsBreadcrumbs';
import { DocsMarkdownContent } from '@/presentation/components/Docs/DocsMarkdownContent';
import { DocsRelatedArticles } from '@/presentation/components/Docs/DocsRelatedArticles';
import styles from '../../../../app/docs/docs.module.css';

export type DocsArticleViewProps = {
  readonly article: DocsArticle;
  readonly product: DocsProduct;
  readonly category: DocsCategory;
};

export function DocsArticleView({
  article,
  product,
  category,
}: DocsArticleViewProps): ReactElement {
  return (
    <article className={styles.docsArticle}>
      <DocsBreadcrumbs
        items={[
          { label: product.name, href: docsProductPath(product.slug) },
          { label: category.title, href: docsCategoryPath(product.slug, category.slug) },
          { label: article.title },
        ]}
      />

      <header className={styles.docsArticleHeader}>
        <h1 className={styles.docsArticleTitle}>{article.title}</h1>
        {article.summary != null && article.summary.trim() !== '' ? (
          <p className={styles.docsArticleSummary}>{article.summary}</p>
        ) : null}
        <DocsArticleMetadata article={article} categoryTitle={category.title} />
      </header>

      <DocsMarkdownContent content={article.content} />

      <DocsArticlePagination
        previousArticle={article.previousArticle}
        nextArticle={article.nextArticle}
      />

      <DocsRelatedArticles articles={article.relatedArticles} />

      <DocsArticleFeedback />
    </article>
  );
}
