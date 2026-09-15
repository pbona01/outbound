import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Target,
  FileText,
  Check,
  ArrowRight,
  ArrowLeft,
  Building2,
  User,
  Briefcase,
  Globe,
  Users,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import { useWorkspace } from '../../lib/workspaces/WorkspaceProvider';
import { useAuth } from '../../lib/auth/AuthProvider';

export interface OnboardingData {
  workspaceName: string;
  userName: string;
  userRole: string;
  industry: string;
  geography: string;
  companySize: string;
  customerType: string;
  whatYouSell: string;
  problemSolved: string;
  differentiator: string;
}

const STORAGE_DRAFT_KEY = 'outbound_onboarding_draft';

const STEPS = [
  { id: 0, title: 'Workspace', subtitle: 'Identity & operator', icon: Sparkles },
  { id: 1, title: 'Ideal customer', subtitle: 'Firmographics & ICP', icon: Target },
  { id: 2, title: 'Offer', subtitle: 'Value proposition', icon: FileText },
  { id: 3, title: 'Ready', subtitle: 'Summary & launch', icon: Check },
];

export function OnboardingFlow() {
  const navigate = useNavigate();
  const { workspace, createWorkspace, updateWorkspace, refreshWorkspaces } = useWorkspace();
  const { profile, user, updateProfile, refreshProfile } = useAuth();

  // Step state
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Form fields
  const [workspaceName, setWorkspaceName] = useState('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('Founder / Executive');

  const [industry, setIndustry] = useState('');
  const [geography, setGeography] = useState('');
  const [companySize, setCompanySize] = useState('11–50 employees');
  const [customerType, setCustomerType] = useState('');

  const [whatYouSell, setWhatYouSell] = useState('');
  const [problemSolved, setProblemSolved] = useState('');
  const [differentiator, setDifferentiator] = useState('');

  // Hydrate draft from localStorage or initial user/workspace info
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(STORAGE_DRAFT_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.workspaceName) setWorkspaceName(parsed.workspaceName);
        if (parsed.userName) setUserName(parsed.userName);
        if (parsed.userRole) setUserRole(parsed.userRole);
        if (parsed.industry) setIndustry(parsed.industry);
        if (parsed.geography) setGeography(parsed.geography);
        if (parsed.companySize) setCompanySize(parsed.companySize);
        if (parsed.customerType) setCustomerType(parsed.customerType);
        if (parsed.whatYouSell) setWhatYouSell(parsed.whatYouSell);
        if (parsed.problemSolved) setProblemSolved(parsed.problemSolved);
        if (parsed.differentiator) setDifferentiator(parsed.differentiator);
        return;
      }
    } catch {
      // ignore
    }

    if (profile?.full_name) setUserName(profile.full_name);
    else if (user?.email) setUserName(user.email.split('@')[0]);

    if (workspace?.name) setWorkspaceName(workspace.name);
  }, [profile, user, workspace]);

  // Save draft whenever inputs change
  useEffect(() => {
    const draft: OnboardingData = {
      workspaceName,
      userName,
      userRole,
      industry,
      geography,
      companySize,
      customerType,
      whatYouSell,
      problemSolved,
      differentiator,
    };
    try {
      localStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // ignore
    }
  }, [
    workspaceName,
    userName,
    userRole,
    industry,
    geography,
    companySize,
    customerType,
    whatYouSell,
    problemSolved,
    differentiator,
  ]);

  // Validation per step
  const validateCurrentStep = (): boolean => {
    setErrorMsg('');

    if (currentStep === 0) {
      if (workspaceName.trim().length < 2) {
        setErrorMsg('Please enter a workspace or company name (at least 2 characters).');
        return false;
      }
      if (userName.trim().length < 2) {
        setErrorMsg('Please enter your full name.');
        return false;
      }
      if (!userRole.trim()) {
        setErrorMsg('Please select or enter your role.');
        return false;
      }
      return true;
    }

    if (currentStep === 1) {
      if (industry.trim().length < 2) {
        setErrorMsg('Please specify your target industry.');
        return false;
      }
      if (geography.trim().length < 2) {
        setErrorMsg('Please specify your target geography or region.');
        return false;
      }
      if (customerType.trim().length < 2) {
        setErrorMsg('Please enter the target customer title or persona (e.g., VP of Sales, CTO).');
        return false;
      }
      return true;
    }

    if (currentStep === 2) {
      if (whatYouSell.trim().length < 3) {
        setErrorMsg('Please briefly describe what product or service you sell.');
        return false;
      }
      if (problemSolved.trim().length < 3) {
        setErrorMsg('Please describe the primary problem you solve for customers.');
        return false;
      }
      if (differentiator.trim().length < 3) {
        setErrorMsg('Please explain what makes your offer different or better.');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setErrorMsg('');
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // Step 4 final submission
  const handleFinish = async () => {
    setIsSaving(true);
    setErrorMsg('');

    try {
      // 1. Update user profile
      await updateProfile({
        full_name: userName.trim(),
        role: userRole,
        onboarding_completed: true,
      });

      // 2. Formulate offer summary
      const synthesizedOffer = `${whatYouSell.trim()} — Solving: ${problemSolved.trim()} (${differentiator.trim()})`;

      // 3. Create or update workspace with ICP details
      if (workspace) {
        await updateWorkspace({
          name: workspaceName.trim(),
          industry: industry.trim(),
          geography: geography.trim(),
          company_size: companySize,
          offer: synthesizedOffer,
          mailbox_provider: 'Set up later',
          onboarding_completed_at: new Date().toISOString(),
        });
      } else {
        await createWorkspace({
          name: workspaceName.trim(),
          industry: industry.trim(),
          geography: geography.trim(),
          company_size: companySize,
          offer: synthesizedOffer,
          mailbox_provider: 'Set up later',
        });
      }

      // 4. Refresh auth and workspaces
      await refreshProfile();
      await refreshWorkspaces();

      // Clear draft on successful completion
      localStorage.removeItem(STORAGE_DRAFT_KEY);

      // Redirect to authenticated dashboard
      navigate('/app', { replace: true });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to finalize workspace setup. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-[#111111] p-4 sm:p-6 lg:p-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-4xl bg-white border border-black/[0.08] rounded-3xl shadow-[0_16px_50px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col">
        {/* Header & Step Progress Bar */}
        <div className="p-6 sm:p-8 border-b border-black/[0.06] bg-stone-50/50">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#111111] text-white flex items-center justify-center font-bold text-xs">
                O
              </div>
              <div>
                <span className="text-sm font-semibold tracking-tight text-[#111]">OutboundOS</span>
                <span className="text-xs text-[#888] block">Workspace Setup</span>
              </div>
            </div>

            <div className="text-xs text-[#686868] font-medium">
              Step <span className="text-[#111] font-semibold">{currentStep + 1}</span> of {STEPS.length}
            </div>
          </div>

          {/* Stepper Progress Indicator */}
          <div className="mt-6 grid grid-cols-4 gap-2 sm:gap-3">
            {STEPS.map((s, index) => {
              const isPast = index < currentStep;
              const isCurrent = index === currentStep;
              const Icon = s.icon;
              return (
                <div key={s.id} className="flex flex-col gap-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isPast
                        ? 'bg-[#3157FF]'
                        : isCurrent
                        ? 'bg-[#3157FF]/70'
                        : 'bg-stone-200'
                    }`}
                  />
                  <div className="hidden sm:flex items-center gap-1.5 text-xs">
                    <span
                      className={`font-semibold ${
                        isCurrent ? 'text-[#3157FF]' : isPast ? 'text-[#111]' : 'text-stone-400'
                      }`}
                    >
                      {s.title}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mx-6 sm:mx-8 mt-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-start gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Step Content */}
        <div className="p-6 sm:p-8 flex-1">
          {/* STEP 1: WORKSPACE */}
          {currentStep === 0 && (
            <div className="space-y-5 max-w-xl">
              <div>
                <h2 className="text-xl font-semibold text-[#111] tracking-tight">
                  Set up your workspace
                </h2>
                <p className="text-xs text-[#686868] mt-1">
                  Tell us about your organization and how you'd like your team to appear.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#444] block">Workspace name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      placeholder="e.g. Acme Studio, Northstar Cloud"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-black/[0.1] text-xs text-[#111] placeholder:text-stone-400 focus:outline-none focus:border-[#3157FF] focus:ring-1 focus:ring-[#3157FF] transition bg-white"
                    />
                    <Building2 className="w-4 h-4 text-[#999] absolute left-3 top-3" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#444] block">Your name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="e.g. Elena Vance"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-black/[0.1] text-xs text-[#111] placeholder:text-stone-400 focus:outline-none focus:border-[#3157FF] focus:ring-1 focus:ring-[#3157FF] transition bg-white"
                    />
                    <User className="w-4 h-4 text-[#999] absolute left-3 top-3" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#444] block">Your role</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      'Founder / Executive',
                      'Head of Sales',
                      'SDR / Outbound Lead',
                      'Agency Owner',
                      'Growth Marketer',
                      'Account Executive',
                    ].map((r) => (
                      <button
                        type="button"
                        key={r}
                        onClick={() => setUserRole(r)}
                        className={`p-2.5 rounded-xl border text-xs text-left transition ${
                          userRole === r
                            ? 'bg-blue-50 border-[#3157FF] text-[#3157FF] font-semibold'
                            : 'border-black/[0.08] hover:bg-stone-50 text-[#444]'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: IDEAL CUSTOMER */}
          {currentStep === 1 && (
            <div className="space-y-5 max-w-xl">
              <div>
                <h2 className="text-xl font-semibold text-[#111] tracking-tight">
                  Define your ideal customer (ICP)
                </h2>
                <p className="text-xs text-[#686868] mt-1">
                  We use these parameters to filter target accounts and score buyer intent.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#444] block">Target industry</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder="e.g. B2B SaaS, E-commerce, Fintech, Digital Agencies"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-black/[0.1] text-xs text-[#111] placeholder:text-stone-400 focus:outline-none focus:border-[#3157FF] focus:ring-1 focus:ring-[#3157FF] transition bg-white"
                    />
                    <Briefcase className="w-4 h-4 text-[#999] absolute left-3 top-3" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#444] block">Target geography</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={geography}
                      onChange={(e) => setGeography(e.target.value)}
                      placeholder="e.g. North America, EMEA, United States & Canada, Global"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-black/[0.1] text-xs text-[#111] placeholder:text-stone-400 focus:outline-none focus:border-[#3157FF] focus:ring-1 focus:ring-[#3157FF] transition bg-white"
                    />
                    <Globe className="w-4 h-4 text-[#999] absolute left-3 top-3" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#444] block">Target company size</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      '1–10 employees',
                      '11–50 employees',
                      '51–200 employees',
                      '201–1,000 employees',
                      '1,000+ employees',
                    ].map((sz) => (
                      <button
                        type="button"
                        key={sz}
                        onClick={() => setCompanySize(sz)}
                        className={`p-2.5 rounded-xl border text-xs text-left transition ${
                          companySize === sz
                            ? 'bg-blue-50 border-[#3157FF] text-[#3157FF] font-semibold'
                            : 'border-black/[0.08] hover:bg-stone-50 text-[#444]'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#444] block">
                    Type of customer / Target decision maker
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={customerType}
                      onChange={(e) => setCustomerType(e.target.value)}
                      placeholder="e.g. VP of Sales, Head of Engineering, Founder/CEO, Marketing Director"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-black/[0.1] text-xs text-[#111] placeholder:text-stone-400 focus:outline-none focus:border-[#3157FF] focus:ring-1 focus:ring-[#3157FF] transition bg-white"
                    />
                    <Users className="w-4 h-4 text-[#999] absolute left-3 top-3" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: OFFER */}
          {currentStep === 2 && (
            <div className="space-y-5 max-w-xl">
              <div>
                <h2 className="text-xl font-semibold text-[#111] tracking-tight">
                  Craft your core offer
                </h2>
                <p className="text-xs text-[#686868] mt-1">
                  Our research engine uses these answers to ground opening hooks in real value propositions.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#444] block">What do you sell?</label>
                  <input
                    type="text"
                    value={whatYouSell}
                    onChange={(e) => setWhatYouSell(e.target.value)}
                    placeholder="e.g. B2B conversion rate optimization service & audit"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.1] text-xs text-[#111] placeholder:text-stone-400 focus:outline-none focus:border-[#3157FF] focus:ring-1 focus:ring-[#3157FF] transition bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#444] block">
                    What problem do you solve?
                  </label>
                  <textarea
                    rows={3}
                    value={problemSolved}
                    onChange={(e) => setProblemSolved(e.target.value)}
                    placeholder="e.g. High bounce rates on checkout pages and low visitor-to-demo conversion without needing engineering rewrites."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.1] text-xs text-[#111] placeholder:text-stone-400 focus:outline-none focus:border-[#3157FF] focus:ring-1 focus:ring-[#3157FF] transition bg-white resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#444] block">
                    What makes your offer different?
                  </label>
                  <textarea
                    rows={2}
                    value={differentiator}
                    onChange={(e) => setDifferentiator(e.target.value)}
                    placeholder="e.g. Pay only upon verified lift in pipeline; guaranteed 14-day turnaround."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.1] text-xs text-[#111] placeholder:text-stone-400 focus:outline-none focus:border-[#3157FF] focus:ring-1 focus:ring-[#3157FF] transition bg-white resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: READY */}
          {currentStep === 3 && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Setup Complete
                </div>
                <h2 className="text-xl font-semibold text-[#111] tracking-tight">
                  Your workspace is ready to launch
                </h2>
                <p className="text-xs text-[#686868] mt-1">
                  Review your initial configuration below before opening your dashboard.
                </p>
              </div>

              {/* Summaries */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Workspace Summary */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-black/[0.06] space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-semibold text-[#111] pb-1.5 border-b border-black/[0.05]">
                    <Building2 className="w-3.5 h-3.5 text-[#3157FF]" /> Workspace Summary
                  </div>
                  <div>
                    <span className="text-[#888] block text-[11px]">Workspace Name</span>
                    <span className="font-semibold text-[#111]">{workspaceName}</span>
                  </div>
                  <div>
                    <span className="text-[#888] block text-[11px]">Primary Operator</span>
                    <span className="text-[#222]">
                      {userName} ({userRole})
                    </span>
                  </div>
                </div>

                {/* ICP Summary */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-black/[0.06] space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-semibold text-[#111] pb-1.5 border-b border-black/[0.05]">
                    <Target className="w-3.5 h-3.5 text-[#3157FF]" /> ICP & Audience
                  </div>
                  <div>
                    <span className="text-[#888] block text-[11px]">Industry & Region</span>
                    <span className="font-semibold text-[#111]">
                      {industry} • {geography}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#888] block text-[11px]">Target Accounts</span>
                    <span className="text-[#222]">
                      {companySize} • {customerType}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommended Next Actions */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 text-xs space-y-2.5">
                <span className="font-semibold text-[#3157FF] block text-[11px] uppercase tracking-wider">
                  Recommended Next Steps
                </span>
                <ul className="space-y-1.5 text-[#333]">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3157FF]" />
                    <span>Discover your first 25 target accounts in the Prospects explorer.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3157FF]" />
                    <span>Run AI web inspection on high-fit accounts to uncover commercial signals.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3157FF]" />
                    <span>Build and review your first sequence before launching.</span>
                  </li>
                </ul>
              </div>

              {/* Honest Mailbox Disclaimer */}
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Sending stays locked until setup is complete:</strong> You can connect a
                  Google Workspace or Microsoft 365 mailbox later from Settings. No emails are ever
                  dispatched without your explicit configuration and review.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="p-6 sm:p-8 border-t border-black/[0.06] bg-stone-50/50 flex items-center justify-between">
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl border border-black/[0.1] text-xs font-medium text-[#444] hover:bg-white transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl text-xs font-medium text-white bg-[#3157FF] hover:bg-[#2545D9] transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={isSaving}
              className="px-6 py-3 rounded-xl text-xs font-medium text-white bg-[#3157FF] hover:bg-[#2545D9] transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Configuring workspace...</span>
                </>
              ) : (
                <>
                  <span>Open my dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
