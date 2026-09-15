import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth/AuthProvider';
import {
  ArrowRight,
  Lock,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export function SigninPage() {
  const { signIn, profile, isConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Read target return path if redirected by a route guard
  const from = (location.state as any)?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const { error } = await signIn(email.trim(), password);
      if (error) {
        setErrorMsg(
          error.message || 'Invalid email or password. Please double-check your credentials.'
        );
      } else {
        // Successful login: if profile indicates onboarding is incomplete, redirect to /onboarding, otherwise /app
        const targetPath = from && from !== '/signin' && from !== '/signup' ? from : '/app';
        navigate(targetPath, { replace: true });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111111] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#3157FF]/[0.06] blur-3xl pointer-events-none" />

      {/* Back to marketing link */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-medium text-[#686868] hover:text-[#111111] transition"
        >
          <div className="w-6 h-6 rounded-lg bg-[#111] text-white flex items-center justify-center text-xs font-bold">
            O
          </div>
          <span>OutboundOS</span>
        </Link>
      </div>

      <div className="w-full max-w-md bg-white border border-black/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.06)] rounded-3xl p-7 sm:p-8 space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#111111] text-white font-bold text-lg shadow-sm mb-1">
            O
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#111111]">
            Welcome back to Outbound
          </h1>
          <p className="text-xs text-[#686868]">
            Sign in to access your campaigns, accounts, and discovery pipeline.
          </p>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-start gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#444] block">Work email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-black/[0.1] text-xs text-[#111] placeholder:text-stone-400 focus:outline-none focus:border-[#3157FF] focus:ring-1 focus:ring-[#3157FF] transition bg-white"
              />
              <Mail className="w-4 h-4 text-[#999] absolute left-3 top-3" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[#444]">Password</label>
              <Link
                to="/forgot-password"
                className="text-[11px] text-[#3157FF] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-black/[0.1] text-xs text-[#111] placeholder:text-stone-400 focus:outline-none focus:border-[#3157FF] focus:ring-1 focus:ring-[#3157FF] transition bg-white"
              />
              <Lock className="w-4 h-4 text-[#999] absolute left-3 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-[#999] hover:text-[#333] transition"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl text-xs font-medium text-white bg-[#3157FF] hover:bg-[#2545D9] transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-3"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign in</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-black/[0.05]">
          <p className="text-xs text-[#686868]">
            Don't have an Outbound account?{' '}
            <Link to="/signup" className="text-[#3157FF] font-semibold hover:underline">
              Create workspace
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
