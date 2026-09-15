import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Mail, Search, Sparkles, Target, Users } from 'lucide-react';
import { useWorkspace } from '../../lib/workspaces/WorkspaceProvider';
import { useAuth } from '../../lib/auth/AuthProvider';

export interface OnboardingProfile {
  workspaceName: string;
  role: string;
  industry: string;
  geography: string;
  companySize: string;
  offer: string;
  mailboxProvider: 'Google Workspace' | 'Microsoft 365' | 'Set up later';
  mailboxStatus: 'connected' | 'pending';
  completedAt: string;
}

interface OnboardingFlowProps {
  onComplete: (profile: OnboardingProfile) => void;
  initialProfile?: Partial<OnboardingProfile>;
}

const steps = [
  { label: 'Workspace', icon: Sparkles },
  { label: 'Ideal customer', icon: Target },
  { label: 'Mailbox', icon: Mail },
  { label: 'Ready', icon: Check },
];

export function OnboardingFlow({ onComplete, initialProfile }: OnboardingFlowProps) {
  const { workspace, updateWorkspace, createWorkspace, refreshWorkspaces } = useWorkspace();
  const { profile, updateProfile, refreshProfile } = useAuth();

  const [step, setStep] = useState(0);
  const [workspaceName, setWorkspaceName] = useState(initialProfile?.workspaceName || workspace?.name || '');
  const [role, setRole] = useState(initialProfile?.role || profile?.role || 'Agency / consultancy');
  const [industry, setIndustry] = useState(initialProfile?.industry || workspace?.industry || '');
  const [geography, setGeography] = useState(initialProfile?.geography || workspace?.geography || '');
  const [companySize, setCompanySize] = useState(initialProfile?.companySize || workspace?.company_size || '5–50 employees');
  const [offer, setOffer] = useState(initialProfile?.offer || workspace?.offer || '');
  const [mailboxProvider, setMailboxProvider] = useState<OnboardingProfile['mailboxProvider']>(
    initialProfile?.mailboxProvider || (workspace?.mailbox_provider as any) || 'Set up later'
  );
  const [isSaving, setIsSaving] = useState(false);

  const canContinue = useMemo(() => {
    if (step === 0) return workspaceName.trim().length >= 2;
    if (step === 1) return industry.trim().length >= 2 && geography.trim().length >= 2 && offer.trim().length >= 2;
    return true;
  }, [step, workspaceName, industry, geography, offer]);

  const finish = async () => {
    setIsSaving(true);
    try {
      const onboardingData: OnboardingProfile = {
        workspaceName: workspaceName.trim(),
        role,
        industry: industry.trim(),
        geography: geography.trim(),
        companySize,
        offer: offer.trim(),
        mailboxProvider,
        mailboxStatus: mailboxProvider === 'Set up later' ? 'pending' : 'pending',
        completedAt: new Date().toISOString(),
      };

      // 1. Update user profile with role and mark onboarding completed
      await updateProfile({
        role,
        onboarding_completed: true,
      });

      // 2. Create or update workspace and add user to workspace_members as owner
      if (workspace) {
        await updateWorkspace({
          name: onboardingData.workspaceName,
          industry: onboardingData.industry,
          geography: onboardingData.geography,
          company_size: onboardingData.companySize,
          offer: onboardingData.offer,
          mailbox_provider: onboardingData.mailboxProvider,
          onboarding_completed_at: onboardingData.completedAt,
        });
      } else {
        await createWorkspace({
          name: onboardingData.workspaceName,
          industry: onboardingData.industry,
          geography: onboardingData.geography,
          company_size: onboardingData.companySize,
          offer: onboardingData.offer,
          mailbox_provider: onboardingData.mailboxProvider,
          onboarding_completed_at: onboardingData.completedAt,
        });
      }

      await refreshWorkspaces();
      await refreshProfile();

      onComplete(onboardingData);
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <main className="min-h-screen bg-[#f5f5f2] text-[#111111] p-4 sm:p-8 flex items-center justify-center relative overflow-hidden">
      <div className="absolute -top-40 -right-24 w-[420px] h-[420px] rounded-full bg-[#3157FF]/10 blur-3xl" />
      <div className="absolute -bottom-48 -left-24 w-[460px] h-[460px] rounded-full bg-[#f59e0b]/10 blur-3xl" />

      <section className="relative w-full max-w-5xl grid lg:grid-cols-[0.82fr_1.18fr] bg-white/90 backdrop-blur-xl border border-black/[0.08] rounded-[28px] shadow-[0_24px_80px_rgba(17,17,17,0.12)] overflow-hidden">
        <aside className="bg-[#111111] text-white p-7 sm:p-10 flex flex-col justify-between min-h-[260px] lg:min-h-[660px]">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white text-[#111111] flex items-center justify-center font-bold">O</div>
              <span className="font-semibold tracking-tight">OutboundOS</span>
            </div>
            <div className="mt-16 max-w-xs">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/45 font-semibold">Start with signal</p>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.04em] leading-[1.05] mt-3">Build an outbound system that knows why each lead matters.</h1>
              <p className="text-sm text-white/60 leading-relaxed mt-5">We’ll use your answers to shape discovery, research, messaging, and campaign defaults.</p>
            </div>
          </div>
          <div className="hidden lg:block mt-12 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <div className="flex items-center gap-2 text-sm font-medium"><Users className="w-4 h-4 text-[#a9b9ff]" /> Your workspace stays yours</div>
            <p className="text-xs text-white/50 mt-2 leading-relaxed">Nothing is sent during setup. You review every audience, message, and mailbox before launch.</p>
          </div>
        </aside>

        <div className="p-6 sm:p-10 flex flex-col min-h-[620px]">
          <div className="flex items-center gap-2 mb-10">
            {steps.map((item, index) => {
              const Icon = item.icon;
              const active = index === step;
              const complete = index < step;
              return (
                <div key={item.label} className="flex items-center gap-2 flex-1 last:flex-none">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-semibold ${complete ? 'bg-[#3157FF] border-[#3157FF] text-white' : active ? 'border-[#3157FF] text-[#3157FF] bg-blue-50' : 'border-black/10 text-[#999]'}`}>
                    {complete ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`hidden sm:block text-[11px] font-medium ${active ? 'text-[#111]' : 'text-[#999]'}`}>{item.label}</span>
                  {index < steps.length - 1 && <div className={`h-px flex-1 min-w-3 ${index < step ? 'bg-[#3157FF]' : 'bg-black/10'}`} />}
                </div>
              );
            })}
          </div>

          <div className="flex-1">
            {step === 0 && (
              <div className="max-w-lg space-y-6">
                <div><p className="text-xs font-semibold uppercase tracking-wider text-[#3157FF]">Step 1</p><h2 className="text-2xl font-semibold tracking-tight mt-2">Tell us about your workspace</h2><p className="text-sm text-[#686868] mt-2">This controls the language and defaults you’ll see throughout the app.</p></div>
                <label className="block space-y-2"><span className="text-sm font-medium">Workspace name</span><input autoFocus value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} placeholder="e.g. Northstar Growth" className="w-full px-4 py-3 rounded-xl border border-black/10 bg-[#fafaf8] outline-none focus:border-[#3157FF] focus:ring-4 focus:ring-blue-500/10" /></label>
                <label className="block space-y-2"><span className="text-sm font-medium">Your role</span><select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-black/10 bg-[#fafaf8] outline-none focus:border-[#3157FF]"><option>Agency / consultancy</option><option>Founder / operator</option><option>Sales team</option><option>Freelancer</option></select></label>
              </div>
            )}

            {step === 1 && (
              <div className="max-w-lg space-y-6">
                <div><p className="text-xs font-semibold uppercase tracking-wider text-[#3157FF]">Step 2</p><h2 className="text-2xl font-semibold tracking-tight mt-2">Define your best-fit customer</h2><p className="text-sm text-[#686868] mt-2">These become the starting filters for discovery and scoring.</p></div>
                <div className="grid sm:grid-cols-2 gap-4"><label className="block space-y-2"><span className="text-sm font-medium">Industry</span><input autoFocus value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. kitchen remodelers" className="w-full px-4 py-3 rounded-xl border border-black/10 bg-[#fafaf8] outline-none focus:border-[#3157FF]" /></label><label className="block space-y-2"><span className="text-sm font-medium">Geography</span><input value={geography} onChange={(e) => setGeography(e.target.value)} placeholder="e.g. Texas" className="w-full px-4 py-3 rounded-xl border border-black/10 bg-[#fafaf8] outline-none focus:border-[#3157FF]" /></label></div>
                <label className="block space-y-2"><span className="text-sm font-medium">Company size</span><select value={companySize} onChange={(e) => setCompanySize(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-black/10 bg-[#fafaf8] outline-none focus:border-[#3157FF]"><option>1–4 employees</option><option>5–50 employees</option><option>51–200 employees</option><option>201+ employees</option></select></label>
                <label className="block space-y-2"><span className="text-sm font-medium">What are you offering?</span><textarea value={offer} onChange={(e) => setOffer(e.target.value)} placeholder="e.g. conversion-focused website redesigns" rows={3} className="w-full px-4 py-3 rounded-xl border border-black/10 bg-[#fafaf8] outline-none focus:border-[#3157FF] resize-none" /></label>
              </div>
            )}

            {step === 2 && (
              <div className="max-w-lg space-y-6">
                <div><p className="text-xs font-semibold uppercase tracking-wider text-[#3157FF]">Step 3</p><h2 className="text-2xl font-semibold tracking-tight mt-2">Choose your sending setup</h2><p className="text-sm text-[#686868] mt-2">You can connect a mailbox now or finish setup later. Nothing sends until you approve it.</p></div>
                <div className="grid sm:grid-cols-2 gap-3"><button onClick={() => setMailboxProvider('Google Workspace')} className={`text-left p-4 rounded-2xl border transition ${mailboxProvider === 'Google Workspace' ? 'border-[#3157FF] bg-blue-50/60' : 'border-black/10 hover:border-black/20'}`}><Mail className="w-5 h-5 text-[#3157FF]" /><p className="font-semibold text-sm mt-4">Google Workspace</p><p className="text-xs text-[#686868] mt-1">Connect Gmail with OAuth when the backend is enabled.</p></button><button onClick={() => setMailboxProvider('Microsoft 365')} className={`text-left p-4 rounded-2xl border transition ${mailboxProvider === 'Microsoft 365' ? 'border-[#3157FF] bg-blue-50/60' : 'border-black/10 hover:border-black/20'}`}><Mail className="w-5 h-5 text-[#3157FF]" /><p className="font-semibold text-sm mt-4">Microsoft 365</p><p className="text-xs text-[#686868] mt-1">Connect Outlook with OAuth when the backend is enabled.</p></button></div>
                <button onClick={() => setMailboxProvider('Set up later')} className={`w-full text-left p-4 rounded-2xl border transition ${mailboxProvider === 'Set up later' ? 'border-[#111] bg-stone-50' : 'border-black/10 hover:border-black/20'}`}><p className="font-semibold text-sm">I’ll set up a mailbox later</p><p className="text-xs text-[#686868] mt-1">You can explore the workspace, but sending remains locked until a mailbox is connected.</p></button>
              </div>
            )}

            {step === 3 && (
              <div className="max-w-lg space-y-6"><div><p className="text-xs font-semibold uppercase tracking-wider text-[#3157FF]">Step 4</p><h2 className="text-2xl font-semibold tracking-tight mt-2">Your workspace is ready</h2><p className="text-sm text-[#686868] mt-2">We’ve prepared your first campaign defaults. You can change everything later.</p></div><div className="rounded-2xl border border-black/10 bg-[#fafaf8] divide-y divide-black/[0.06]"><div className="p-4 flex justify-between gap-4"><span className="text-sm text-[#686868]">Workspace</span><strong className="text-sm text-right">{workspaceName}</strong></div><div className="p-4 flex justify-between gap-4"><span className="text-sm text-[#686868]">Best-fit customer</span><strong className="text-sm text-right">{industry} in {geography}</strong></div><div className="p-4 flex justify-between gap-4"><span className="text-sm text-[#686868]">Mailbox</span><strong className="text-sm text-right">{mailboxProvider === 'Set up later' ? 'Setup pending' : `${mailboxProvider} selected`}</strong></div></div><div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex gap-3"><Search className="w-5 h-5 text-[#3157FF] shrink-0" /><p className="text-sm text-blue-950 leading-relaxed">Next, create a campaign to discover accounts matching your audience. You’ll review every prospect before anything is sent.</p></div></div>
            )}
          </div>

          <div className="flex items-center justify-between pt-8 mt-8 border-t border-black/[0.07]"><button onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0} className="px-4 py-2.5 rounded-xl text-sm font-medium text-[#686868] hover:bg-stone-100 disabled:opacity-30 flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Back</button><button onClick={() => step === steps.length - 1 ? finish() : setStep((current) => current + 1)} disabled={!canContinue} className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-[#3157FF] hover:bg-[#2545D9] disabled:opacity-40 flex items-center gap-2 shadow-[0_8px_20px_rgba(49,87,255,0.18)]">{step === steps.length - 1 ? 'Open workspace' : 'Continue'}{step === steps.length - 1 ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}</button></div>
        </div>
      </section>
    </main>
  );
}
