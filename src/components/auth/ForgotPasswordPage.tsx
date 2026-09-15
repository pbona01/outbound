import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth/AuthProvider';
import { Mail, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const { error } = await resetPassword(email.trim());
      if (error) {
        setErrorMsg(error.message || 'Failed to send recovery instructions.');
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111111] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      <div className="w-full max-w-md bg-white border border-black/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.06)] rounded-3xl p-7 sm:p-8 space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#111111] text-white font-bold text-lg shadow-sm mb-1">
            O
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#111111]">
            Reset your password
          </h1>
          <p className="text-xs text-[#686868]">
            Enter your work email address to receive password reset instructions.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-start gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {success ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-emerald-900">Check your inbox</h3>
            <p className="text-xs text-emerald-800 leading-relaxed">
              We've sent a password reset link to <strong>{email}</strong>.
            </p>
            <Link
              to="/signin"
              className="inline-block mt-2 text-xs font-semibold text-[#3157FF] hover:underline"
            >
              Return to sign in
            </Link>
          </div>
        ) : (
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl text-xs font-medium text-white bg-[#3157FF] hover:bg-[#2545D9] transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending instructions...</span>
                </>
              ) : (
                <>
                  <span>Send reset link</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-black/[0.05]">
          <Link to="/signin" className="text-xs text-[#3157FF] hover:underline font-medium">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
