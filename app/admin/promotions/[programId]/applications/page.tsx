import type { ReactElement } from 'react';
import { AdminPartnerApplicationsPage } from '@/presentation/components/Admin/AdminPartnerApplicationsPage';

export default function PromotionApplicationsPage({ params }: { params: { programId: string } }): ReactElement {
  return <AdminPartnerApplicationsPage programId={params.programId} />;
}
