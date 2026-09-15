import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth/AuthProvider';
import { ArrowRight, Lock, Mail, AlertCircle, Sparkles, Wand2, CheckCircle2, Loader2 } from 'lucide-react';

export function LoginPage() {
  const { signIn, signInWithMagicLink, isConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMode, setAuthMode] = useState<'password' | 'magic-link'>('password');
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const { error } = await signIn(email.trim(), password);
      if (error) {
        setErrorMsg(error.message || 'Failed to sign in. Please check your email and password.');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter your email address first.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const { error } = await signInWithMagicLink(email.trim());
      if (error) {
        setErrorMsg(error.message || 'Failed to send magic link. Please check your email.');
      } else {
        setMagicLinkSent(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f2] text-[#111111] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Ambient background light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#3157FF]/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-black/10 shadow-xl rounded-3xl p-8 space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#111111] text-white font-bold text-lg shadow-md mb-2">
            O
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111111]">Welcome to OutboundOS</h1>
          <p className="text-xs text-[#666666]">Sign in to manage campaigns, research prospects, and automate outreach.</p>
        </div>

        {!isConfigured && import.meta.env.VITE_USE_MOCK_API === 'true' && (
          <div className="p-3 bg-amber-50 border border-amber-200/60 rounded-xl text-xs text-amber-800 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Mock Mode Active:</span> Demo credentials available for testing.
            </div>
          </div>
        )}

        {/* Mode Selector */}
        <div className="flex bg-[#f5f5f2] p-1 rounded-xl border border-black/5 text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setAuthMode('password');
              setMagicLinkSent(false);
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-lg transition text-center ${
              authMode === 'password'
                ? 'bg-white text-[#111] shadow-sm font-semibold'
                : 'text-[#666] hover:text-[#111]'
            }`}
          >
            Password Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('magic-link');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-lg transition text-center ${
              authMode === 'magic-link'
                ? 'bg-white text-[#111] shadow-sm font-semibold'
                : 'text-[#666] hover:text-[#111]'
            }`}
          >
            Magic Link
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {authMode === 'magic-link' && magicLinkSent ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-emerald-900">Check your inbox</h3>
            <p className="text-xs text-emerald-750 text-[#444] leading-relaxed">
              We sent a magic sign-in link to <span className="font-semibold text-emerald-900">{email}</span>. Click the link in the email to sign in instantly.
            </p>
            <button
              onClick={() => setMagicLinkSent(false)}
              className="text-xs text-[#3157FF] hover:underline font-medium pt-2 block mx-auto"
            >
              Didn't get the email? Try again
            </button>
          </div>
        ) : authMode === 'magic-link' ? (
          <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#444444] mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#999999] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#f9f9f8] border border-black/10 rounded-xl text-sm outline-none focus:border-[#3157FF] focus:bg-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-[#3157FF] hover:bg-[#2545D9] text-white rounded-xl text-sm font-medium transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending Link...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Send Magic Link
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#444444] mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#999999] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#f9f9f8] border border-black/10 rounded-xl text-sm outline-none focus:border-[#3157FF] focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#444444] uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-[#3157FF] hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#999999] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#f9f9f8] border border-black/10 rounded-xl text-sm outline-none focus:border-[#3157FF] focus:bg-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-[#111111] hover:bg-black text-white rounded-xl text-sm font-medium transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="text-center pt-2 border-t border-black/5">
          <p className="text-xs text-[#666666]">
            Don't have an account yet?{' '}
            <Link to="/signup" className="text-[#3157FF] font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Named alias for backward compatibility
export const LoginView = LoginPage;
