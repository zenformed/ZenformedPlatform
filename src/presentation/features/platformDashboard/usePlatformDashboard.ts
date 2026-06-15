'use client';



import { useCallback, useRef, useState } from 'react';

import { formatOrganizationRoleLabel } from '@zenformed/core/dashboard-shell';

import { env } from '@/infrastructure/config/env';

import {

  platformDashboardNavigation as nav,

  type PlatformSidebarNavId,

} from '@/platform/navigation/platformDashboardNavigation';

import { usePlatformAuth } from '@/presentation/hooks/usePlatformAuth';

import { useBranding } from '@/presentation/hooks/useBranding';

import { useSaaSProfile } from '@/presentation/hooks/useSaaSProfile';

import { useUserAvatar } from '@/presentation/hooks/useUserAvatar';

import { computePlatformIsAdmin } from '@/presentation/features/platformDashboard/platformDashboardViewModel';



export type PlatformDashboardUser = {

  id: string;

  email: string;

};



export function usePlatformDashboard(): {

  user: PlatformDashboardUser | null;

  authLoading: boolean;

  signOut: () => Promise<void>;

  shopName: string;

  logoUrl: string | null;

  brandingLoading: boolean;

  effectiveLicenseTier: string | undefined;

  organizationRoleLabel: string | null;

  isAdmin: boolean;

  avatarUrl: string | null;

  avatarLoading: boolean;

  refetchAvatar: () => Promise<void>;

  getAccessToken: () => string | null;

  settingsOpen: boolean;

  setSettingsOpen: (open: boolean) => void;

  signOutModalOpen: boolean;

  setSignOutModalOpen: (open: boolean) => void;

  profilePhotoModalOpen: boolean;

  setProfilePhotoModalOpen: (open: boolean) => void;

  sidebarNav: PlatformSidebarNavId;

  setSidebarNav: (id: PlatformSidebarNavId) => void;

  hasAvatarPhoto: boolean;

  refetchBranding: () => Promise<void>;

} {

  const { signOut } = usePlatformAuth();

  const { user, session, profile, loading: authLoading, organizationMembershipContext } = useSaaSProfile();

  const { shopName, logoUrl, isLoading: brandingLoading, refetch: refetchBranding } = useBranding();



  const dashboardUser =

    user?.email != null

      ? {

          id: user.id,

          email: user.email,

        }

      : null;



  const sessionRef = useRef(session);

  sessionRef.current = session;

  const getAccessToken = useCallback(

    (): string | null => (env.isSaasMode ? sessionRef.current?.access_token ?? null : null),

    []

  );



  const { avatarUrl, hasPhoto: hasAvatarPhoto, isLoading: avatarLoading, refetch: refetchAvatar } =

    useUserAvatar(dashboardUser, getAccessToken);



  const [settingsOpen, setSettingsOpen] = useState(false);

  const [signOutModalOpen, setSignOutModalOpen] = useState(false);

  const [profilePhotoModalOpen, setProfilePhotoModalOpen] = useState(false);

  const [sidebarNav, setSidebarNav] = useState<PlatformSidebarNavId>('home');

  const effectiveLicenseTier = profile?.license_tier;

  const organizationRoleLabel = formatOrganizationRoleLabel(organizationMembershipContext?.role);

  const isAdmin = computePlatformIsAdmin(env.isSaasMode, dashboardUser);



  return {

    user: dashboardUser,

    authLoading,

    signOut,

    shopName,

    logoUrl,

    brandingLoading,

    effectiveLicenseTier,

    organizationRoleLabel,

    isAdmin,

    avatarUrl,

    avatarLoading,

    refetchAvatar,

    getAccessToken,

    settingsOpen,

    setSettingsOpen,

    signOutModalOpen,

    setSignOutModalOpen,

    profilePhotoModalOpen,

    setProfilePhotoModalOpen,

    sidebarNav,

    setSidebarNav,

    hasAvatarPhoto,

    refetchBranding,

  };

}



export type UsePlatformDashboardResult = ReturnType<typeof usePlatformDashboard>;

