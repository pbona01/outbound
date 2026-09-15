import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ExternalLink,
  Mail,
  Phone,
  Linkedin,
  Sparkles,
  Info,
  CheckCircle2,
  Clock,
  Send,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Building,
  Target,
  FileText,
} from 'lucide-react';
import { Prospect } from '../../types';
import { getScoreColor, getStatusBadge } from '../../lib/utils';

interface ProspectDrawerProps {
  prospect: Prospect | null;
  onClose: () => void;
  onUpdateProspectStatus?: (prospectId: string, newStatus: Prospect['status']) => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'info' | 'error') => void;
}

export function ProspectDrawer({
  prospect,
  onClose,
  onUpdateProspectStatus,
  onShowToast,
}: ProspectDrawerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'research' | 'email' | 'activity'>('research');
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);
  const [activePersonalizationSource, setActivePersonalizationSource] = useState<{
    text: string;
    source: string;
    explanation: string;
  } | null>(null);

  // Email editor state
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [aiInstruction, setAiInstruction] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Sync state when prospect changes
  const currentProspectId = prospect?.id;
  const [syncedId, setSyncedId] = useState<string | null>(null);

  if (prospect && syncedId !== currentProspectId) {
    setSyncedId(currentProspectId || null);
    setEmailSubject(prospect.generatedEmail.subject);
    setEmailBody(prospect.generatedEmail.body);
    setActivePersonalizationSource(null);
    setShowScoreBreakdown(false);
  }

  if (!prospect) return null;

  const scoreStyle = getScoreColor(prospect.fitScore);
  const statusBadge = getStatusBadge(prospect.status);

  const handleToneAdjustment = (tone: 'shorter' | 'casual' | 'direct') => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      if (tone === 'shorter') {
        setEmailBody(`Hi ${prospect.contact.firstName},

I was looking at ${prospect.company.name} and noticed the mobile consultation CTA is below the fold.

Put together a clean mockup putting project galleries and instant quoting upfront.

Happy to send it over if you'd like to see it.

— Alex`);
        onShowToast('Email tightened', 'Shortened copy to 42 words for maximum executive skimmability.');
      } else if (tone === 'casual') {
        setEmailBody(`Hey ${prospect.contact.firstName},

Saw the recent work at ${prospect.company.name} — really clean craftsmanship.

Took a peek at the site on my phone and the quote button is a bit tucked away in the menu. Mocked up a quick visual fix for you.

Let me know if you want me to shoot the link over!

— Alex`);
        onShowToast('Tone set to casual', 'Adjusted greeting and phrasing to conversational style.');
      } else if (tone === 'direct') {
        setEmailBody(`Hi ${prospect.contact.firstName},

3 quick observations on ${prospect.company.name}:
1. High-end portfolio work is buried on mobile.
2. Quote CTA takes 3 clicks to reach.
3. Mobile traffic is likely bouncing before booking.

I designed a 1-click mobile quote flow. Open to seeing a 2-minute video walkthrough?

— Alex`);
        onShowToast('Tone set to direct', 'Reformatted into structured executive bullet points.');
      }
    }, 450);
  };

  const handleApplyInstruction = () => {
    if (!aiInstruction.trim()) return;
    setIsGenerating(true);
    const instruction = aiInstruction;
    setTimeout(() => {
      setIsGenerating(false);
      setEmailBody(`Hi ${prospect.contact.firstName},

I was reviewing ${prospect.company.name}'s portfolio and your work on the Rollingwood estate kitchen is masterclass level.

I noticed high-ticket clients on mobile have to dig through navigation to request an estimate. I mocked up a streamlined layout highlighting your luxury projects alongside an instant consultation picker.

Happy to send over the Figma mockup if you'd like to take a look.

— Alex`);
      setAiInstruction('');
      onShowToast('AI personalization applied', `Regenerated with guidance: "${instruction}"`);
    }, 600);
  };

  const handleQueueEmail = () => {
    if (onUpdateProspectStatus) {
      onUpdateProspectStatus(prospect.id, 'in_sequence');
    }
    onShowToast('Prospect queued into Sequence', `${prospect.contact.fullName} scheduled for Step 1 dispatch tomorrow morning.`);
    onClose();
  };

  return (
    <div id="prospect-drawer-container" className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/20 backdrop-blur-[1px]"
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="relative w-full max-w-[540px] bg-white h-full shadow-[0_0_50px_rgba(0,0,0,0.15)] flex flex-col z-10 border-l border-black/[0.08]"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-black/[0.06] flex items-start justify-between bg-white shrink-0">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-stone-100 border border-black/[0.06] flex items-center justify-center font-semibold text-stone-700 text-sm shrink-0">
              {prospect.company.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-[17px] font-semibold text-[#111111] truncate">{prospect.company.name}</h2>
                <a
                  href={prospect.company.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#949494] hover:text-[#111111] transition-colors shrink-0"
                  title="Visit website"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <p className="text-[13px] text-[#686868] mt-0.5 flex items-center gap-2">
                <span>{prospect.company.location}</span>
                <span>•</span>
                <span>{prospect.company.industry}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#949494] hover:text-[#111111] rounded-lg hover:bg-stone-100 transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lead Score & Status Banner */}
        <div className="px-5 py-3 bg-[#F7F7F5] border-b border-black/[0.06] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`px-2.5 py-1 rounded-lg border text-[13px] font-semibold flex items-center gap-1.5 ${scoreStyle.bg} ${scoreStyle.border} ${scoreStyle.text}`}>
              <Target className="w-3.5 h-3.5" />
              <span>{prospect.fitScore} / 100</span>
            </div>
            <span className="text-[13px] font-medium text-[#111111]">{prospect.fitLabel}</span>
            <button
              onClick={() => setShowScoreBreakdown(!showScoreBreakdown)}
              className="text-[12px] text-[#3157FF] hover:underline font-medium ml-1 flex items-center gap-0.5"
            >
              Why {prospect.fitScore}?
            </button>
          </div>

          <span className={`text-[12px] font-medium px-2 py-0.5 rounded-full border ${statusBadge.classes}`}>
            {statusBadge.label}
          </span>
        </div>

        {/* Score Breakdown Modal / Expandable Card */}
        <AnimatePresence>
          {showScoreBreakdown && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-5 py-4 bg-white border-b border-black/[0.06] overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] font-semibold text-[#111111] uppercase tracking-wider">
                  Lead Score Breakdown ({prospect.fitScore}/100)
                </span>
                <span className="text-[11px] text-[#949494]">Weighted ICP Algorithm</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[12px]">
                <div className="p-2 rounded-lg bg-stone-50 border border-black/[0.04] flex items-center justify-between">
                  <span className="text-[#686868]">Business Relevance</span>
                  <span className="font-semibold text-[#111111] tnum">{prospect.fitScoreBreakdown.businessRelevance} / 25</span>
                </div>
                <div className="p-2 rounded-lg bg-stone-50 border border-black/[0.04] flex items-center justify-between">
                  <span className="text-[#686868]">Commercial Value</span>
                  <span className="font-semibold text-[#111111] tnum">{prospect.fitScoreBreakdown.commercialValue} / 20</span>
                </div>
                <div className="p-2 rounded-lg bg-stone-50 border border-black/[0.04] flex items-center justify-between">
                  <span className="text-[#686868]">Website Opportunity</span>
                  <span className="font-semibold text-[#111111] tnum">{prospect.fitScoreBreakdown.websiteOpportunity} / 20</span>
                </div>
                <div className="p-2 rounded-lg bg-stone-50 border border-black/[0.04] flex items-center justify-between">
                  <span className="text-[#686868]">Active Engagement</span>
                  <span className="font-semibold text-[#111111] tnum">{prospect.fitScoreBreakdown.activity} / 15</span>
                </div>
                <div className="p-2 rounded-lg bg-stone-50 border border-black/[0.04] flex items-center justify-between">
                  <span className="text-[#686868]">Contactability</span>
                  <span className="font-semibold text-[#111111] tnum">{prospect.fitScoreBreakdown.contactability} / 10</span>
                </div>
                <div className="p-2 rounded-lg bg-stone-50 border border-black/[0.04] flex items-center justify-between">
                  <span className="text-[#686868]">Digital Footprint</span>
                  <span className="font-semibold text-[#111111] tnum">{prospect.fitScoreBreakdown.digitalPresence} / 10</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Navigation */}
        <div className="flex items-center px-5 border-b border-black/[0.06] bg-white gap-6 shrink-0">
          {(['overview', 'research', 'email', 'activity'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-[13px] font-medium capitalize relative transition-colors ${
                activeTab === tab ? 'text-[#111111]' : 'text-[#686868] hover:text-[#111111]'
              }`}
            >
              {tab === 'email' ? 'Outreach Email' : tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#3157FF]"
                />
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Decision Maker Card */}
              <div className="p-4 rounded-xl bg-stone-50/70 border border-black/[0.06]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[12px] font-semibold text-[#686868] uppercase tracking-wider">
                    Primary Decision Maker
                  </span>
                  {prospect.contact.emailVerified && (
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Verified Deliverable
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center font-medium text-stone-700 text-sm">
                    {prospect.contact.firstName[0]}
                    {prospect.contact.lastName[0]}
                  </div>
                  <div>
                    <h3 className="text-[14px] font-semibold text-[#111111]">{prospect.contact.fullName}</h3>
                    <p className="text-[13px] text-[#686868]">{prospect.contact.role}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-black/[0.04] text-[13px]">
                  <div className="flex items-center gap-2 text-[#111111]">
                    <Mail className="w-3.5 h-3.5 text-[#949494] shrink-0" />
                    <span className="font-mono text-[12px] select-all">{prospect.contact.email}</span>
                  </div>
                  {prospect.contact.phone && (
                    <div className="flex items-center gap-2 text-[#111111]">
                      <Phone className="w-3.5 h-3.5 text-[#949494] shrink-0" />
                      <span className="font-mono text-[12px]">{prospect.contact.phone}</span>
                    </div>
                  )}
                  {prospect.contact.linkedinUrl && (
                    <div className="flex items-center gap-2 text-[#3157FF]">
                      <Linkedin className="w-3.5 h-3.5 text-[#3157FF] shrink-0" />
                      <a
                        href={prospect.contact.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline text-[12px]"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Company Details */}
              <div className="space-y-3">
                <h4 className="text-[13px] font-semibold text-[#111111]">Company Profile</h4>
                <div className="grid grid-cols-2 gap-3 text-[13px]">
                  <div className="p-3 rounded-lg border border-black/[0.06] bg-white">
                    <span className="text-[11px] text-[#949494] uppercase tracking-wider block">Employees</span>
                    <span className="font-medium text-[#111111] mt-0.5 block">{prospect.company.employeeCount}</span>
                  </div>
                  <div className="p-3 rounded-lg border border-black/[0.06] bg-white">
                    <span className="text-[11px] text-[#949494] uppercase tracking-wider block">Website Health</span>
                    <span className="font-medium text-[#111111] mt-0.5 block tnum">
                      {prospect.company.websiteQualityScore} / 100
                    </span>
                  </div>
                </div>

                <p className="text-[13px] text-[#686868] leading-relaxed p-3.5 rounded-xl bg-stone-50/50 border border-black/[0.05]">
                  {prospect.company.description}
                </p>
              </div>

              {/* Tech Stack */}
              <div>
                <h4 className="text-[13px] font-semibold text-[#111111] mb-2">Detected Technologies</h4>
                <div className="flex flex-wrap gap-1.5">
                  {prospect.research.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 rounded-md text-[12px] bg-stone-100 text-stone-700 border border-stone-200/60"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: RESEARCH */}
          {activeTab === 'research' && (
            <div className="space-y-6">
              {/* Executive AI Summary */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[#111111]">
                  <Sparkles className="w-3.5 h-3.5 text-[#3157FF]" />
                  <h3 className="text-[13px] font-semibold">Business Summary</h3>
                </div>
                <p className="text-[13px] text-[#686868] leading-relaxed p-3.5 rounded-xl bg-stone-50/60 border border-black/[0.05]">
                  {prospect.research.summary}
                </p>
              </div>

              {/* Why they fit */}
              <div className="space-y-2.5">
                <h4 className="text-[13px] font-semibold text-[#111111] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Why they fit your ICP
                </h4>
                <ul className="space-y-2">
                  {prospect.research.whyTheyFit.map((reason, idx) => (
                    <li
                      key={idx}
                      className="text-[13px] text-[#111111] flex items-start gap-2.5 p-2 rounded-lg bg-emerald-50/40 border border-emerald-100/60"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span className="leading-snug">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Website Opportunities with Source Links */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[13px] font-semibold text-[#111111] flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-[#3157FF]" />
                    Website & Conversion Opportunities
                  </h4>
                  <span className="text-[11px] text-[#949494]">Verified Claims</span>
                </div>

                <div className="space-y-2.5">
                  {prospect.research.websiteOpportunities.map((opp, idx) => (
                    <div
                      key={opp.id}
                      className="p-3.5 rounded-xl bg-white border border-black/[0.07] hover:border-black/[0.14] transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[13px] font-semibold text-[#111111] leading-snug">
                          {idx + 1}. {opp.issue}
                        </span>
                        <a
                          href={opp.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-mono text-[#3157FF] hover:underline flex items-center gap-1 shrink-0 bg-blue-50/70 px-1.5 py-0.5 rounded"
                        >
                          Source
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                      <p className="text-[12px] text-[#686868] mt-1.5 leading-relaxed">{opp.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Signals */}
              <div className="space-y-2">
                <h4 className="text-[13px] font-semibold text-[#111111]">Recent Activity Signals</h4>
                <div className="space-y-1.5">
                  {prospect.research.recentSignals.map((sig, idx) => (
                    <div key={idx} className="text-[12px] text-[#686868] flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-[#949494]" />
                      <span>{sig}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: EMAIL GENERATION & PERSONALIZATION */}
          {activeTab === 'email' && (
            <div className="space-y-5">
              {/* Personalization Explanation Callout if clicked */}
              <AnimatePresence>
                {activePersonalizationSource && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-[12px] relative"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-1.5 font-semibold text-amber-900">
                        <Info className="w-3.5 h-3.5 text-amber-600" />
                        <span>Researched Fact for "{activePersonalizationSource.text}"</span>
                      </div>
                      <button
                        onClick={() => setActivePersonalizationSource(null)}
                        className="text-amber-700 hover:text-amber-950 text-[11px]"
                      >
                        Dismiss
                      </button>
                    </div>
                    <p className="text-amber-800 mt-1">{activePersonalizationSource.explanation}</p>
                    <a
                      href={activePersonalizationSource.source}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#3157FF] hover:underline font-mono text-[11px] mt-1.5 inline-flex items-center gap-1"
                    >
                      Inspect Source URL <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Subject Input */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#686868]">Subject Line</label>
                <input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-black/[0.08] text-[13px] text-[#111111] focus:outline-none focus:border-[#3157FF] focus:ring-1 focus:ring-[#3157FF] transition-all"
                />
              </div>

              {/* Body Textarea with Research Highlights preview toggle */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-medium text-[#686868]">Email Copy</label>
                  <span className="text-[11px] text-[#949494] tnum">{emailBody.length} characters</span>
                </div>

                <div className="relative">
                  <textarea
                    rows={8}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    disabled={isGenerating}
                    className="w-full p-3.5 rounded-xl border border-black/[0.08] text-[13px] text-[#111111] leading-relaxed focus:outline-none focus:border-[#3157FF] focus:ring-1 focus:ring-[#3157FF] transition-all font-sans resize-none disabled:opacity-50"
                  />
                  {isGenerating && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center rounded-xl">
                      <div className="flex items-center gap-2 text-[12px] text-[#3157FF] font-medium">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Refining message with factual research...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Researched Personalization Chips */}
                <div className="pt-2">
                  <span className="text-[11px] text-[#686868] block mb-1.5">
                    Click researched personalization to verify factual source:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {prospect.generatedEmail.personalizations.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActivePersonalizationSource(p)}
                        className="text-[11px] px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200/80 hover:bg-amber-100/80 transition-colors flex items-center gap-1.5"
                      >
                        <span className="underline decoration-amber-400 font-medium">"{p.text}"</span>
                        <Info className="w-2.5 h-2.5 text-amber-600" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Tone Adjustments */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] text-[#686868] uppercase tracking-wider font-semibold">
                  Quick Adjustments
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleToneAdjustment('shorter')}
                    disabled={isGenerating}
                    className="text-[12px] px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-[#111111] transition-colors font-medium"
                  >
                    Shorter
                  </button>
                  <button
                    onClick={() => handleToneAdjustment('casual')}
                    disabled={isGenerating}
                    className="text-[12px] px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-[#111111] transition-colors font-medium"
                  >
                    More Casual
                  </button>
                  <button
                    onClick={() => handleToneAdjustment('direct')}
                    disabled={isGenerating}
                    className="text-[12px] px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-[#111111] transition-colors font-medium"
                  >
                    More Direct
                  </button>
                </div>
              </div>

              {/* AI Guidance Input Box */}
              <div className="p-3 rounded-xl bg-stone-50 border border-black/[0.06] space-y-2">
                <label className="text-[11px] font-semibold text-[#686868] uppercase tracking-wider block">
                  AI Revision Prompt
                </label>
                <div className="flex gap-2">
                  <input
                    value={aiInstruction}
                    onChange={(e) => setAiInstruction(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyInstruction()}
                    placeholder="e.g. Mention their recent luxury kitchen project instead"
                    className="flex-1 px-3 py-1.5 bg-white rounded-lg border border-black/[0.08] text-[12px] text-[#111111] placeholder:text-[#949494] focus:outline-none focus:border-[#3157FF]"
                  />
                  <button
                    onClick={handleApplyInstruction}
                    disabled={isGenerating || !aiInstruction.trim()}
                    className="px-3 py-1.5 rounded-lg bg-[#3157FF] hover:bg-[#2545D9] text-white text-[12px] font-medium transition-colors disabled:opacity-50 flex items-center gap-1 shrink-0"
                  >
                    <Sparkles className="w-3 h-3" />
                    Regenerate
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ACTIVITY TIMELINE */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h4 className="text-[13px] font-semibold text-[#111111]">Chronological Activity</h4>
              <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-black/[0.08]">
                {prospect.activities.map((act) => (
                  <div key={act.id} className="relative">
                    <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-white border border-stone-300 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#3157FF]" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-[13px] font-medium text-[#111111]">{act.title}</p>
                        <span className="text-[11px] text-[#949494] tnum">{act.timestamp}</span>
                      </div>
                      {act.description && (
                        <p className="text-[12px] text-[#686868] mt-0.5">{act.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-black/[0.06] bg-white flex items-center justify-between gap-3 shrink-0">
          <div className="text-[12px] text-[#686868]">
            {prospect.campaignName ? (
              <span>Campaign: <strong className="text-[#111111] font-medium">{prospect.campaignName}</strong></span>
            ) : (
              <span>Unassigned prospect</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-[13px] font-medium text-[#686868] hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleQueueEmail}
              className="px-4 py-2 rounded-xl text-[13px] font-medium text-white bg-[#3157FF] hover:bg-[#2545D9] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.06)] flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Approve & Queue
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
