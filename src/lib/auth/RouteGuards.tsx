import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { Loader2 } from 'lucide-react';
import { LandingPage } from '../../components/marketing/LandingPage';

function AuthLoadingScreen() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-4 select-none">
      <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-black/[0.06]">
        <Loader2 className="w-5 h-5 text-[#3157FF] animate-spin" />
        <span className="text-sm font-medium text-[#111111]">Loading OutboundOS...</span>
      </div>
    </div>
  );
}

/**
 * ProtectedRoute: Requires active authenticated session.
 * If unauthenticated -> redirects to /signin.
 * If authenticated but onboarding is incomplete -> redirects to /onboarding.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, isLoading, isConfigured } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  const isAuthenticated = isConfigured ? Boolean(user) : Boolean(profile);

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (!profile?.onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

/**
 * PublicRoute: For signin, signup, forgot-password.
 * If user is already authenticated:
 * - if onboarding complete -> redirects to /app
 * - if onboarding incomplete -> redirects to /onboarding
 */
export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, isLoading, isConfigured } = useAuth();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  const isAuthenticated = isConfigured ? Boolean(user) : Boolean(profile);

  if (isAuthenticated) {
    if (profile?.onboarding_completed) {
      return <Navigate to="/app" replace />;
    }
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

/**
 * OnboardingRoute: For /onboarding.
 * If unauthenticated -> redirects to /signin.
 * If authenticated and onboarding is completed -> redirects to /app.
 */
export function OnboardingRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, isLoading, isConfigured } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  const isAuthenticated = isConfigured ? Boolean(user) : Boolean(profile);

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (profile?.onboarding_completed) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}

/**
 * RootRoute: For the public root '/'.
 * If unauthenticated -> shows public LandingPage.
 * If authenticated and onboarding complete -> redirects to /app.
 * If authenticated and onboarding incomplete -> redirects to /onboarding.
 */
export function RootRoute() {
  const { user, profile, isLoading, isConfigured } = useAuth();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  const isAuthenticated = isConfigured ? Boolean(user) : Boolean(profile);

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  if (profile?.onboarding_completed) {
    return <Navigate to="/app" replace />;
  }

  return <Navigate to="/onboarding" replace />;
}
