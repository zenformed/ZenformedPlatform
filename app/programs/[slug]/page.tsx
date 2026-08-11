import type { ReactElement } from 'react';
import { PublicPartnerProgramPage } from '@/presentation/components/PartnerPrograms/PublicPartnerProgramPage';

export default function PartnerProgramPage({ params }: { params: { slug: string } }): ReactElement {
  return <PublicPartnerProgramPage slug={params.slug} />;
}
