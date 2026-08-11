import type { ReactElement } from 'react';
import { AdminPartnerProgramEditor } from '@/presentation/components/Admin/AdminPartnerProgramEditor';

export default function PromotionDetailPage({ params }: { params: { programId: string } }): ReactElement {
  return <AdminPartnerProgramEditor programId={params.programId} />;
}
