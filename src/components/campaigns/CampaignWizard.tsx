import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Send,
  Loader2,
  X,
  AlertCircle,
  CloudOff,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { Campaign, Prospect } from '../../types';
import { useAuth } from '../../lib/auth/AuthProvider';
import { useWorkspace } from '../../lib/workspaces/WorkspaceProvider';
import { useAppState } from '../../lib/state/AppStateContext';

interface CampaignWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchCampaign: (campaign: Partial<Campaign>, prospects?: Prospect[]) => Promise<Campaign | void>;
  onShowToast: (title: string, description?: string, type?: 'success' | 'info' | 'error') => void;
}

export function CampaignWizard({
  isOpen,
  onClose,
  onLaunchCampaign,
  onShowToast,
}: CampaignWizardProps) {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { workspace } = useWorkspace();
  const { discoverProspects, sequences, createSequence } = useAppState();

  const defaultEmail =
    profile?.email ||
    user?.email ||
    (workspace?.name
      ? `${workspace.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@company.com`
      : 'sender@workspace.com');

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form state
  const [campaignName, setCampaignName] = useState('');
  const [naturalQuery, setNaturalQuery] = useState('');
  const [targetIndustry, setTargetIndustry] = useState('');
  const [targetGeo, setTargetGeo] = useState('');
  const [sendingEmail, setSendingEmail] = useState('');
  const [dailyLimit, setDailyLimit] = useState(40);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Discovery state
  const [discoveryState, setDiscoveryState] = useState<
    'idle' | 'searching' | 'returned' | 'empty' | 'unavailable'
  >('idle');
  const [discoveredProspects, setDiscoveredProspects] = useState<Prospect[]>([]);
  const [selectedDiscoveredIds, setSelectedDiscoveredIds] = useState<Set<string>>(new Set());

  // Sequence template
  const [selectedTemplate, setSelectedTemplate] = useState<'Value-led' | 'Direct' | 'Gentle'>('Value-led');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setCampaignName(workspace?.name ? `${workspace.name} Outbound` : 'Q3 Regional Outbound');
      setNaturalQuery(workspace?.offer ? `Companies needing ${workspace.offer}` : 'Mid-market businesses with high traffic websites');
      setTargetIndustry(workspace?.industry || 'Technology & Business Services');
      setTargetGeo(workspace?.geography || 'North America');
      setSendingEmail(defaultEmail);
      setDailyLimit(40);
      setErrors({});
      setDiscoveryState('idle');
      setDiscoveredProspects([]);
      setSelectedDiscoveredIds(new Set());
    }
  }, [isOpen, workspace, defaultEmail]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Step 1 Validation
  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!campaignName.trim() || campaignName.trim().length < 2) {
      errs.campaignName = 'Campaign name is required (minimum 2 characters).';
    }
    if (!naturalQuery.trim() || naturalQuery.trim().length < 5) {
      errs.naturalQuery = 'Audience query / description is required (minimum 5 characters).';
    }
    if (!targetIndustry.trim()) {
      errs.targetIndustry = 'Target industry is required.';
    }
    if (!targetGeo.trim()) {
      errs.targetGeo = 'Target geography is required.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!sendingEmail.trim() || !emailRegex.test(sendingEmail.trim())) {
      errs.sendingEmail = 'A valid sender mailbox address is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Run discovery when navigating to Step 2
  const runDiscovery = async () => {
    setDiscoveryState('searching');
    try {
      const results = await discoverProspects({
        query: naturalQuery,
        industry: targetIndustry,
        geography: targetGeo,
      });

      if (results && results.length > 0) {
        setDiscoveredProspects(results);
        setSelectedDiscoveredIds(new Set(results.map((p) => p.id)));
        setDiscoveryState('returned');
      } else {
        setDiscoveredProspects([]);
        setDiscoveryState('empty');
      }
    } catch {
      setDiscoveredProspects([]);
      setDiscoveryState('unavailable');
    }
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      setCurrentStep(2);
      await runDiscovery();
    } else if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleLaunchOrDraft = async (status: 'active' | 'draft') => {
    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      // If sequences is empty, create a sequence record for the template
      if (sequences.length === 0) {
        try {
          await createSequence(`${campaignName} Sequence`, selectedTemplate);
        } catch (seqErr) {
          console.warn('Could not initialize template sequence:', seqErr);
        }
      }

      const selectedProspects = discoveredProspects.filter((p) => selectedDiscoveredIds.has(p.id));

      const launched = await onLaunchCampaign({
        name: campaignName.trim(),
        audienceQuery: naturalQuery.trim(),
        targetIndustry: targetIndustry.trim(),
        targetGeography: targetGeo.trim(),
        status,
        mailboxEmail: sendingEmail.trim(),
        dailyLimit,
        sequenceStepsCount: 3,
        stats: {
          prospects: selectedDiscoveredIds.size,
          contacted: 0,
          sent: 0,
          replies: 0,
          positiveReplies: 0,
          meetings: 0,
        },
      }, selectedProspects);

      onShowToast(
        status === 'active' ? 'Campaign Launched' : 'Draft Saved',
        `"${campaignName}" created successfully.`
      );
      onClose();

      if (launched && launched.id) {
        navigate(`/campaigns/${launched.id}`);
      }
    } catch (err: any) {
      onShowToast('Error', err.message || 'Failed to create campaign in Supabase', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="campaign-wizard-modal"
      className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="campaign-wizard-title"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 8 }}
        className="relative w-full max-w-2xl bg-white rounded-2xl border border-black/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col max-h-[90vh] z-10"
      >
        {/* Wizard Header with Steps */}
        <div className="p-5 border-b border-black/[0.06] flex items-center justify-between bg-white shrink-0">
          <div>
            <div className="flex items-center gap-2" id="campaign-wizard-title">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#3157FF]">
                Step {currentStep} of 4
              </span>
              <span className="text-[12px] text-[#949494]">•</span>
              <span className="text-[13px] font-medium text-[#111111]">
                {currentStep === 1 && 'Audience Criteria'}
                {currentStep === 2 && 'Prospect Discovery'}
                {currentStep === 3 && 'Sequence Cadence'}
                {currentStep === 4 && 'Review & Save'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#949494] hover:text-[#111111] rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wizard Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: AUDIENCE CRITERIA & CONFIG */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-[18px] font-semibold text-[#111111]">Define Audience Criteria</h2>
                <p className="text-[13px] text-[#686868] mt-0.5">
                  Specify the target ICP criteria and mailbox settings for this campaign.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[12px] font-medium text-[#111111] block mb-1">
                    Campaign Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="e.g. Northeast Commercial Contractors"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-[13px] text-[#111111] placeholder:text-[#949494] focus:outline-none focus:ring-1 focus:ring-[#3157FF] ${
                      errors.campaignName ? 'border-rose-300 bg-rose-50/20' : 'border-black/[0.08] bg-white'
                    }`}
                  />
                  {errors.campaignName && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.campaignName}</p>
                  )}
                </div>

                <div>
                  <label className="text-[12px] font-medium text-[#111111] block mb-1">
                    Audience Description / Natural Query <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={naturalQuery}
                    onChange={(e) => setNaturalQuery(e.target.value)}
                    placeholder="Describe your target buyer, title, and key operational signals..."
                    className={`w-full px-3.5 py-2 rounded-xl border text-[13px] text-[#111111] placeholder:text-[#949494] focus:outline-none focus:ring-1 focus:ring-[#3157FF] resize-none ${
                      errors.naturalQuery ? 'border-rose-300 bg-rose-50/20' : 'border-black/[0.08] bg-white'
                    }`}
                  />
                  {errors.naturalQuery && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.naturalQuery}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[12px] font-medium text-[#111111] block mb-1">
                      Target Industry <span className="text-rose-500">*</span>
                    </label>
                    <input
                      value={targetIndustry}
                      onChange={(e) => setTargetIndustry(e.target.value)}
                      placeholder="e.g. Construction & Exterior"
                      className={`w-full px-3.5 py-2 rounded-xl border text-[13px] text-[#111111] placeholder:text-[#949494] focus:outline-none focus:ring-1 focus:ring-[#3157FF] ${
                        errors.targetIndustry ? 'border-rose-300 bg-rose-50/20' : 'border-black/[0.08] bg-white'
                      }`}
                    />
                    {errors.targetIndustry && (
                      <p className="text-[11px] text-rose-600 mt-1">{errors.targetIndustry}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[12px] font-medium text-[#111111] block mb-1">
                      Target Geography <span className="text-rose-500">*</span>
                    </label>
                    <input
                      value={targetGeo}
                      onChange={(e) => setTargetGeo(e.target.value)}
                      placeholder="e.g. Florida, United States"
                      className={`w-full px-3.5 py-2 rounded-xl border text-[13px] text-[#111111] placeholder:text-[#949494] focus:outline-none focus:ring-1 focus:ring-[#3157FF] ${
                        errors.targetGeo ? 'border-rose-300 bg-rose-50/20' : 'border-black/[0.08] bg-white'
                      }`}
                    />
                    {errors.targetGeo && (
                      <p className="text-[11px] text-rose-600 mt-1">{errors.targetGeo}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[12px] font-medium text-[#111111] block mb-1">
                      Sending Mailbox <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={sendingEmail}
                      onChange={(e) => setSendingEmail(e.target.value)}
                      placeholder="sender@company.com"
                      className={`w-full px-3.5 py-2 rounded-xl border text-[13px] font-mono text-[#111111] placeholder:text-[#949494] focus:outline-none focus:ring-1 focus:ring-[#3157FF] ${
                        errors.sendingEmail ? 'border-rose-300 bg-rose-50/20' : 'border-black/[0.08] bg-white'
                      }`}
                    />
                    {errors.sendingEmail && (
                      <p className="text-[11px] text-rose-600 mt-1">{errors.sendingEmail}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[12px] font-medium text-[#111111] block mb-1">
                      Daily Send Cap
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={200}
                      value={dailyLimit}
                      onChange={(e) => setDailyLimit(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-black/[0.08] text-[13px] text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#3157FF]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: DISCOVERY STATUS */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-[18px] font-semibold text-[#111111]">Prospect Discovery</h2>
                <p className="text-[13px] text-[#686868] mt-0.5">
                  Searching commercial records for accounts matching your criteria.
                </p>
              </div>

              {/* Criteria Summary Card */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-black/[0.05] text-[12px] space-y-1">
                <div className="flex items-center justify-between text-[#686868]">
                  <span>Submitted Criteria:</span>
                  <span className="font-medium text-[#111111]">{targetIndustry} • {targetGeo}</span>
                </div>
                <div className="text-[11px] text-[#949494] truncate">"{naturalQuery}"</div>
              </div>

              {/* State: Searching */}
              {discoveryState === 'searching' && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 border border-black/[0.06] rounded-2xl bg-[#F7F7F5]/40">
                  <Loader2 className="w-6 h-6 text-[#3157FF] animate-spin" />
                  <div>
                    <p className="text-[14px] font-medium text-[#111111]">Querying Discovery Engine...</p>
                    <p className="text-[12px] text-[#686868] mt-0.5">
                      Checking regional registries and verifying deliverability status.
                    </p>
                  </div>
                </div>
              )}

              {/* State: Provider Unavailable */}
              {discoveryState === 'unavailable' && (
                <div className="p-5 rounded-2xl border border-amber-200/80 bg-amber-50/50 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
                      <CloudOff className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-[14px] font-semibold text-amber-900">
                        Discovery provider not connected
                      </h3>
                      <p className="text-[12px] text-amber-800 leading-relaxed">
                        Automated web crawling and domain enrichment requires a connected discovery provider (/api/discovery).
                        No simulated or fake leads will be injected.
                      </p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/80 border border-amber-200/60 text-[12px] text-[#686868]">
                    <strong className="text-[#111111] font-medium block mb-0.5">What happens next:</strong>
                    You can finish creating this campaign now with 0 prospects. Once created, you can link accounts manually or perform individual research in the AI Research Lab.
                  </div>
                </div>
              )}

              {/* State: No Results */}
              {discoveryState === 'empty' && (
                <div className="py-10 text-center space-y-2 border border-black/[0.06] rounded-2xl bg-white">
                  <AlertCircle className="w-6 h-6 text-stone-400 mx-auto" />
                  <p className="text-[14px] font-medium text-[#111111]">No accounts found</p>
                  <p className="text-[12px] text-[#686868] max-w-sm mx-auto">
                    The discovery query returned 0 accounts for this location and industry combination.
                  </p>
                </div>
              )}

              {/* State: Results Returned */}
              {discoveryState === 'returned' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-medium text-[#111111]">
                      {discoveredProspects.length} accounts discovered
                    </span>
                    <button
                      onClick={() => {
                        if (selectedDiscoveredIds.size === discoveredProspects.length) {
                          setSelectedDiscoveredIds(new Set());
                        } else {
                          setSelectedDiscoveredIds(new Set(discoveredProspects.map((p) => p.id)));
                        }
                      }}
                      className="text-[#3157FF] hover:underline text-[12px]"
                    >
                      {selectedDiscoveredIds.size === discoveredProspects.length
                        ? 'Deselect all'
                        : 'Select all'}
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto divide-y divide-black/[0.05] border border-black/[0.06] rounded-xl bg-white">
                    {discoveredProspects.map((p) => {
                      const isSelected = selectedDiscoveredIds.has(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            const next = new Set(selectedDiscoveredIds);
                            if (next.has(p.id)) next.delete(p.id);
                            else next.add(p.id);
                            setSelectedDiscoveredIds(next);
                          }}
                          className="p-3 flex items-center justify-between gap-3 hover:bg-stone-50 cursor-pointer text-[13px]"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="rounded border-stone-300 text-[#3157FF] focus:ring-[#3157FF]"
                            />
                            <div className="min-w-0">
                              <span className="font-medium text-[#111111] block truncate">
                                {p.company.name}
                              </span>
                              <span className="text-[11px] text-[#949494] font-mono block truncate">
                                {p.company.domain}
                              </span>
                            </div>
                          </div>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#3157FF] shrink-0">
                            Fit {p.fitScore}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: SEQUENCE PHILOSOPHY */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-[18px] font-semibold text-[#111111]">Select Sequence Philosophy</h2>
                <p className="text-[13px] text-[#686868] mt-0.5">
                  Pick the cadence template for prospects enrolled in this campaign.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {[
                  {
                    id: 'Value-led' as const,
                    title: 'Value-Led Sequence (3 Steps)',
                    desc: 'Opens with specific website optimization friction and offers actionable suggestions without aggressive sales pressure.',
                  },
                  {
                    id: 'Direct' as const,
                    title: 'Direct & Concise (3 Steps)',
                    desc: 'Short 3-line executive emails directly addressing commercial decision makers with verified ROI benchmarks.',
                  },
                  {
                    id: 'Gentle' as const,
                    title: 'Consultative / Permission-Based (3 Steps)',
                    desc: 'Lightweight introductory notes asking permission to share industry benchmarks before sending full recommendations.',
                  },
                ].map((tpl) => {
                  const isSelected = selectedTemplate === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => setSelectedTemplate(tpl.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#3157FF] bg-blue-50/20 shadow-[0_1px_3px_rgba(49,87,255,0.08)]'
                          : 'border-black/[0.08] hover:border-black/[0.15] bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-[14px] font-semibold text-[#111111]">{tpl.title}</h4>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#3157FF]" />}
                      </div>
                      <p className="text-[12px] text-[#686868] mt-1 leading-relaxed">{tpl.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & SAVE */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-[18px] font-semibold text-[#111111]">Campaign Summary</h2>
                <p className="text-[13px] text-[#686868] mt-0.5">
                  Confirm the campaign configuration before saving to your active workspace.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[13px]">
                <div className="p-3.5 rounded-xl bg-stone-50 border border-black/[0.06]">
                  <span className="text-[11px] text-[#949494] uppercase tracking-wider block">Campaign Name</span>
                  <span className="font-semibold text-[#111111] text-[14px] block mt-0.5 truncate">{campaignName}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-stone-50 border border-black/[0.06]">
                  <span className="text-[11px] text-[#949494] uppercase tracking-wider block">Target ICP</span>
                  <span className="font-semibold text-[#111111] text-[14px] block mt-0.5 truncate">
                    {targetIndustry} • {targetGeo}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-stone-50 border border-black/[0.06]">
                  <span className="text-[11px] text-[#949494] uppercase tracking-wider block">Mailbox Email</span>
                  <span className="font-semibold text-[#111111] text-[13px] block mt-0.5 truncate font-mono">
                    {sendingEmail}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-stone-50 border border-black/[0.06]">
                  <span className="text-[11px] text-[#949494] uppercase tracking-wider block">Sequence Philosophy</span>
                  <span className="font-semibold text-[#111111] text-[14px] block mt-0.5 truncate">
                    {selectedTemplate} (3 steps)
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-black/[0.06] bg-[#F7F7F5]/50 flex items-center justify-between text-[13px]">
                <span className="text-[#686868]">Enrolled Prospects:</span>
                <span className="font-semibold text-[#111111]">
                  {selectedDiscoveredIds.size > 0
                    ? `${selectedDiscoveredIds.size} accounts`
                    : '0 accounts (Ready for prospects)'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Navigation */}
        <div className="p-4 border-t border-black/[0.06] bg-white flex items-center justify-between shrink-0">
          {currentStep > 1 ? (
            <button
              onClick={() => setCurrentStep((prev) => (prev > 1 ? (prev - 1) as 1 | 2 | 3 | 4 : prev))}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-[13px] font-medium text-[#686868] hover:bg-stone-100 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          ) : (
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-[13px] font-medium text-[#686868] hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
          )}

          <div className="flex items-center gap-2">
            {currentStep < 4 ? (
              <button
                onClick={handleNextStep}
                className="px-4 py-2 rounded-xl text-[13px] font-medium text-white bg-[#3157FF] hover:bg-[#2545D9] transition-colors flex items-center gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
              >
                <span>{currentStep === 1 ? 'Find Prospects' : 'Continue'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleLaunchOrDraft('draft')}
                  disabled={isSubmitting}
                  className="px-3.5 py-2 rounded-xl text-[13px] font-medium text-[#111111] hover:bg-stone-100 transition-colors disabled:opacity-50"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => handleLaunchOrDraft(selectedDiscoveredIds.size > 0 ? 'active' : 'draft')}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-[13px] font-medium text-white bg-[#3157FF] hover:bg-[#2545D9] transition-colors flex items-center gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.06)] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{isSubmitting ? 'Saving...' : 'Create Campaign'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
