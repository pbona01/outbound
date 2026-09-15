import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth/AuthProvider';
import { ArrowRight, Lock, Mail, User, AlertCircle, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';

export function SignupPage() {
  const { signUp, isConfigured } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationRequired, setConfirmationRequired] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const { error } = await signUp(email.trim(), password, fullName.trim());
      if (error) {
        setErrorMsg(error.message || 'Failed to create account. Please try again.');
      } else {
        // If Supabase requires email verification, show message; otherwise direct to onboarding
        if (isConfigured) {
          navigate('/onboarding', { replace: true });
        } else {
          navigate('/onboarding', { replace: true });
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f2] text-[#111111] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#3157FF]/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-black/10 shadow-xl rounded-3xl p-8 space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#111111] text-white font-bold text-lg shadow-md mb-2">
            O
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111111]">Create your workspace</h1>
          <p className="text-xs text-[#666666]">Start researching high-converting prospect accounts today.</p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {confirmationRequired ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-emerald-900">Confirmation email sent</h3>
            <p className="text-xs text-[#444] leading-relaxed">
              We have sent a verification link to <span className="font-semibold text-emerald-900">{email}</span>. Click the link to complete registration.
            </p>
            <Link
              to="/login"
              className="text-xs text-[#3157FF] hover:underline font-medium pt-2 block"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#444444] mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#999999] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#f9f9f8] border border-black/10 rounded-xl text-sm outline-none focus:border-[#3157FF] focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#444444] mb-1.5 uppercase tracking-wider">
                Work Email
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
              <label className="block text-xs font-semibold text-[#444444] mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#999999] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
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
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="text-center pt-2 border-t border-black/5">
          <p className="text-xs text-[#666666]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#3157FF] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Named alias for backward compatibility
export const SignUpView = SignupPage;
