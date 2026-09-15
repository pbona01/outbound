import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth/AuthProvider';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export function ForgotPasswordView() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const { error } = await resetPassword(email);
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
          <h1 className="text-2xl font-bold tracking-tight text-[#111111]">Reset your password</h1>
          <p className="text-xs text-[#666666]">Enter your registered email address to receive reset instructions.</p>
        </div>

        {isSuccess ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-semibold text-emerald-900">Check your inbox</h3>
            <p className="text-xs text-emerald-700">
              We’ve sent password reset instructions to <span className="font-semibold">{email}</span>.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3157FF] hover:underline pt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
            </Link>
          </div>
        ) : (
          <>
            {errorMsg && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-[#111111] hover:bg-black text-white text-xs font-semibold rounded-xl shadow-md transition disabled:opacity-50"
              >
                {isSubmitting ? 'Sending instructions...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="text-center pt-2">
              <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#666666] hover:text-[#111111]">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
