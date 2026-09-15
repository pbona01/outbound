import { FormEvent, useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth/AuthProvider';

type Mode = 'signin' | 'signup' | 'reset';

export function AuthPage({ mode }: { mode: Mode }) {
  const { signIn, signUp, resetPassword, configured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isSignup = mode === 'signup';
  const isReset = mode === 'reset';

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      if (isReset) {
        await resetPassword(email);
        setSuccess('Check your email for a password reset link.');
      } else if (isSignup) {
        await signUp(email, password, name);
        navigate('/onboarding');
      } else {
        await signIn(email, password);
        const from = location.state?.from || '/';
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f5f2] flex items-center justify-center p-5 relative overflow-hidden">
      <div className="absolute -top-40 -right-24 w-[420px] h-[420px] rounded-full bg-[#3157FF]/10 blur-3xl" />
      <div className="relative w-full max-w-md bg-white border border-black/[0.08] rounded-[28px] shadow-[0_24px_80px_rgba(17,17,17,0.1)] p-7 sm:p-10">
        <Link to="/" className="flex items-center gap-2.5 mb-10">
          <span className="w-9 h-9 rounded-xl bg-[#111] text-white flex items-center justify-center font-bold">O</span>
          <span className="font-semibold tracking-tight">Outbound</span>
        </Link>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#3157FF] font-semibold">{isReset ? 'Account recovery' : 'Outbound workspace'}</p>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] mt-3">{isReset ? 'Reset your password' : isSignup ? 'Start your workspace' : 'Welcome back'}</h1>
        <p className="text-sm text-[#686868] mt-2">{isReset ? 'We’ll send you a secure recovery link.' : isSignup ? 'Set up your workspace and find your first best-fit prospects.' : 'Sign in to continue to your outbound workspace.'}</p>
        {!configured && <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">Supabase is not connected on this deployment yet. Add the environment variables before using authentication.</div>}
        <form onSubmit={handleSubmit} className="space-y-4 mt-8">
          {isSignup && <label className="block text-sm font-medium">Your name<input value={name} onChange={e => setName(e.target.value)} required className="mt-2 w-full rounded-xl border border-black/10 bg-[#fafaf8] px-4 py-3 outline-none focus:border-[#3157FF]" placeholder="Alex Morgan" /></label>}
          <label className="block text-sm font-medium">Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-2 w-full rounded-xl border border-black/10 bg-[#fafaf8] px-4 py-3 outline-none focus:border-[#3157FF]" placeholder="you@company.com" /></label>
          {!isReset && <label className="block text-sm font-medium">Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required className="mt-2 w-full rounded-xl border border-black/10 bg-[#fafaf8] px-4 py-3 outline-none focus:border-[#3157FF]" placeholder="At least 6 characters" /></label>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="flex items-center gap-2 text-sm text-emerald-700"><CheckCircle2 className="w-4 h-4" />{success}</p>}
          <button disabled={submitting || !configured} className="w-full rounded-xl bg-[#3157FF] text-white py-3 text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">{submitting ? 'Please wait…' : isReset ? 'Send reset link' : isSignup ? 'Create account' : 'Sign in'} {!submitting && <ArrowRight className="w-4 h-4" />}</button>
        </form>
        <div className="text-center text-sm text-[#686868] mt-7">{isReset ? <Link to="/signin" className="text-[#3157FF] font-medium">Back to sign in</Link> : isSignup ? <>Already have an account? <Link to="/signin" className="text-[#3157FF] font-medium">Sign in</Link></> : <>{location.pathname && <Link to="/signup" className="text-[#3157FF] font-medium">Create an account</Link>}<span className="mx-2">·</span><Link to="/forgot-password" className="text-[#3157FF] font-medium">Forgot password?</Link></>}</div>
      </div>
    </main>
  );
}
