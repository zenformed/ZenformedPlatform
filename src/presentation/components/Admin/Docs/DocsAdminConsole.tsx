'use client';

import { useEffect, useMemo, useState, type ReactElement } from 'react';
import { platformDocsAdminContent as content } from '@/platform/content/platformDocsAdminContent';
import {
  getDocsAdminCategoryOptions,
  getDocsAdminCategoryTitle,
  getDocsAdminProductName,
} from '@/platform/docs/docsAdminCatalogData';
import type { DocsAdminArticle } from '@/platform/docs/docsAdminTypes';
import { readDocsAdminSelection } from '@/platform/docs/docsAdminSelectionStorage';
import type { DocsCategorySlug, DocsProductSlug } from '@/platform/docs/docsTypes';

import adminStyles from '../admin.module.css';

import { DocsAdminArticlePreview } from './DocsAdminArticlePreview';

import { DocsAdminArticleTable } from './DocsAdminArticleTable';

import { DocsAdminContentPlan } from './DocsAdminContentPlan';

import { DocsAdminNewArticleWizard } from './DocsAdminNewArticleWizard';

import { DocsAdminToolbar } from './DocsAdminToolbar';

import { DocsAdminTreePanel } from './DocsAdminTreePanel';

import docsAdminStyles from './docsAdmin.module.css';
import { useDocsAdminNavigation } from '@/presentation/hooks/useDocsAdminNavigation';
import { useRouter } from 'next/navigation';



const DEFAULT_PRODUCT: DocsProductSlug = 'buildcore';

const DEFAULT_CATEGORY: DocsCategorySlug = 'getting-started';



type DocsAdminConsoleView = 'articles' | 'contentPlan';



type DocsAdminArticleWizardSeed = {

  readonly product: DocsProductSlug;

  readonly category: DocsCategorySlug;

  readonly title: string;

  readonly slug: string;

};



export type DocsAdminConsoleProps = {

  readonly articles: readonly DocsAdminArticle[];

};



export function DocsAdminConsole({ articles }: DocsAdminConsoleProps): ReactElement {

  const router = useRouter();
  const docsAdminNav = useDocsAdminNavigation();

  const [activeView, setActiveView] = useState<DocsAdminConsoleView>('articles');

  const [productSlug, setProductSlug] = useState<DocsProductSlug>(DEFAULT_PRODUCT);

  const [categorySlug, setCategorySlug] = useState<DocsCategorySlug>(DEFAULT_CATEGORY);

  const [selectedEditorId, setSelectedEditorId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const [wizardSeed, setWizardSeed] = useState<DocsAdminArticleWizardSeed | null>(null);

  useEffect(() => {
    const lastSelection = readDocsAdminSelection();
    if (lastSelection != null) {
      setProductSlug(lastSelection.product);
      setCategorySlug(lastSelection.category);
      if (lastSelection.editorId != null) {
        setSelectedEditorId(lastSelection.editorId);
      }
    }

    router.refresh();
  }, [router]);

  const productArticles = useMemo(
    () => articles.filter((article) => article.product === productSlug),
    [articles, productSlug],
  );

  const categoryArticles = useMemo(
    () => productArticles.filter((article) => article.category === categorySlug),
    [productArticles, categorySlug],
  );

  const filteredArticles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const scope = query === '' ? categoryArticles : productArticles;

    if (query === '') {
      return scope;
    }

    return scope.filter((article) =>
      [article.title, article.summary, article.slug, article.category, ...article.tags].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [categoryArticles, productArticles, searchQuery]);



  const selectedArticle = useMemo(

    () => filteredArticles.find((article) => article.editorId === selectedEditorId) ?? null,

    [filteredArticles, selectedEditorId],

  );



  const handleProductSelect = (slug: DocsProductSlug): void => {

    setProductSlug(slug);

    const firstCategory = getDocsAdminCategoryOptions(slug)[0]?.slug ?? DEFAULT_CATEGORY;

    setCategorySlug(firstCategory);

    setSelectedEditorId(null);

  };



  const handleCategorySelect = (slug: DocsCategorySlug): void => {

    setCategorySlug(slug);

    setSelectedEditorId(null);

  };



  const handleArticleSelect = (article: DocsAdminArticle): void => {

    setSelectedEditorId(article.editorId);

  };



  const handleArticleOpen = (article: DocsAdminArticle): void => {

    docsAdminNav.openArticle(article.editorId);

  };



  const handleArticleCreated = (editorId: string): void => {

    docsAdminNav.openArticle(editorId);

  };



  const handleOpenNewArticleWizard = (): void => {

    setWizardSeed(null);

    setIsWizardOpen(true);

  };



  const handleCreateFromPlan = (seed: DocsAdminArticleWizardSeed): void => {

    setWizardSeed(seed);

    setIsWizardOpen(true);

  };



  const handleCloseWizard = (): void => {

    setIsWizardOpen(false);

    setWizardSeed(null);

  };



  return (

    <div className={docsAdminStyles.docsAdminConsole}>

      <div>

        <h2 className={adminStyles.adminPageTitle}>{content.console.title}</h2>

        <p className={adminStyles.adminPageSubtitle}>{content.console.subtitle}</p>

      </div>



      <div className={docsAdminStyles.docsAdminViewTabs} role="tablist" aria-label="Documentation admin views">

        <button

          type="button"

          role="tab"

          aria-selected={activeView === 'articles'}

          className={`${docsAdminStyles.docsAdminViewTab} ${

            activeView === 'articles' ? docsAdminStyles.docsAdminViewTabActive : ''

          }`}

          onClick={() => setActiveView('articles')}

        >

          {content.contentPlan.articlesTabLabel}

        </button>

        <button

          type="button"

          role="tab"

          aria-selected={activeView === 'contentPlan'}

          className={`${docsAdminStyles.docsAdminViewTab} ${

            activeView === 'contentPlan' ? docsAdminStyles.docsAdminViewTabActive : ''

          }`}

          onClick={() => setActiveView('contentPlan')}

        >

          {content.contentPlan.tabLabel}

        </button>

      </div>



      {activeView === 'articles' ? (

        <>

          <DocsAdminToolbar

            searchQuery={searchQuery}

            onSearchQueryChange={setSearchQuery}

            onNewArticle={handleOpenNewArticleWizard}

          />



          <div className={docsAdminStyles.docsAdminConsoleBody}>

            <DocsAdminTreePanel

              productSlug={productSlug}

              categorySlug={categorySlug}

              categoryArticles={categoryArticles}

              selectedEditorId={selectedEditorId}

              onProductSelect={handleProductSelect}

              onCategorySelect={handleCategorySelect}

              onArticleSelect={handleArticleSelect}

            />



            <div className={docsAdminStyles.docsAdminCenterPanel}>

              <section className={docsAdminStyles.docsAdminPanel} aria-label="Article list">

                <div className={docsAdminStyles.docsAdminPanelHeader}>
                  {getDocsAdminProductName(productSlug)} /{' '}
                  {searchQuery.trim() === ''
                    ? getDocsAdminCategoryTitle(productSlug, categorySlug)
                    : content.console.table.searchResultsLabel}
                </div>

                <div className={docsAdminStyles.docsAdminPanelBody}>

                  <DocsAdminArticleTable

                    articles={filteredArticles}

                    selectedEditorId={selectedEditorId}

                    onSelect={handleArticleSelect}

                    onOpen={handleArticleOpen}

                  />

                </div>

              </section>

            </div>



            <DocsAdminArticlePreview article={selectedArticle} />

          </div>

        </>

      ) : (

        <section className={docsAdminStyles.docsAdminPanel} aria-label={content.contentPlan.title}>

          <div className={docsAdminStyles.docsAdminPanelHeader}>{content.contentPlan.title}</div>

          <div className={docsAdminStyles.docsAdminPanelBody}>

            <DocsAdminContentPlan

              articles={articles}

              onCreateArticle={handleCreateFromPlan}

              onOpenArticle={docsAdminNav.openArticle}

            />

          </div>

        </section>

      )}



      <DocsAdminNewArticleWizard

        isOpen={isWizardOpen}

        defaultProduct={wizardSeed?.product ?? productSlug}

        defaultCategory={wizardSeed?.category ?? categorySlug}

        initialTitle={wizardSeed?.title}

        initialSlug={wizardSeed?.slug}

        onClose={handleCloseWizard}

        onCreated={handleArticleCreated}

      />

    </div>

  );

}

