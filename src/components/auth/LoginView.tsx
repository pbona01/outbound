import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth/AuthProvider';
import { ArrowRight, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';

export function LoginView() {
  const { signIn, isConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setErrorMsg(error.message || 'Failed to sign in. Please check your credentials.');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f2] text-[#111111] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background ambient light */}
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

        {!isConfigured && (
          <div className="p-3 bg-amber-50 border border-amber-200/60 rounded-xl text-xs text-amber-800 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Dev Mode Active:</span> Supabase environment variables are not set. You can sign in with any email to preview local workspace functionality.
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#333333] mb-1.5">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@company.com"
                className="w-full pl-10 pr-4 py-2.5 bg-[#f9f9f8] border border-black/10 rounded-xl text-xs focus:outline-none focus:border-[#3157FF] focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#333333]">Password</label>
              <Link to="/forgot-password" className="text-[11px] font-medium text-[#3157FF] hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-[#f9f9f8] border border-black/10 rounded-xl text-xs focus:outline-none focus:border-[#3157FF] focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-[#111111] hover:bg-black text-white text-xs font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-[#666666]">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-[#3157FF] hover:underline">
            Create workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
