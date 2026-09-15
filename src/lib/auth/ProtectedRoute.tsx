import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, profile, isLoading, isConfigured } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f2] flex flex-col items-center justify-center p-4 select-none">
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-black/5">
          <Loader2 className="w-5 h-5 text-[#3157FF] animate-spin" />
          <span className="text-sm font-medium text-[#111]">Loading OutboundOS...</span>
        </div>
      </div>
    );
  }

  // Determine authentication
  const isAuthenticated = isConfigured ? Boolean(user) : Boolean(profile);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated but onboarding is pending, redirect to /onboarding
  const isOnboardingRoute = location.pathname === '/onboarding';
  const hasCompletedOnboarding = Boolean(profile?.onboarding_completed);

  if (!hasCompletedOnboarding && !isOnboardingRoute) {
    return <Navigate to="/onboarding" replace />;
  }

  if (hasCompletedOnboarding && isOnboardingRoute) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
