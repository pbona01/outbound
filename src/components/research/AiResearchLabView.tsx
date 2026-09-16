import { useState } from 'react';
import {
  Sparkles,
  Globe,
  Search,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Building,
  Target,
  Send,
  Loader2,
  Copy,
  Check,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { useToast } from '../../lib/state/ToastContext';
import { useAppState } from '../../lib/state/AppStateContext';
import { CompanyResearchResult } from '../../types';

export function AiResearchLabView() {
  const { showToast } = useToast();
  const { researchCompany, addResearchedProspect, campaigns } = useAppState();
  
  const [urlInput, setUrlInput] = useState('');
  const [targetRole, setTargetRole] = useState('Owner / Founder');
  const [isCrawling, setIsCrawling] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQueueDropdown, setShowQueueDropdown] = useState(false);

  // Result state
  const [result, setResult] = useState<CompanyResearchResult | null>(null);

  const handleRunCrawler = async (overrideUrl?: string) => {
    const targetUrl = overrideUrl || urlInput;
    if (!targetUrl.trim()) return;
    setIsCrawling(true);
    try {
      const data = await researchCompany(targetUrl, targetRole);
      setResult(data);
      showToast('Domain Audited', `Extracted ICP attributes and generated personalized email copy for ${data.domain}.`);
    } catch (error) {
      showToast('Research Error', error instanceof Error ? error.message : 'Failed to audit the target website domain.', 'error');
    } finally {
      setIsCrawling(false);
    }
  };

  const handleQueueIntoCampaign = async (campaignId?: string) => {
    if (!result) return;
    setIsSaving(true);
    try {
      await addResearchedProspect(result, campaignId);
      const campaign = campaigns.find(c => c.id === campaignId);
      if (campaign) {
        showToast('Queued into Campaign', `Assigned ${result.companyName} directly to ${campaign.name}.`);
      } else {
        showToast('Saved to Prospects', `Added ${result.companyName} to verified prospects list.`);
      }
      setShowQueueDropdown(false);
    } catch {
      showToast('Error', 'Failed to save prospect record.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyEmail = () => {
    if (!result) return;
    navigator.clipboard.writeText(`${result.generatedEmail.subject}\n\n${result.generatedEmail.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Copied to clipboard', 'Email subject and copy copied.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">AI Research Lab</h1>
        <p className="text-[14px] text-[#686868] mt-0.5">
          Test real-time company extraction, website flaw detection, and cold outreach personalization.
        </p>
      </div>

      {/* URL Input Bar */}
      <div className="p-4 bg-white rounded-2xl border border-black/[0.07] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-3">
        <span className="text-[12px] font-semibold uppercase tracking-wider text-[#686868]">
          Live Domain Research Engine
        </span>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Globe className="w-4 h-4 text-[#949494] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://companywebsite.com"
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-black/[0.08] text-[13px] text-[#111111] focus:outline-none focus:border-[#3157FF]"
            />
          </div>

          <div className="sm:w-56">
            <input
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Target Decision Maker Role"
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.08] text-[13px] text-[#111111] focus:outline-none focus:border-[#3157FF]"
            />
          </div>

          <button
            onClick={() => handleRunCrawler()}
            disabled={isCrawling}
            className="px-5 py-2.5 rounded-xl text-[13px] font-medium text-white bg-[#3157FF] hover:bg-[#2545D9] transition-colors flex items-center justify-center gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.06)] disabled:opacity-50 shrink-0"
          >
            {isCrawling ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Crawling...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Extract & Research</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Domain Presets */}
        <div className="flex items-center gap-2 pt-1 flex-wrap">
          <span className="text-[11px] font-medium text-[#949494]">Quick test domains:</span>
          {[
            { label: 'Stone & Oak (Remodeling)', url: 'https://stoneandoakremodeling.com', role: 'Founder & Principal' },
            { label: 'Apex Roofing (Contracting)', url: 'https://apexroofingsystems.com', role: 'Managing Partner' },
            { label: 'Evergreen (Plumbing)', url: 'https://evergreendraincleaning.com', role: 'Owner' },
            { label: 'BlueStar (HVAC)', url: 'https://bluestarclimate.com', role: 'President' },
          ].map((preset) => (
            <button
              key={preset.url}
              onClick={() => {
                setUrlInput(preset.url);
                setTargetRole(preset.role);
                handleRunCrawler(preset.url);
              }}
              className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-stone-100/80 hover:bg-stone-200/70 text-[#686868] hover:text-[#111111] transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Crawl Results Grid */}
      {isCrawling ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 border border-black/[0.07] bg-white rounded-2xl border-dashed">
          <Loader2 className="w-8 h-8 text-[#3157FF] animate-spin mb-4" />
          <p className="text-[14px] font-medium text-[#111111]">Running deep crawler...</p>
          <p className="text-[13px] text-[#686868] mt-1">Analyzing website DOM, technologies, and conversion flows.</p>
        </div>
      ) : result ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Dossier, Opportunities, Tech */}
          <div className="space-y-6">
            {/* Account Card */}
            <div className="p-5 bg-white rounded-2xl border border-black/[0.07] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[18px] font-semibold text-[#111111]">{result.companyName}</h3>
                  <a
                    href={urlInput}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[12px] text-[#3157FF] hover:underline flex items-center gap-1 mt-0.5 font-mono"
                  >
                    {result.domain}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-center">
                  <span className="text-[10px] uppercase tracking-wider block font-semibold">Fit Score</span>
                  <span className="text-[16px] font-semibold tnum">{result.score}/100</span>
                </div>
              </div>

              {/* Decision Maker */}
              <div className="p-3.5 rounded-xl bg-stone-50/80 border border-black/[0.05] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#686868]">
                    Target Decision Maker
                  </span>
                  <span className={`text-[11px] font-medium flex items-center gap-1 ${result.decisionMaker.verified ? 'text-emerald-700' : 'text-[#949494]'}`}>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {result.decisionMaker.verified ? 'Verified contact' : 'Contact not verified'}
                  </span>
                </div>
                <div className="text-[14px] font-semibold text-[#111111]">{result.decisionMaker.name}</div>
                <div className="text-[12px] text-[#686868]">
                  {result.decisionMaker.role} •{' '}
                  <span className="font-mono text-[#111111]">{result.decisionMaker.email}</span>
                </div>
              </div>

              {/* Tech stack */}
              <div className="space-y-2">
                <span className="text-[12px] font-semibold text-[#111111]">Detected Technologies</span>
                <div className="flex flex-wrap gap-1.5">
                  {result.techStack.map((tech) => (
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

            {/* Opportunities */}
            <div className="p-5 bg-white rounded-2xl border border-black/[0.07] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-3">
              <div className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-[#3157FF]" />
                <h3 className="text-[15px] font-semibold text-[#111111]">Verified Website Gaps & Angles</h3>
              </div>

              <div className="space-y-2.5">
                {result.observations.map((obs, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-stone-50/60 border border-black/[0.05] space-y-1">
                    <span className="text-[13px] font-medium text-[#111111] block">
                      {idx + 1}. {obs.issue}
                    </span>
                    <p className="text-[12px] text-[#686868] leading-relaxed">{obs.evidence}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Generated Personalized Outreach */}
          <div className="p-5 bg-white rounded-2xl border border-black/[0.07] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#3157FF]" />
                  <h3 className="text-[15px] font-semibold text-[#111111]">Generated Cold Outreach</h3>
                </div>
                <button
                  onClick={handleCopyEmail}
                  className="px-2.5 py-1 rounded-lg border border-black/[0.08] hover:bg-stone-50 text-[12px] font-medium text-[#686868] flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#949494]">
                  Subject Line
                </label>
                <div className="p-2.5 rounded-xl bg-stone-50 border border-black/[0.06] text-[13px] font-medium text-[#111111]">
                  {result.generatedEmail.subject}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#949494]">
                  Body Copy (Factual Personalization Highlighted)
                </label>
                <div className="p-4 rounded-xl bg-[#F7F7F5]/50 border border-black/[0.06] text-[13px] text-[#111111] leading-relaxed whitespace-pre-line font-sans">
                  {result.generatedEmail.body}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between gap-3">
              <span className="text-[12px] text-[#686868]">Generated from the live website crawl and AI analysis.</span>
              <div className="relative">
                <button
                  onClick={() => setShowQueueDropdown(!showQueueDropdown)}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl text-[13px] font-medium text-white bg-[#3157FF] hover:bg-[#2545D9] transition-colors flex items-center gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.06)] disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Queue into Sequence'}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </button>

                {showQueueDropdown && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setShowQueueDropdown(false)} />
                    <div className="absolute right-0 bottom-full mb-1.5 w-64 bg-white rounded-xl shadow-xl border border-black/[0.08] z-30 overflow-hidden">
                      <div className="p-2.5 border-b border-black/[0.04] bg-stone-50/50">
                        <span className="text-[11px] font-semibold text-[#949494] uppercase tracking-wider block">
                          Destination Campaign
                        </span>
                      </div>
                      <div className="max-h-[260px] overflow-y-auto p-1">
                        <button
                          onClick={() => handleQueueIntoCampaign(undefined)}
                          className="w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium text-[#111111] hover:bg-stone-50 transition-colors flex items-center gap-2"
                        >
                          <Target className="w-3.5 h-3.5 text-[#686868]" />
                          <span>Save as Unassigned Prospect</span>
                        </button>
                        {campaigns.length > 0 && (
                          <div className="my-1 border-t border-black/[0.04]" />
                        )}
                        {campaigns.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => handleQueueIntoCampaign(c.id)}
                            className="w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium text-[#111111] hover:bg-stone-50 transition-colors flex items-center gap-2"
                          >
                            <Layers className="w-3.5 h-3.5 text-[#3157FF]" />
                            <span className="truncate">{c.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 border border-black/[0.07] bg-white rounded-2xl border-dashed">
          <Globe className="w-8 h-8 text-stone-300 mb-4" />
          <p className="text-[14px] font-medium text-[#111111]">Enter a domain to begin research</p>
          <p className="text-[13px] text-[#686868] mt-1 text-center max-w-sm">
            The AI engine will scrape the website, detect technologies, identify conversion friction, and draft a hyper-personalized email.
          </p>
        </div>
      )}
    </div>
  );
}
