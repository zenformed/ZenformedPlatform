import type { ReactElement } from 'react';
import { AdminOrganizationDetailPageContent } from '@/presentation/components/Admin/AdminOrganizationDetailPageContent';

type PageProps = {
  params: { organizationId: string };
};

export default function AdminOrganizationDetailPage({ params }: PageProps): ReactElement {
  return <AdminOrganizationDetailPageContent organizationId={params.organizationId} />;
}
