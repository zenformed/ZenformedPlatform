import 'server-only';

import fs from 'node:fs';
import path from 'node:path';
import { buildDocsAuthoringUiVocabulary } from '@/platform/docs/buildDocsAuthoringVocabulary';
import {
  formatDocsAuthoringGroundingForAi,
  type DocsAuthoringArticleMetadata,
} from '@/platform/docs/formatDocsAuthoringGroundingForAi';
import type { BuildCoreFeatureKnowledgeIndex } from '@/platform/docs/docsFeatureKnowledgeTypes';
import type { BuildCoreImplementationKnowledgeIndex } from '@/platform/docs/docsImplementationKnowledgeTypes';
import type {
  BuildCoreFeatureWorkflowKnowledge,
  BuildCoreFeatureWorkflowKnowledgeIndex,
} from '@/platform/docs/docsWorkflowKnowledgeTypes';
import type { DocsProductKnowledgeIndex } from '@/platform/docs/docsProductKnowledgeTypes';
import {
  loadBuildCoreFeatureKnowledgeIndexFromJson,
  resolveDocsFeatureForArticle,
} from '@/platform/docs/resolveDocsFeatureForArticle';
import {
  loadBuildCoreImplementationKnowledgeIndexFromJson,
  resolveDocsImplementationForFeature,
} from '@/platform/docs/resolveDocsImplementationForFeature';
import {
  loadBuildCoreWorkflowKnowledgeIndexFromJson,
  resolveDocsWorkflowForFeature,
} from '@/platform/docs/resolveDocsWorkflowForFeature';

const PRODUCT_KNOWLEDGE_JSON: Partial<Record<string, string>> = {
  buildcore: 'docs/generated/buildcore.context.json',
};

const PRODUCT_FEATURE_JSON: Partial<Record<string, string>> = {
  buildcore: 'docs/generated/buildcore.features.json',
};

const PRODUCT_IMPLEMENTATION_JSON: Partial<Record<string, string>> = {
  buildcore: 'docs/generated/buildcore.implementation.json',
};

const PRODUCT_WORKFLOW_JSON: Partial<Record<string, string>> = {
  buildcore: 'docs/generated/buildcore.workflows.json',
};

const PRODUCT_EDITORIAL_FILES: Partial<Record<string, string>> = {
  buildcore: 'docs/architecture/BUILDCORE_DOCS_CONTEXT.editorial.md',
};

const legacyContextCache = new Map<string, string>();
const authoringGroundingCache = new Map<string, DocsAuthoringGroundingPayload>();

export type DocsAuthoringGroundingPayload = {
  readonly productContext: string;
  readonly implementationVocabulary?: readonly string[];
  readonly featureWorkflow?: BuildCoreFeatureWorkflowKnowledge;
};

function readJsonFile<T>(relativePath: string): T | undefined {
  const absolutePath = path.join(process.cwd(), relativePath);
  if (!fs.existsSync(absolutePath)) {
    return undefined;
  }

  try {
    return JSON.parse(fs.readFileSync(absolutePath, 'utf8')) as T;
  } catch {
    return undefined;
  }
}

function readEditorial(relativePath: string): string | undefined {
  const absolutePath = path.join(process.cwd(), relativePath);
  if (!fs.existsSync(absolutePath)) {
    return undefined;
  }

  const content = fs.readFileSync(absolutePath, 'utf8').trim();
  return content === '' ? undefined : content;
}

function loadBuildCoreIndexes(): {
  readonly globalIndex: DocsProductKnowledgeIndex;
  readonly featureIndex: BuildCoreFeatureKnowledgeIndex;
  readonly implementationIndex: BuildCoreImplementationKnowledgeIndex;
  readonly workflowIndex: BuildCoreFeatureWorkflowKnowledgeIndex;
} | undefined {
  const globalIndex = readJsonFile<DocsProductKnowledgeIndex>(PRODUCT_KNOWLEDGE_JSON.buildcore ?? '');
  const featureJson = readJsonFile<{ buildcore?: BuildCoreFeatureKnowledgeIndex }>(
    PRODUCT_FEATURE_JSON.buildcore ?? '',
  );
  const implementationJson = readJsonFile<{ buildcore?: BuildCoreImplementationKnowledgeIndex }>(
    PRODUCT_IMPLEMENTATION_JSON.buildcore ?? '',
  );
  const workflowJson = readJsonFile<{ buildcore?: BuildCoreFeatureWorkflowKnowledgeIndex }>(
    PRODUCT_WORKFLOW_JSON.buildcore ?? '',
  );
  const featureIndex = loadBuildCoreFeatureKnowledgeIndexFromJson(featureJson);
  const implementationIndex = loadBuildCoreImplementationKnowledgeIndexFromJson(implementationJson);
  const workflowIndex = loadBuildCoreWorkflowKnowledgeIndexFromJson(workflowJson);

  if (globalIndex?.buildcore == null || featureIndex == null || implementationIndex == null || workflowIndex == null) {
    return undefined;
  }

  return { globalIndex, featureIndex, implementationIndex, workflowIndex };
}

function buildAuthoringCacheKey(productSlug: string, article: DocsAuthoringArticleMetadata): string {
  return [
    productSlug,
    article.category,
    article.title,
    article.summary,
    article.tags.join(','),
    article.authorContext ?? '',
  ].join('::');
}

/** Legacy combined context (global + editorial). Prefer loadDocsAuthoringGroundingPayload for Generate Draft. */
export function loadDocsProductContext(productSlug: string): string | undefined {
  const payload = loadDocsAuthoringGroundingPayload({
    title: '',
    summary: '',
    product: productSlug,
    category: '',
    categoryTitle: '',
    tags: [],
  });

  return payload?.productContext;
}

export function loadDocsAuthoringGroundingPayload(
  article: DocsAuthoringArticleMetadata,
): DocsAuthoringGroundingPayload | undefined {
  if (article.product !== 'buildcore') {
    const legacy = loadDocsProductContext(article.product);
    return legacy != null ? { productContext: legacy } : undefined;
  }

  const cacheKey = buildAuthoringCacheKey(article.product, article);
  const cached = authoringGroundingCache.get(cacheKey);
  if (cached != null) {
    return cached;
  }

  const editorialRelativePath = PRODUCT_EDITORIAL_FILES.buildcore;
  const editorial = editorialRelativePath != null ? readEditorial(editorialRelativePath) : undefined;
  const indexes = loadBuildCoreIndexes();

  if (editorial == null || indexes == null) {
    return undefined;
  }

  const globalKnowledge = indexes.globalIndex.buildcore;
  if (globalKnowledge == null) {
    return undefined;
  }

  const featureMatch = resolveDocsFeatureForArticle(indexes.featureIndex, {
    product: article.product,
    category: article.category,
    title: article.title,
    summary: article.summary,
    tags: article.tags,
  });

  const implementationKnowledge = resolveDocsImplementationForFeature(
    indexes.implementationIndex,
    featureMatch?.feature.id,
  );

  const featureWorkflow = resolveDocsWorkflowForFeature(indexes.workflowIndex, featureMatch?.feature.id);

  const productContext = formatDocsAuthoringGroundingForAi({
    authorContext: article.authorContext,
    editorialPolicy: editorial,
    globalProductContext: globalKnowledge,
    featureKnowledge: featureMatch?.feature,
    featureMatchReasons: featureMatch?.matchReasons,
    featureWorkflow,
    implementationKnowledge,
    articleMetadata: article,
  });

  const implementationVocabulary =
    implementationKnowledge != null
      ? buildDocsAuthoringUiVocabulary({
          globalProductContext: globalKnowledge,
          featureKnowledge: featureMatch?.feature,
          implementationKnowledge,
        })
      : undefined;

  const payload: DocsAuthoringGroundingPayload = {
    productContext,
    implementationVocabulary,
    ...(featureWorkflow != null ? { featureWorkflow } : {}),
  };

  authoringGroundingCache.set(cacheKey, payload);
  return payload;
}

/** @deprecated Use loadDocsAuthoringGroundingPayload().productContext */
export function loadDocsAuthoringGrounding(article: DocsAuthoringArticleMetadata): string | undefined {
  return loadDocsAuthoringGroundingPayload(article)?.productContext;
}

export function clearDocsProductContextCacheForTests(): void {
  legacyContextCache.clear();
  authoringGroundingCache.clear();
}
