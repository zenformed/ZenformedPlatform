import path from 'path';

export const DOCS_IMAGES_STORAGE_BUCKET = 'platform-docs-images';

export const DOCS_IMAGE_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const DOCS_ALLOWED_IMAGE_CONTENT_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
]);

export const DOCS_ALLOWED_IMAGE_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
]);

export type DocsImageStorageBackend = 'filesystem' | 'supabase';

export type DocsImageUploadErrorCode =
  | 'file_required'
  | 'invalid_file_type'
  | 'file_too_large'
  | 'missing_env'
  | 'missing_bucket'
  | 'upload_failed';

export class DocsImageUploadError extends Error {
  readonly code: DocsImageUploadErrorCode;

  constructor(code: DocsImageUploadErrorCode, message: string) {
    super(message);
    this.name = 'DocsImageUploadError';
    this.code = code;
  }
}

export function resolveDocsImageStorageBackend(
  env: Record<string, string | undefined> = process.env,
): DocsImageStorageBackend {
  const override = env.DOCS_IMAGES_STORAGE?.trim().toLowerCase();
  if (override === 'filesystem') {
    return 'filesystem';
  }

  if (override === 'supabase') {
    return 'supabase';
  }

  if (env.VERCEL === '1') {
    return 'supabase';
  }

  return 'filesystem';
}

/** Supabase object key: `{productSlug}/{articleSlug}/{filename}` */
export function buildDocsImageSupabaseObjectPath(
  productSlug: string,
  articleSlug: string,
  fileName: string,
): string {
  return path.posix.join(productSlug, articleSlug, fileName);
}

/** Legacy public static path served from `public/docs/images/...` */
export function buildDocsImagePublicFilesystemPath(
  productSlug: string,
  articleSlug: string,
  fileName: string,
): string {
  return path.posix.join('docs', 'images', productSlug, articleSlug, fileName);
}

export function buildDocsImagePublicUrl(
  productSlug: string,
  articleSlug: string,
  fileName: string,
): string {
  return `/${buildDocsImagePublicFilesystemPath(productSlug, articleSlug, fileName)}`;
}

export function buildDocsImageSupabasePublicUrl(
  supabaseUrl: string,
  objectPath: string,
): string {
  const baseUrl = supabaseUrl.replace(/\/+$/, '');
  const encodedPath = objectPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return `${baseUrl}/storage/v1/object/public/${DOCS_IMAGES_STORAGE_BUCKET}/${encodedPath}`;
}

export function sanitizeDocsImageSegment(value: string): string {
  return value
    .replace(/[^a-z0-9-]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

export function resolveDocsImageFileName(originalName: string): string {
  const extension = path.extname(originalName).toLowerCase();
  const safeExtension = DOCS_ALLOWED_IMAGE_EXTENSIONS.has(extension) ? extension : '.png';
  const baseName = sanitizeDocsImageSegment(path.basename(originalName, path.extname(originalName)));
  const stem = baseName === '' ? 'image' : baseName;
  return `${Date.now()}-${stem}${safeExtension}`;
}

export type ValidateDocsImageUploadInput = {
  readonly contentType: string;
  readonly sizeBytes: number;
  readonly fileName: string;
};

export function validateDocsImageUpload(
  input: ValidateDocsImageUploadInput,
):
  | { readonly ok: true }
  | { readonly ok: false; readonly code: DocsImageUploadErrorCode; readonly message: string } {
  if (input.sizeBytes <= 0) {
    return { ok: false, code: 'file_required', message: 'An image file is required.' };
  }

  if (input.sizeBytes > DOCS_IMAGE_MAX_FILE_SIZE_BYTES) {
    return {
      ok: false,
      code: 'file_too_large',
      message: 'Image must be 10 MB or smaller.',
    };
  }

  const extension = path.extname(input.fileName).toLowerCase();
  const normalizedContentType = input.contentType.trim().toLowerCase();

  if (
    !DOCS_ALLOWED_IMAGE_CONTENT_TYPES.has(normalizedContentType) ||
    !DOCS_ALLOWED_IMAGE_EXTENSIONS.has(extension)
  ) {
    return {
      ok: false,
      code: 'invalid_file_type',
      message: 'Allowed image types: PNG, JPG, JPEG, WEBP, and GIF.',
    };
  }

  return { ok: true };
}

export function mapSupabaseDocsImageUploadFailure(message: string): DocsImageUploadError {
  const normalized = message.toLowerCase();

  if (normalized.includes('bucket not found') || normalized.includes('does not exist')) {
    return new DocsImageUploadError(
      'missing_bucket',
      `Supabase Storage bucket "${DOCS_IMAGES_STORAGE_BUCKET}" was not found. Apply the platform docs images migration.`,
    );
  }

  return new DocsImageUploadError('upload_failed', `Supabase image upload failed: ${message}`);
}

export function httpStatusForDocsImageUploadError(code: DocsImageUploadErrorCode): number {
  switch (code) {
    case 'file_required':
    case 'invalid_file_type':
      return 400;
    case 'file_too_large':
      return 413;
    case 'missing_env':
    case 'missing_bucket':
      return 503;
    default:
      return 500;
  }
}
