import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { requireAdminBearer } from '../docsAdminApiAuth';

export const dynamic = 'force-dynamic';

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']);

function sanitizeSegment(value: string): string {
  return value.replace(/[^a-z0-9-]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const authError = requireAdminBearer(request);
  if (authError != null) {
    return authError;
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'invalid_form_data' }, { status: 400 });
  }

  const file = formData.get('file');
  const product = typeof formData.get('product') === 'string' ? formData.get('product') as string : 'buildcore';
  const articleSlug =
    typeof formData.get('articleSlug') === 'string' ? (formData.get('articleSlug') as string) : 'article';

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'file_required' }, { status: 400 });
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'invalid_file_type' }, { status: 400 });
  }

  const extension = path.extname(file.name) || '.png';
  const safeProduct = sanitizeSegment(product) || 'buildcore';
  const safeSlug = sanitizeSegment(articleSlug) || 'article';
  const fileName = `${Date.now()}-${sanitizeSegment(path.basename(file.name, extension))}${extension.toLowerCase()}`;

  const relativeDirectory = path.join('docs', 'images', safeProduct, safeSlug);
  const absoluteDirectory = path.join(process.cwd(), 'public', relativeDirectory);

  fs.mkdirSync(absoluteDirectory, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const absolutePath = path.join(absoluteDirectory, fileName);
  fs.writeFileSync(absolutePath, buffer);

  const publicUrl = `/${relativeDirectory.replace(/\\/g, '/')}/${fileName}`;

  return NextResponse.json({ url: publicUrl });
}
