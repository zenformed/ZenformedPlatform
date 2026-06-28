import 'server-only';

import fs from 'fs';
import path from 'path';
import {
  getSupabaseServiceRoleClient,
  requireSupabaseServiceRoleClient,
} from '@/infrastructure/supabase/supabaseServiceRole.server';
import {
  buildDocsImagePublicFilesystemPath,
  buildDocsImagePublicUrl,
  buildDocsImageSupabaseObjectPath,
  buildDocsImageSupabasePublicUrl,
  DOCS_IMAGES_STORAGE_BUCKET,
  DocsImageUploadError,
  mapSupabaseDocsImageUploadFailure,
  resolveDocsImageStorageBackend,
  type DocsImageStorageBackend,
} from '@/platform/docs/docsImageStorage';

export type UploadDocsImageInput = {
  readonly buffer: Buffer;
  readonly contentType: string;
  readonly product: string;
  readonly articleSlug: string;
  readonly fileName: string;
};

export type UploadDocsImageResult = {
  readonly url: string;
  readonly storage: DocsImageStorageBackend;
};

function assertSupabaseDocsImageCredentials(): void {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (url == null || url === '' || key == null || key === '') {
    throw new DocsImageUploadError(
      'missing_env',
      'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for docs image uploads.',
    );
  }
}

async function uploadDocsImageToSupabase(input: UploadDocsImageInput): Promise<UploadDocsImageResult> {
  assertSupabaseDocsImageCredentials();

  if (getSupabaseServiceRoleClient() == null) {
    throw new DocsImageUploadError(
      'missing_env',
      'SUPABASE_SERVICE_ROLE_KEY is required for docs image uploads.',
    );
  }

  const objectPath = buildDocsImageSupabaseObjectPath(
    input.product,
    input.articleSlug,
    input.fileName,
  );
  const client = requireSupabaseServiceRoleClient();
  const { error } = await client.storage.from(DOCS_IMAGES_STORAGE_BUCKET).upload(objectPath, input.buffer, {
    contentType: input.contentType,
    upsert: false,
  });

  if (error != null) {
    throw mapSupabaseDocsImageUploadFailure(error.message);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? '';
  return {
    url: buildDocsImageSupabasePublicUrl(supabaseUrl, objectPath),
    storage: 'supabase',
  };
}

function uploadDocsImageToFilesystem(input: UploadDocsImageInput): UploadDocsImageResult {
  const relativePath = buildDocsImagePublicFilesystemPath(
    input.product,
    input.articleSlug,
    input.fileName,
  );
  const absoluteDirectory = path.join(process.cwd(), 'public', path.dirname(relativePath));
  fs.mkdirSync(absoluteDirectory, { recursive: true });
  fs.writeFileSync(path.join(process.cwd(), 'public', relativePath), input.buffer);

  return {
    url: buildDocsImagePublicUrl(input.product, input.articleSlug, input.fileName),
    storage: 'filesystem',
  };
}

export async function uploadDocsImage(input: UploadDocsImageInput): Promise<UploadDocsImageResult> {
  const backend = resolveDocsImageStorageBackend();

  if (backend === 'supabase') {
    return uploadDocsImageToSupabase(input);
  }

  return uploadDocsImageToFilesystem(input);
}
