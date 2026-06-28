import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildDocsImagePublicFilesystemPath,
  buildDocsImagePublicUrl,
  buildDocsImageSupabaseObjectPath,
  buildDocsImageSupabasePublicUrl,
  DOCS_IMAGE_MAX_FILE_SIZE_BYTES,
  DocsImageUploadError,
  httpStatusForDocsImageUploadError,
  mapSupabaseDocsImageUploadFailure,
  resolveDocsImageFileName,
  resolveDocsImageStorageBackend,
  validateDocsImageUpload,
} from '@/platform/docs/docsImageStorage';

describe('docsImageStorage', () => {
  it('uses filesystem storage locally by default', () => {
    assert.equal(
      resolveDocsImageStorageBackend({
        VERCEL: undefined,
        DOCS_IMAGES_STORAGE: undefined,
      }),
      'filesystem',
    );
  });

  it('uses supabase storage on Vercel', () => {
    assert.equal(
      resolveDocsImageStorageBackend({
        VERCEL: '1',
        DOCS_IMAGES_STORAGE: undefined,
      }),
      'supabase',
    );
  });

  it('respects DOCS_IMAGES_STORAGE override', () => {
    assert.equal(
      resolveDocsImageStorageBackend({
        VERCEL: '1',
        DOCS_IMAGES_STORAGE: 'filesystem',
      }),
      'filesystem',
    );
  });

  it('builds Supabase object paths as product/article/file', () => {
    assert.equal(
      buildDocsImageSupabaseObjectPath(
        'buildcore',
        'upload-documents-for-a-workflow-task',
        'paperclip-documents-column.png',
      ),
      'buildcore/upload-documents-for-a-workflow-task/paperclip-documents-column.png',
    );
  });

  it('builds legacy public filesystem paths under docs/images', () => {
    assert.equal(
      buildDocsImagePublicFilesystemPath('buildcore', 'upload-documents', '1234-screenshot.png'),
      'docs/images/buildcore/upload-documents/1234-screenshot.png',
    );
    assert.equal(
      buildDocsImagePublicUrl('buildcore', 'upload-documents', '1234-screenshot.png'),
      '/docs/images/buildcore/upload-documents/1234-screenshot.png',
    );
  });

  it('builds Supabase public URLs', () => {
    assert.equal(
      buildDocsImageSupabasePublicUrl(
        'https://example.supabase.co/',
        'buildcore/upload-documents/example.png',
      ),
      'https://example.supabase.co/storage/v1/object/public/platform-docs-images/buildcore/upload-documents/example.png',
    );
  });

  it('generates safe unique filenames', () => {
    const fileName = resolveDocsImageFileName('My Screenshot.PNG');
    assert.match(fileName, /^\d+-my-screenshot\.png$/);
  });

  it('validates allowed image types and size', () => {
    assert.equal(
      validateDocsImageUpload({
        contentType: 'image/png',
        sizeBytes: 1024,
        fileName: 'diagram.png',
      }).ok,
      true,
    );

    const tooLarge = validateDocsImageUpload({
      contentType: 'image/png',
      sizeBytes: DOCS_IMAGE_MAX_FILE_SIZE_BYTES + 1,
      fileName: 'large.png',
    });
    assert.equal(tooLarge.ok, false);
    if (!tooLarge.ok) {
      assert.equal(tooLarge.code, 'file_too_large');
    }

    const invalidType = validateDocsImageUpload({
      contentType: 'image/svg+xml',
      sizeBytes: 1024,
      fileName: 'icon.svg',
    });
    assert.equal(invalidType.ok, false);
    if (!invalidType.ok) {
      assert.equal(invalidType.code, 'invalid_file_type');
    }
  });

  it('maps Supabase bucket failures to missing_bucket', () => {
    const error = mapSupabaseDocsImageUploadFailure('Bucket not found');
    assert.equal(error.code, 'missing_bucket');
    assert.match(error.message, /platform-docs-images/);
  });

  it('maps upload error codes to HTTP statuses', () => {
    assert.equal(httpStatusForDocsImageUploadError('invalid_file_type'), 400);
    assert.equal(httpStatusForDocsImageUploadError('file_too_large'), 413);
    assert.equal(httpStatusForDocsImageUploadError('missing_env'), 503);
    assert.equal(httpStatusForDocsImageUploadError('upload_failed'), 500);
  });

  it('exposes structured upload errors', () => {
    const error = new DocsImageUploadError('missing_env', 'Missing service role key.');
    assert.equal(error.code, 'missing_env');
    assert.equal(error.message, 'Missing service role key.');
  });
});
