import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import ws from 'ws';
import { loadDocsMarkdownFiles } from '../src/platform/docs/docsMarkdownFiles';
import { mapFrontmatterToUpsertInput } from '../src/platform/docs/docsDatabaseImportMapper';
import { PLATFORM_DOCS_ARTICLES_TABLE } from '../src/platform/docs/docsDatabaseTypes';
import type { PlatformDocsArticleRow } from '../src/platform/docs/docsDatabaseTypes';

type MigrationCounts = {
  created: number;
  updated: number;
  skipped: number;
};

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (value == null || value === '') {
    throw new Error(`${name} is required to migrate docs articles to the database.`);
  }

  return value;
}

async function fetchExistingRow(
  supabase: SupabaseClient,
  product: string,
  category: string,
  slug: string,
): Promise<PlatformDocsArticleRow | undefined> {
  const { data, error } = await supabase
    .from(PLATFORM_DOCS_ARTICLES_TABLE)
    .select('*')
    .eq('product_slug', product)
    .eq('category_slug', category)
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to read existing article ${product}/${category}/${slug}: ${error.message}`);
  }

  return data == null ? undefined : (data as PlatformDocsArticleRow);
}

function rowsEquivalent(
  existing: PlatformDocsArticleRow,
  next: ReturnType<typeof mapFrontmatterToUpsertInput>,
  bodyMarkdown: string,
): boolean {
  return (
    existing.title === next.title &&
    existing.summary === next.summary &&
    existing.visibility === next.visibility &&
    existing.status === next.status &&
    existing.body_markdown === bodyMarkdown &&
    existing.author === next.author &&
    (existing.author_context ?? '') === (next.authorContext ?? '') &&
    existing.estimated_read_time_minutes === next.estimatedReadTimeMinutes &&
    JSON.stringify(existing.tags) === JSON.stringify(next.tags)
  );
}

async function migrateDocsToDatabase(): Promise<MigrationCounts> {
  const supabase = createClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      realtime: {
        transport: ws,
      },
    },
  );

  const files = loadDocsMarkdownFiles();
  const counts: MigrationCounts = { created: 0, updated: 0, skipped: 0 };

  for (const file of files) {
    const { frontmatter, content } = file;
    const upsertInput = mapFrontmatterToUpsertInput(frontmatter, content, {
      source: 'markdown',
      publishedAt: frontmatter.published ? new Date().toISOString() : null,
    });

    const existing = await fetchExistingRow(
      supabase,
      frontmatter.product,
      frontmatter.category,
      frontmatter.slug,
    );

    if (existing != null && rowsEquivalent(existing, upsertInput, content)) {
      counts.skipped += 1;
      continue;
    }

    const now = new Date().toISOString();
    const payload = {
      product_slug: upsertInput.product,
      category_slug: upsertInput.category,
      slug: upsertInput.slug,
      title: upsertInput.title,
      summary: upsertInput.summary,
      visibility: upsertInput.visibility,
      status: upsertInput.status,
      tags: [...upsertInput.tags],
      estimated_read_time_minutes: upsertInput.estimatedReadTimeMinutes,
      author: upsertInput.author,
      body_markdown: upsertInput.bodyMarkdown,
      author_context: upsertInput.authorContext ?? null,
      source: 'markdown',
      updated_at: now,
      published_at:
        upsertInput.status === 'published'
          ? (existing?.published_at ?? upsertInput.publishedAt ?? now)
          : null,
      deleted_at: null,
    };

    const { error } = await supabase
      .from(PLATFORM_DOCS_ARTICLES_TABLE)
      .upsert(payload, { onConflict: 'product_slug,category_slug,slug' });

    if (error) {
      throw new Error(
        `Failed to upsert ${frontmatter.product}/${frontmatter.category}/${frontmatter.slug}: ${error.message}`,
      );
    }

    if (existing == null) {
      counts.created += 1;
    } else {
      counts.updated += 1;
    }
  }

  return counts;
}

migrateDocsToDatabase()
  .then((counts) => {
    console.log(
      `Docs migration complete. created=${counts.created} updated=${counts.updated} skipped=${counts.skipped}`,
    );
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Docs migration failed: ${message}`);
    process.exitCode = 1;
  });
