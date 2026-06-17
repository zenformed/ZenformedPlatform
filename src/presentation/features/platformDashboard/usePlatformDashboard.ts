'use client';

import type { SettingsCategoryId } from '@zenformed/core/organization-settings';
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

  organizationRoleLabel: string | null;

  isAdmin: boolean;

  avatarUrl: string | null;

  avatarLoading: boolean;

  refetchAvatar: () => Promise<void>;

  getAccessToken: () => string | null;

  settingsOpen: boolean;

  settingsInitialCategory: SettingsCategoryId;

  openSettings: (category?: SettingsCategoryId) => void;

  closeSettings: () => void;

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

  const { user, session, loading: authLoading, organizationMembershipContext } = useSaaSProfile();

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

  const [settingsInitialCategory, setSettingsInitialCategory] =
    useState<SettingsCategoryId>('account');

  const openSettings = useCallback((category: SettingsCategoryId = 'account') => {
    setSettingsInitialCategory(category);
    setSettingsOpen(true);
  }, []);

  const closeSettings = useCallback(() => {
    setSettingsOpen(false);
    setSettingsInitialCategory('account');
  }, []);

  const [signOutModalOpen, setSignOutModalOpen] = useState(false);

  const [profilePhotoModalOpen, setProfilePhotoModalOpen] = useState(false);

  const [sidebarNav, setSidebarNav] = useState<PlatformSidebarNavId>('home');

  const organizationRoleLabel = formatOrganizationRoleLabel(organizationMembershipContext?.role);

  const isAdmin = computePlatformIsAdmin(env.isSaasMode, dashboardUser);



  return {

    user: dashboardUser,

    authLoading,

    signOut,

    shopName,

    logoUrl,

    brandingLoading,

    organizationRoleLabel,

    isAdmin,

    avatarUrl,

    avatarLoading,

    refetchAvatar,

    getAccessToken,

    settingsOpen,

    settingsInitialCategory,

    openSettings,

    closeSettings,

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

