import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { platformAppDefinition } from '@/platform/appDefinitions/platform';
import { PlatformHomePageView } from '@/presentation/components/Home/PlatformHomePageView';

export const metadata: Metadata = {
  title: platformAppDefinition.rootMetadataTitle ?? platformAppDefinition.displayName,
  description: platformAppDefinition.description,
};

export default function HomePage(): ReactElement {
  return <PlatformHomePageView />;
}
