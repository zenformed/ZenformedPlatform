import type { ReactElement } from 'react';
import { AdminPartnerApplicationDetailPage } from '@/presentation/components/Admin/AdminPartnerApplicationDetailPage';

export default function PartnerApplicationPage({ params }: { params: { applicationId: string } }): ReactElement {
  return <AdminPartnerApplicationDetailPage applicationId={params.applicationId} />;
}
