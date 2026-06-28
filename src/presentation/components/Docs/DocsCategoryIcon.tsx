import type { ReactElement } from 'react';
import type { DocsCategorySlug } from '@/platform/docs/docsTypes';
import styles from '../../../../app/docs/docs.module.css';

type IconProps = {
  readonly className?: string;
};

function GettingStartedIcon({ className }: IconProps): ReactElement {
  return (
    <svg className={className} viewBox="0 0 24 24" width={24} height={24} aria-hidden focusable="false">
      <path
        d="M12 3 4 7v6c0 4.5 3.4 8.7 8 10 4.6-1.3 8-5.5 8-10V7l-8-4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="m9 12 2 2 4-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function ProjectsIcon({ className }: IconProps): ReactElement {
  return (
    <svg className={className} viewBox="0 0 24 24" width={24} height={24} aria-hidden focusable="false">
      <rect x="4" y="5" width="16" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.75" />
      <path d="M8 9h8M8 13h5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function CustomersIcon({ className }: IconProps): ReactElement {
  return (
    <svg className={className} viewBox="0 0 24 24" width={24} height={24} aria-hidden focusable="false">
      <circle cx="12" cy="8" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M5 19c0-3.314 3.134-6 7-6s7 2.686 7 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function WorkflowIcon({ className }: IconProps): ReactElement {
  return (
    <svg className={className} viewBox="0 0 24 24" width={24} height={24} aria-hidden focusable="false">
      <path
        d="M6 6h4v4H6V6Zm8 0h4v4h-4V6ZM6 14h4v4H6v-4Zm8 0h4v4h-4v-4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BudgetIcon({ className }: IconProps): ReactElement {
  return (
    <svg className={className} viewBox="0 0 24 24" width={24} height={24} aria-hidden focusable="false">
      <path
        d="M4 7h16v10H4V7Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function PaymentsIcon({ className }: IconProps): ReactElement {
  return (
    <svg className={className} viewBox="0 0 24 24" width={24} height={24} aria-hidden focusable="false">
      <rect x="3" y="6" width="18" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.75" />
      <path d="M3 10h18" fill="none" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function DocumentsIcon({ className }: IconProps): ReactElement {
  return (
    <svg className={className} viewBox="0 0 24 24" width={24} height={24} aria-hidden focusable="false">
      <path
        d="M8 4h8l4 4v12H8V4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M16 4v4h4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  );
}

function ReportsIcon({ className }: IconProps): ReactElement {
  return (
    <svg className={className} viewBox="0 0 24 24" width={24} height={24} aria-hidden focusable="false">
      <path d="M5 19V9M12 19V5M19 19v-7" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon({ className }: IconProps): ReactElement {
  return (
    <svg className={className} viewBox="0 0 24 24" width={24} height={24} aria-hidden focusable="false">
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PermissionsIcon({ className }: IconProps): ReactElement {
  return (
    <svg className={className} viewBox="0 0 24 24" width={24} height={24} aria-hidden focusable="false">
      <rect x="5" y="11" width="14" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M8 11V8a4 4 0 1 1 8 0v3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TroubleshootingIcon({ className }: IconProps): ReactElement {
  return (
    <svg className={className} viewBox="0 0 24 24" width={24} height={24} aria-hidden focusable="false">
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 8v5M12 16h.01" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function ReleaseNotesIcon({ className }: IconProps): ReactElement {
  return (
    <svg className={className} viewBox="0 0 24 24" width={24} height={24} aria-hidden focusable="false">
      <path
        d="M7 4h10v16l-3-2-2 2-2-2-3 2V4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M9 8h6M9 12h6" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

const CATEGORY_ICONS: Record<DocsCategorySlug, (props: IconProps) => ReactElement> = {
  'getting-started': GettingStartedIcon,
  projects: ProjectsIcon,
  customers: CustomersIcon,
  workflow: WorkflowIcon,
  budget: BudgetIcon,
  payments: PaymentsIcon,
  documents: DocumentsIcon,
  reports: ReportsIcon,
  settings: SettingsIcon,
  permissions: PermissionsIcon,
  troubleshooting: TroubleshootingIcon,
  'release-notes': ReleaseNotesIcon,
};

export function DocsCategoryIcon({ slug }: { readonly slug: DocsCategorySlug }): ReactElement {
  const Icon = CATEGORY_ICONS[slug];
  return <Icon className={styles.docsCategoryIconSvg} />;
}
