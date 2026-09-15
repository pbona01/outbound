import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth/AuthProvider';
import { ArrowLeft, Mail, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const { error } = await resetPassword(email.trim());
      if (error) {
        setErrorMsg(error.message || 'Failed to send password reset email.');
      } else {
        setIsSuccess(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f2] text-[#111111] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#3157FF]/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-black/10 shadow-xl rounded-3xl p-8 space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#111111] text-white font-bold text-lg shadow-md mb-2">
            O
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111111]">Reset password</h1>
          <p className="text-xs text-[#666666]">
            Enter your work email address to receive password reset instructions.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-emerald-900">Check your inbox</h3>
            <p className="text-xs text-[#444] leading-relaxed">
              If an account exists for <span className="font-semibold text-emerald-900">{email}</span>, we have sent instructions to reset your password.
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
              className="w-full py-2.5 px-4 bg-[#111111] hover:bg-black text-white rounded-xl text-sm font-medium transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending Instructions...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-black/5">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-[#666666] hover:text-[#111111] font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

// Named alias for backward compatibility
export const ForgotPasswordView = ForgotPasswordPage;
