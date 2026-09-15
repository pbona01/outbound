import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Building2,
  Search,
  Globe,
  CheckCircle2,
  Users,
  ShieldCheck,
  AlertTriangle,
  Mail,
  Sliders,
  Send,
  Loader2,
  X,
} from 'lucide-react';
import { Campaign, Prospect } from '../../types';

interface CampaignWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchCampaign: (campaign: Partial<Campaign>) => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'info' | 'error') => void;
}

export function CampaignWizard({
  isOpen,
  onClose,
  onLaunchCampaign,
  onShowToast,
}: CampaignWizardProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form state
  const [naturalQuery, setNaturalQuery] = useState(
    'Residential roofing and exterior contractors in Florida with 5-50 employees and slow mobile landing pages'
  );
  const [campaignName, setCampaignName] = useState('Florida Exterior Specialists');
  const [targetIndustry, setTargetIndustry] = useState('Roofing & Exterior');
  const [targetGeo, setTargetGeo] = useState('Florida, United States');
  const [prospectCount, setProspectCount] = useState(250);
  const [customCount, setCustomCount] = useState('');
  const [websiteRequired, setWebsiteRequired] = useState(true);
  const [excludeAgencies, setExcludeAgencies] = useState(true);
  const [excludeDirectories, setExcludeDirectories] = useState(true);
  const [excludeSoftware, setExcludeSoftware] = useState(true);

  // Live Pipeline Stage Simulation
  const [pipelineProgress, setPipelineProgress] = useState({
    discovered: 0,
    websitesChecked: 0,
    analyzedFit: 0,
    contactsFound: 0,
  });
  const [streamingLeads, setStreamingLeads] = useState<
    { name: string; location: string; score: number; problem: string }[]
  >([]);

  // Sequence template choice
  const [selectedTemplate, setSelectedTemplate] = useState<'Value-led' | 'Direct' | 'Gentle'>('Value-led');

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setPipelineProgress({ discovered: 0, websitesChecked: 0, analyzedFit: 0, contactsFound: 0 });
      setStreamingLeads([]);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer1: NodeJS.Timeout;
    const timeouts: NodeJS.Timeout[] = [];

    if (currentStep === 2) {
      setPipelineProgress({ discovered: 4, websitesChecked: 0, analyzedFit: 0, contactsFound: 0 });
      setStreamingLeads([]);

      timer1 = setInterval(() => {
        setPipelineProgress((prev) => {
          const nextDiscovered = Math.min(48, prev.discovered + 4);
          const nextWebsites = Math.min(nextDiscovered, prev.websitesChecked + 3);
          const nextFit = Math.min(nextWebsites, prev.analyzedFit + 2);
          const nextContacts = Math.min(nextFit, prev.contactsFound + 2);
          return {
            discovered: nextDiscovered,
            websitesChecked: nextWebsites,
            analyzedFit: nextFit,
            contactsFound: nextContacts,
          };
        });
      }, 350);

      // Stream realistic prospects into view
      const sampleNames = [
        { name: 'Apex Roofing Systems', location: 'Tampa, FL', score: 94, problem: 'Emergency phone not tap-to-call' },
        { name: 'Coastal Metal Roofing', location: 'Miami, FL', score: 91, problem: 'Estimate calculator broken on Safari' },
        { name: 'Gulf Breeze Exteriors', location: 'Sarasota, FL', score: 88, problem: 'Hero quote form lacks mobile auto-fill' },
        { name: 'Pinellas Shingle Co.', location: 'St. Petersburg, FL', score: 85, problem: 'Commercial warranty claims page 404' },
      ];

      sampleNames.forEach((item, index) => {
        const t = setTimeout(() => {
          setStreamingLeads((prev) => [...prev, item]);
        }, 800 * (index + 1));
        timeouts.push(t);
      });
    }

    return () => {
      clearInterval(timer1);
      timeouts.forEach(clearTimeout);
    };
  }, [currentStep]);

  // Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLaunch = () => {
    onLaunchCampaign({
      name: campaignName || 'Florida Exterior Specialists',
      audienceQuery: naturalQuery,
      targetIndustry: targetIndustry,
      targetGeography: targetGeo,
      status: 'active',
      stats: {
        prospects: prospectCount,
        contacted: 0,
        sent: 0,
        replies: 0,
        positiveReplies: 0,
        meetings: 0,
      },
      mailboxEmail: 'alex@growthstudio.co',
      dailyLimit: 35,
      sequenceStepsCount: 4,
    });
    onShowToast('Campaign Launched', `"${campaignName}" is live. Discovery workers deployed.`);
    onClose();
  };

  return (
    <div id="campaign-wizard-modal" className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="campaign-wizard-title">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-[2px]"
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
                {currentStep === 1 && 'Audience Discovery'}
                {currentStep === 2 && 'Live Crawling & Fit Analysis'}
                {currentStep === 3 && 'Outreach Sequence'}
                {currentStep === 4 && 'Launch Review'}
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

        {/* Wizard Step Progress Bar */}
        <div className="h-1 w-full bg-stone-100">
          <div
            className="h-full bg-[#3157FF] transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>

        {/* Step Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STEP 1: AUDIENCE */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-[22px] font-semibold text-[#111111] tracking-tight">Who should we find?</h2>
                <p className="text-[14px] text-[#686868] mt-1">
                  Describe your ideal customer in plain English. OutboundOS will extract company attributes, verify
                  domains, and research active decision makers.
                </p>
              </div>

              {/* Natural Language Prompt */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold uppercase tracking-wider text-[#686868]">
                  Target Audience Description
                </label>
                <textarea
                  rows={3}
                  value={naturalQuery}
                  onChange={(e) => setNaturalQuery(e.target.value)}
                  placeholder="e.g. Residential roofing companies in Florida with 5–50 employees."
                  className="w-full p-3.5 rounded-xl border border-black/[0.08] text-[14px] text-[#111111] leading-relaxed focus:outline-none focus:border-[#3157FF] focus:ring-1 focus:ring-[#3157FF] transition-all resize-none"
                />
              </div>

              {/* Campaign Label */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-[#686868]">Campaign Name</label>
                  <input
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-black/[0.08] text-[13px] text-[#111111] focus:outline-none focus:border-[#3157FF]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-[#686868]">Target Geography</label>
                  <input
                    value={targetGeo}
                    onChange={(e) => setTargetGeo(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-black/[0.08] text-[13px] text-[#111111] focus:outline-none focus:border-[#3157FF]"
                  />
                </div>
              </div>

              {/* Number of Prospects Presets */}
              <div className="space-y-2">
                <label className="text-[12px] font-semibold uppercase tracking-wider text-[#686868]">
                  Prospects to Discover
                </label>
                <div className="flex flex-wrap gap-2">
                  {[100, 250, 500, 1000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setProspectCount(preset);
                        setCustomCount('');
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-[13px] font-medium transition-all ${
                        prospectCount === preset && !customCount
                          ? 'bg-[#111111] text-white'
                          : 'bg-stone-100 hover:bg-stone-200 text-[#111111]'
                      }`}
                    >
                      {preset} prospects
                    </button>
                  ))}
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      placeholder="Custom"
                      value={customCount}
                      onChange={(e) => {
                        setCustomCount(e.target.value);
                        if (e.target.value) setProspectCount(Number(e.target.value));
                      }}
                      className="w-24 px-2.5 py-1.5 rounded-xl border border-black/[0.08] text-[13px] text-[#111111] focus:outline-none focus:border-[#3157FF]"
                    />
                  </div>
                </div>
              </div>

              {/* Exclusions & Strictness */}
              <div className="p-3.5 rounded-xl bg-[#F7F7F5] border border-black/[0.05] space-y-2.5">
                <span className="text-[12px] font-semibold text-[#111111] block">Automatic Quality Exclusions</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px] text-[#686868]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={websiteRequired}
                      onChange={(e) => setWebsiteRequired(e.target.checked)}
                      className="rounded border-stone-300 text-[#3157FF] focus:ring-[#3157FF]"
                    />
                    <span>Require active verifiable website</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={excludeAgencies}
                      onChange={(e) => setExcludeAgencies(e.target.checked)}
                      className="rounded border-stone-300 text-[#3157FF] focus:ring-[#3157FF]"
                    />
                    <span>Exclude marketing agencies & consultants</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={excludeDirectories}
                      onChange={(e) => setExcludeDirectories(e.target.checked)}
                      className="rounded border-stone-300 text-[#3157FF] focus:ring-[#3157FF]"
                    />
                    <span>Exclude directory aggregator domains</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={excludeSoftware}
                      onChange={(e) => setExcludeSoftware(e.target.checked)}
                      className="rounded border-stone-300 text-[#3157FF] focus:ring-[#3157FF]"
                    />
                    <span>Exclude SaaS / software vendors</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: SEARCHING STATE & LIVE PIPELINE */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center max-w-md mx-auto space-y-1">
                <h2 className="text-[20px] font-semibold text-[#111111]">Simulating Live Pipeline Execution</h2>
                <p className="text-[13px] text-[#686868]">
                  Autonomous workers are discovering commercial registries, visiting web domains, and verifying MX deliverability.
                </p>
              </div>

              {/* 4-Stage Pipeline Progress Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-stone-50 border border-black/[0.06] text-center">
                  <div className="w-2 h-2 rounded-full bg-[#3157FF] animate-ping mx-auto mb-1.5" />
                  <span className="text-[20px] font-semibold text-[#111111] tnum">{pipelineProgress.discovered}</span>
                  <span className="text-[11px] text-[#686868] block mt-0.5">Discovered</span>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 border border-black/[0.06] text-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mx-auto mb-1.5" />
                  <span className="text-[20px] font-semibold text-[#111111] tnum">
                    {pipelineProgress.websitesChecked}
                  </span>
                  <span className="text-[11px] text-[#686868] block mt-0.5">Websites Crawled</span>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 border border-black/[0.06] text-center">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mx-auto mb-1.5" />
                  <span className="text-[20px] font-semibold text-[#111111] tnum">{pipelineProgress.analyzedFit}</span>
                  <span className="text-[11px] text-[#686868] block mt-0.5">Fit Analyzed</span>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 border border-black/[0.06] text-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mx-auto mb-1.5" />
                  <span className="text-[20px] font-semibold text-[#111111] tnum">
                    {pipelineProgress.contactsFound}
                  </span>
                  <span className="text-[11px] text-[#686868] block mt-0.5">Contacts Verified</span>
                </div>
              </div>

              {/* Live Streaming Leads Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="font-semibold text-[#111111] flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#3157FF]" />
                    Live Extracted Leads Stream
                  </span>
                  <span className="text-[#949494]">Streaming in real time...</span>
                </div>

                <div className="space-y-2 border border-black/[0.06] rounded-xl p-2 bg-stone-50/50 min-h-[160px]">
                  {streamingLeads.length === 0 ? (
                    <div className="h-32 flex items-center justify-center text-[13px] text-[#949494]">
                      Initiating crawler threads on regional business records...
                    </div>
                  ) : (
                    streamingLeads.map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-2.5 rounded-lg bg-white border border-black/[0.05] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center justify-between text-[13px]"
                      >
                        <div className="flex items-center gap-2.5">
                          <Building2 className="w-4 h-4 text-stone-400 shrink-0" />
                          <div>
                            <span className="font-medium text-[#111111]">{item.name}</span>
                            <span className="text-[11px] text-[#686868] ml-2">{item.location}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-stone-500 hidden sm:inline">"{item.problem}"</span>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Fit {item.score}
                          </span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SEQUENCE & MESSAGE CRITERIA */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-[20px] font-semibold text-[#111111]">Outreach Sequence Structure</h2>
                <p className="text-[13px] text-[#686868] mt-0.5">
                  Pick the messaging philosophy for this campaign. Each email is customized with factual website research.
                </p>
              </div>

              {/* Preset Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'Value-led' as const,
                    title: 'Value-Led',
                    desc: 'Highlights specific friction in their mobile flow with an offer to send a custom mockup.',
                  },
                  {
                    id: 'Direct' as const,
                    title: 'Direct & Concise',
                    desc: 'Short 3-line message straight to commercial decision makers with clear ROI metrics.',
                  },
                  {
                    id: 'Gentle' as const,
                    title: 'Gentle & Consultative',
                    desc: 'Conversational tone asking permission to share industry benchmarks.',
                  },
                ].map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setSelectedTemplate(tpl.id)}
                    className={`p-3.5 rounded-xl text-left border transition-all ${
                      selectedTemplate === tpl.id
                        ? 'border-[#3157FF] bg-blue-50/20 ring-1 ring-[#3157FF]'
                        : 'border-black/[0.08] hover:border-black/[0.16] bg-white'
                    }`}
                  >
                    <span className="text-[13px] font-semibold text-[#111111] block mb-1">{tpl.title}</span>
                    <span className="text-[12px] text-[#686868] leading-relaxed block">{tpl.desc}</span>
                  </button>
                ))}
              </div>

              {/* Sequence Timeline Preview */}
              <div className="p-4 rounded-xl bg-stone-50 border border-black/[0.06] space-y-3">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-[#686868]">
                  4-Step Sequence Timeline
                </span>
                <div className="space-y-2 text-[12px]">
                  <div className="p-2.5 rounded-lg bg-white border border-black/[0.05] flex items-center justify-between">
                    <span className="font-medium text-[#111111]">Step 1: Initial Cold Outreach</span>
                    <span className="text-[#949494]">Dispatched Immediately</span>
                  </div>
                  <div className="text-center text-[11px] text-[#949494]">↓ Wait 3 business days</div>
                  <div className="p-2.5 rounded-lg bg-white border border-black/[0.05] flex items-center justify-between">
                    <span className="font-medium text-[#111111]">Step 2: Follow-up with Mockup Preview</span>
                    <span className="text-[#949494]">Day 4</span>
                  </div>
                  <div className="text-center text-[11px] text-[#949494]">↓ Wait 4 business days</div>
                  <div className="p-2.5 rounded-lg bg-white border border-black/[0.05] flex items-center justify-between">
                    <span className="font-medium text-[#111111]">Step 3: Industry Case Study Comparison</span>
                    <span className="text-[#949494]">Day 8</span>
                  </div>
                  <div className="text-center text-[11px] text-[#949494]">↓ Wait 7 business days</div>
                  <div className="p-2.5 rounded-lg bg-white border border-black/[0.05] flex items-center justify-between">
                    <span className="font-medium text-[#111111]">Step 4: Polite Breakup Email</span>
                    <span className="text-[#949494]">Day 15</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: CAMPAIGN REVIEW & LAUNCH */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-[20px] font-semibold text-[#111111]">Campaign Review</h2>
                <p className="text-[13px] text-[#686868] mt-0.5">
                  Confirm verification parameters before launching into the warm sending queue.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[13px]">
                <div className="p-3.5 rounded-xl bg-stone-50 border border-black/[0.06]">
                  <span className="text-[11px] text-[#949494] uppercase tracking-wider block">Audience Target</span>
                  <span className="font-semibold text-[#111111] text-[15px] block mt-0.5 tnum">{prospectCount} prospects</span>
                </div>
                <div className="p-3.5 rounded-xl bg-stone-50 border border-black/[0.06]">
                  <span className="text-[11px] text-[#949494] uppercase tracking-wider block">Verified Emails</span>
                  <span className="font-semibold text-emerald-700 text-[15px] block mt-0.5 tnum">
                    {Math.round(prospectCount * 0.91)} deliverable (91%)
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-stone-50 border border-black/[0.06]">
                  <span className="text-[11px] text-[#949494] uppercase tracking-wider block">Sending Mailbox</span>
                  <span className="font-semibold text-[#111111] text-[13px] block mt-0.5 truncate font-mono">
                    alex@growthstudio.co
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-stone-50 border border-black/[0.06]">
                  <span className="text-[11px] text-[#949494] uppercase tracking-wider block">Daily Limit</span>
                  <span className="font-semibold text-[#111111] text-[15px] block mt-0.5 tnum">35 emails / day</span>
                </div>
              </div>

              {/* Warning Notice as requested */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-[12px] flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900">
                    {Math.round(prospectCount * 0.09)} prospects do not have verified emails
                  </p>
                  <p className="text-amber-800 mt-0.5">
                    These will be automatically routed to secondary MX handshake checks and won't be sent until deliverability is guaranteed.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-black/[0.06] bg-stone-50/50 flex items-center justify-between text-[12px] text-[#686868]">
                <span>Estimated duration to contact entire list:</span>
                <strong className="text-[#111111] font-semibold tnum">
                  {Math.ceil(prospectCount / 30)} business days
                </strong>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Navigation */}
        <div className="p-4 border-t border-black/[0.06] bg-white flex items-center justify-between shrink-0">
          {currentStep > 1 ? (
            <button
              onClick={() => setCurrentStep((prev) => (prev > 1 ? (prev - 1) as 1 | 2 | 3 | 4 : prev))}
              className="px-4 py-2 rounded-xl text-[13px] font-medium text-[#686868] hover:bg-stone-100 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-[13px] font-medium text-[#686868] hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
          )}

          <div className="flex items-center gap-2">
            {currentStep < 4 ? (
              <button
                onClick={() => setCurrentStep((prev) => (prev < 4 ? (prev + 1) as 1 | 2 | 3 | 4 : prev))}
                className="px-4 py-2 rounded-xl text-[13px] font-medium text-white bg-[#3157FF] hover:bg-[#2545D9] transition-colors flex items-center gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
              >
                <span>{currentStep === 1 ? 'Find Prospects' : 'Continue'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onShowToast('Draft saved', 'Campaign saved to drafts.');
                    onClose();
                  }}
                  className="px-3.5 py-2 rounded-xl text-[13px] font-medium text-[#111111] hover:bg-stone-100 transition-colors"
                >
                  Save draft
                </button>
                <button
                  onClick={handleLaunch}
                  className="px-4 py-2 rounded-xl text-[13px] font-medium text-white bg-[#3157FF] hover:bg-[#2545D9] transition-colors flex items-center gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                >
                  <Send className="w-3.5 h-3.5" />
                  Launch campaign
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
