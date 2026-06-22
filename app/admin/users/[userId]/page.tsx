import type { ReactElement } from 'react';
import { AdminAccountOwnerDetailPageContent } from '@/presentation/components/Admin/AdminAccountOwnerDetailPageContent';

type PageProps = {
  params: { userId: string };
};

export default function AdminAccountOwnerDetailPage({ params }: PageProps): ReactElement {
  return <AdminAccountOwnerDetailPageContent ownerUserId={params.userId} />;
}
