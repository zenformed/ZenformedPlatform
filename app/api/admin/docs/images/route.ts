import { NextRequest, NextResponse } from 'next/server';
import { requireAdminBearer } from '../docsAdminApiAuth';
import {
  DocsImageUploadError,
  httpStatusForDocsImageUploadError,
  resolveDocsImageFileName,
  sanitizeDocsImageSegment,
  validateDocsImageUpload,
} from '@/platform/docs/docsImageStorage';
import { uploadDocsImage } from '@/platform/docs/docsImageStorage.server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const authError = requireAdminBearer(request);
  if (authError != null) {
    return authError;
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: 'invalid_form_data', message: 'Could not read multipart form data.' },
      { status: 400 },
    );
  }

  const file = formData.get('file');
  const product =
    typeof formData.get('product') === 'string' ? (formData.get('product') as string) : 'buildcore';
  const articleSlug =
    typeof formData.get('articleSlug') === 'string'
      ? (formData.get('articleSlug') as string)
      : 'article';

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: 'file_required', message: 'An image file is required.' },
      { status: 400 },
    );
  }

  const validation = validateDocsImageUpload({
    contentType: file.type,
    sizeBytes: file.size,
    fileName: file.name,
  });

  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.code, message: validation.message },
      { status: httpStatusForDocsImageUploadError(validation.code) },
    );
  }

  const safeProduct = sanitizeDocsImageSegment(product) || 'buildcore';
  const safeSlug = sanitizeDocsImageSegment(articleSlug) || 'article';
  const fileName = resolveDocsImageFileName(file.name);

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadDocsImage({
      buffer,
      contentType: file.type.trim().toLowerCase(),
      product: safeProduct,
      articleSlug: safeSlug,
      fileName,
    });

    return NextResponse.json({ url: result.url, storage: result.storage });
  } catch (error: unknown) {
    if (error instanceof DocsImageUploadError) {
      console.error('Docs image upload failed:', error.code, error.message);
      return NextResponse.json(
        { error: error.code, message: error.message },
        { status: httpStatusForDocsImageUploadError(error.code) },
      );
    }

    const message = error instanceof Error ? error.message : 'Docs image upload failed.';
    console.error('Docs image upload failed:', message);
    return NextResponse.json(
      { error: 'upload_failed', message },
      { status: 500 },
    );
  }
}
