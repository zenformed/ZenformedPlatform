import { redirect } from 'next/navigation';
import { platformAdminNavigation as nav } from '@/platform/navigation/platformAdminNavigation';

export default function AdminIndexPage(): never {
  redirect(nav.routes.accountOwners);
}
