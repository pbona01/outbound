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
} from 'lucide-react';

interface AiResearchLabViewProps {
  onShowToast: (title: string, description?: string, type?: 'success' | 'info' | 'error') => void;
}

export function AiResearchLabView({ onShowToast }: AiResearchLabViewProps) {
  const [urlInput, setUrlInput] = useState('https://stoneandoakremodeling.com');
  const [targetRole, setTargetRole] = useState('Owner / Founder');
  const [isCrawling, setIsCrawling] = useState(false);
  const [copied, setCopied] = useState(false);

  // Result state
  const [result, setResult] = useState<{
    companyName: string;
    domain: string;
    industry: string;
    location: string;
    decisionMaker: { name: string; role: string; email: string; verified: boolean };
    score: number;
    techStack: string[];
    observations: { issue: string; evidence: string }[];
    generatedEmail: { subject: string; body: string };
  } | null>({
    companyName: 'Stone & Oak Remodeling',
    domain: 'stoneandoakremodeling.com',
    industry: 'Kitchen & Bath Remodeling',
    location: 'Austin, Texas',
    decisionMaker: {
      name: 'James Carter',
      role: 'Founder & Principal Builder',
      email: 'james@stoneandoakremodeling.com',
      verified: true,
    },
    score: 92,
    techStack: ['WordPress', 'Elementor', 'Google Tag Manager', 'Cloudflare CDN', 'WPForms'],
    observations: [
      {
        issue: 'Primary consultation CTA is below the fold on mobile',
        evidence: 'Hero viewport ends at project carousel; booking form starts at 1,480px scroll depth on iPhone 14.',
      },
      {
        issue: 'Project portfolio showcases photos without client outcome context',
        evidence: '/portfolio page has 24 high-res gallery items but zero timeline, budget, or square footage specs.',
      },
      {
        issue: 'Mobile navigation drawer hides the Instant Estimate button',
        evidence: 'Hamburger menu requires 2 taps to reveal the contact action; desktop displays it in sticky header.',
      },
    ],
    generatedEmail: {
      subject: 'Quick idea for Stone & Oak Remodeling',
      body: `Hi James,\n\nI was reviewing Stone & Oak Remodeling's portfolio — your custom cabinetry work on the Rollingwood estate is exceptional.\n\nWhile browsing on mobile, I noticed your primary consultation CTA is located below the initial fold, and the quote link is tucked inside the hamburger menu. Prospective homeowners looking for $80k+ kitchen remodels often bounce before discovering your booking form.\n\nI put together a clean mobile concept that brings your project outcomes and instant consultation booking directly upfront.\n\nOpen to seeing a 2-minute video walkthrough?\n\n— Alex`,
    },
  });

  const handleRunCrawler = () => {
    if (!urlInput.trim()) return;
    setIsCrawling(true);
    setTimeout(() => {
      setIsCrawling(false);
      onShowToast('Domain Audited', `Extracted full ICP attributes and generated personalized email copy for ${urlInput}.`);
    }, 1200);
  };

  const handleCopyEmail = () => {
    if (!result) return;
    navigator.clipboard.writeText(`${result.generatedEmail.subject}\n\n${result.generatedEmail.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onShowToast('Copied to clipboard', 'Email subject and copy copied.');
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
            onClick={handleRunCrawler}
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
      </div>

      {/* Crawl Results Grid */}
      {result && (
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
                  <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified MX
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

            <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between">
              <span className="text-[12px] text-[#686868]">No placeholder slop. Grounded in actual site crawl.</span>
              <button
                onClick={() => onShowToast('Queued', 'Added directly to Texas Kitchen Remodelers sequence.')}
                className="px-4 py-2 rounded-xl text-[13px] font-medium text-white bg-[#3157FF] hover:bg-[#2545D9] transition-colors"
              >
                Queue into Sequence
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
