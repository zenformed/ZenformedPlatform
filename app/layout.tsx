import type { Metadata } from 'next';
import type { ReactElement, ReactNode } from 'react';
import '../styles/globals.css';
import { platformAppDefinition } from '@/platform/appDefinitions/platform';
import { ThemeProvider } from '@/presentation/providers';
import { PlatformRootGate } from '@/presentation/components/PlatformRootGate';

export const dynamic = 'force-dynamic';

const themeStorageKey = platformAppDefinition.themeStorageKey ?? 'zenformed-platform_theme';

export const metadata: Metadata = {
  title: platformAppDefinition.rootMetadataTitle ?? platformAppDefinition.displayName,
  description: platformAppDefinition.description,
};

const themeScript = `
(function() {
  try {
    var t = localStorage.getItem(${JSON.stringify(themeStorageKey)});
    var d = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.dataset.theme = (t === 'dark' || (!t && d)) ? 'dark' : 'light';
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider>
          <PlatformRootGate>{children}</PlatformRootGate>
        </ThemeProvider>
      </body>
    </html>
  );
}
