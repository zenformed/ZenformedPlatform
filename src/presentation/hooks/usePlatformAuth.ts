'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Session, User } from '@supabase/supabase-js';
import {
  signInWithGoogle,
  signInWithPassword,
  signUpWithPassword,
  waitForSupabaseAuthSessionSync,
  type SignInWithGoogleResult,
  type SignInWithPasswordResult,
  type SignUpWithPasswordResult,
} from '@zenformed/core/auth';
import { resolvePlatformGoogleOAuthCallbackUrl } from '@/infrastructure/auth/platformGoogleOAuthCallbackUrl';
import { getSupabaseClient } from '@/infrastructure/supabase/supabaseClient';
import { platformNavigation as nav } from '@/platform/navigation/platformNavigation';

export interface UsePlatformAuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<SignInWithPasswordResult>;
  signInWithGoogleOAuth: () => Promise<SignInWithGoogleResult>;
  signUp: (
    email: string,
    password: string,
    options?: {
      firstName?: string | null;
      lastName?: string | null;
      bootstrapDefaultOrganization?: boolean;
      emailRedirectTo?: string | null;
      requireEmailConfirmation?: boolean;
    }
  ) => Promise<SignUpWithPasswordResult>;
  waitForSessionSync: () => Promise<void>;
  signOut: (options?: { redirectTo?: string | null }) => Promise<void>;
}

export function usePlatformAuth(): UsePlatformAuthState {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();
    let cancelled = false;

    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const supabase = getSupabaseClient();
    const result = await signInWithPassword(supabase, email, password);
    if (result.ok) {
      setSession(result.session);
      setUser(result.user);
    }
    return result;
  }, []);

  const signInWithGoogleOAuth = useCallback(async () => {
    return signInWithGoogle(getSupabaseClient(), {
      redirectTo: resolvePlatformGoogleOAuthCallbackUrl(),
    });
  }, []);

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      options?: {
        firstName?: string | null;
        lastName?: string | null;
        bootstrapDefaultOrganization?: boolean;
        emailRedirectTo?: string | null;
        requireEmailConfirmation?: boolean;
      }
    ) => {
      const supabase = getSupabaseClient();
      const result = await signUpWithPassword(supabase, email, password, options);
      if (result.ok && result.session && !result.pendingEmailVerification) {
        setSession(result.session);
        setUser(result.user);
      }
      return result;
    },
    []
  );

  const waitForSessionSync = useCallback(async (): Promise<void> => {
    await waitForSupabaseAuthSessionSync(getSupabaseClient());
  }, []);

  const signOut = useCallback(
    async (options?: { redirectTo?: string | null }) => {
      await getSupabaseClient().auth.signOut();
      setSession(null);
      setUser(null);
      if (options?.redirectTo === null) return;
      router.push(options?.redirectTo ?? nav.routes.login);
    },
    [router]
  );

  return {
    session,
    user,
    isLoading,
    signIn,
    signInWithGoogleOAuth,
    signUp,
    waitForSessionSync,
    signOut,
  };
}
