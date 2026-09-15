import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Search,
  Sparkles,
  Target,
  Clock,
  Inbox,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Layers,
  Building2,
  Users,
  Send,
  Mail,
  Zap,
  Menu,
  X,
  Lock,
  Compass,
  BarChart3,
  ExternalLink,
} from 'lucide-react';

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFeatureTab, setActiveFeatureTab] = useState<
    'discover' | 'research' | 'outreach' | 'followup' | 'inbox'
  >('discover');

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111111] font-sans antialiased selection:bg-blue-100 selection:text-blue-900 flex flex-col">
      {/* Top Announcement Ribbon */}
      <div className="bg-[#111111] text-white px-4 py-2 text-center text-xs font-medium tracking-wide flex items-center justify-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#3157FF] animate-pulse" />
        <span>OutboundOS 1.0 is live — Discover high-intent accounts and stage relevant outreach</span>
        <Link
          to="/signup"
          className="underline decoration-stone-500 hover:decoration-white font-semibold ml-1 flex items-center gap-0.5 text-stone-300 hover:text-white transition"
        >
          Create free workspace <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Main Navigation */}
      <header className="sticky top-0 z-40 bg-[#FAF9F6]/85 backdrop-blur-md border-b border-black/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Wordmark */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-[#111111] text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-sm group-hover:bg-black transition">
              O
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[17px] font-semibold tracking-tight text-[#111111]">Outbound</span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#3157FF] font-semibold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100/80">
                OS
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-[#686868]">
            <a href="#features" className="hover:text-[#111111] transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-[#111111] transition-colors">
              How it works
            </a>
            <a href="#preview" className="hover:text-[#111111] transition-colors">
              Platform Preview
            </a>
            <a href="#philosophy" className="hover:text-[#111111] transition-colors">
              Relevance First
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/signin"
              className="px-4 py-2 rounded-xl text-[13px] font-medium text-[#686868] hover:text-[#111111] transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-xl text-[13px] font-medium text-white bg-[#3157FF] hover:bg-[#2545D9] transition-all shadow-[0_1px_3px_rgba(49,87,255,0.2)] hover:shadow-[0_2px_8px_rgba(49,87,255,0.3)] flex items-center gap-1.5"
            >
              Get started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#686868] hover:text-[#111111] hover:bg-stone-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-black/[0.08] px-4 py-5 space-y-4 shadow-xl">
            <nav className="flex flex-col space-y-3 text-sm font-medium text-[#555]">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-black py-1"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-black py-1"
              >
                How it works
              </a>
              <a
                href="#preview"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-black py-1"
              >
                Platform Preview
              </a>
              <a
                href="#philosophy"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-black py-1"
              >
                Relevance First
              </a>
            </nav>
            <div className="pt-3 border-t border-black/[0.06] flex flex-col gap-2">
              <Link
                to="/signin"
                className="w-full text-center py-2.5 rounded-xl text-sm font-medium text-[#111] border border-black/10 hover:bg-stone-50"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="w-full text-center py-2.5 rounded-xl text-sm font-medium text-white bg-[#3157FF] hover:bg-[#2545D9]"
              >
                Get started free
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center relative">
        {/* Subtle decorative radial accent */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#3157FF]/[0.05] rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100/90 border border-black/[0.06] text-xs font-medium text-[#686868] mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#3157FF]" />
          <span>Engineered for B2B Founders, SDRs & Agencies</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-semibold tracking-[-0.035em] text-[#111111] leading-[1.1] max-w-4xl mx-auto">
          Turn the right prospects into real conversations.
        </h1>

        <p className="text-base sm:text-xl text-[#5F5F5F] leading-relaxed max-w-2xl mx-auto mt-6 font-normal">
          Outbound helps teams discover high-fit companies, understand what matters to them, and
          create thoughtful outreach from one focused workspace.
        </p>

        {/* Hero CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
          <Link
            to="/signup"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl text-[14px] font-medium text-white bg-[#3157FF] hover:bg-[#2545D9] transition-all shadow-[0_2px_8px_rgba(49,87,255,0.25)] flex items-center justify-center gap-2 font-medium"
          >
            Create your workspace
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/signin"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl text-[14px] font-medium text-[#111111] bg-white border border-black/[0.1] hover:border-black/[0.2] transition-colors flex items-center justify-center gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
          >
            Sign in to existing account
          </Link>
        </div>

        {/* Honest Trust Badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#888888]">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Bring your own Google or Microsoft mailbox
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Sending locked until you approve
          </span>
        </div>
      </section>

      {/* Realistic Product Dashboard Preview Card */}
      <section id="preview" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="text-center mb-6">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#3157FF] font-semibold bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
            Realistic Product Preview • Mock Data Simulation
          </span>
        </div>

        {/* Linear/Attio styled app frame */}
        <div className="bg-white border border-black/[0.1] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] overflow-hidden">
          {/* Mock Window Titlebar */}
          <div className="bg-stone-100/80 border-b border-black/[0.06] px-4 py-3 flex items-center justify-between select-none">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400/80 border border-red-500/20" />
              <div className="w-3 h-3 rounded-full bg-amber-400/80 border border-amber-500/20" />
              <div className="w-3 h-3 rounded-full bg-emerald-400/80 border border-emerald-500/20" />
            </div>
            <div className="text-[11px] font-mono text-[#888] flex items-center gap-2">
              <span>app.outboundos.com</span>
              <span>/</span>
              <span className="text-[#333] font-medium">GrowthStudio</span>
              <span>/</span>
              <span className="text-[#3157FF]">Campaigns</span>
            </div>
            <div className="text-[11px] font-medium text-[#686868] flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>TLS Encrypted</span>
            </div>
          </div>

          {/* Simulated Interface Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-black/[0.06] text-left">
            {/* Sidebar Mock */}
            <div className="hidden lg:block lg:col-span-3 p-4 bg-stone-50/50 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-black/[0.06]">
                <div className="w-7 h-7 rounded-lg bg-[#111] text-white flex items-center justify-center text-xs font-bold">
                  O
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#111]">Northstar Tech</div>
                  <div className="text-[10px] text-[#888]">Active Workspace</div>
                </div>
              </div>

              <div className="space-y-1 text-xs text-[#555]">
                <div className="px-2.5 py-1.5 rounded-lg bg-stone-200/70 font-semibold text-[#111] flex items-center justify-between">
                  <span>Overview</span>
                </div>
                <div className="px-2.5 py-1.5 rounded-lg hover:bg-stone-100 flex items-center justify-between">
                  <span>Campaigns</span>
                  <span className="text-[10px] bg-stone-200 px-1.5 rounded">3</span>
                </div>
                <div className="px-2.5 py-1.5 rounded-lg hover:bg-stone-100 flex items-center justify-between">
                  <span>Prospects</span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 rounded font-mono">142</span>
                </div>
                <div className="px-2.5 py-1.5 rounded-lg hover:bg-stone-100 flex items-center justify-between">
                  <span>Inbox</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 rounded font-semibold">4 New</span>
                </div>
                <div className="px-2.5 py-1.5 rounded-lg hover:bg-stone-100">AI Research Lab</div>
                <div className="px-2.5 py-1.5 rounded-lg hover:bg-stone-100">Sequences</div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-black/[0.06] space-y-1 text-[11px]">
                <div className="font-semibold text-[#222]">Mailbox Status</div>
                <div className="text-emerald-700 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Ready for sending
                </div>
              </div>
            </div>

            {/* Center: Live Prospect Intelligence Preview */}
            <div className="lg:col-span-9 p-5 sm:p-7 space-y-6">
              {/* Campaign Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/[0.06]">
                <div>
                  <span className="text-[11px] font-mono text-[#3157FF] uppercase font-semibold">Active Campaign</span>
                  <h3 className="text-lg font-semibold text-[#111]">Series A B2B SaaS • EMEA Expansion</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                    12 replies (14.2% rate)
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                    8 meetings booked
                  </span>
                </div>
              </div>

              {/* Account Card with AI Evidence and Opening Pitch */}
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-50/70 border border-black/[0.07] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-black/[0.06] flex items-center justify-center font-bold text-sm text-[#111]">
                      Fin
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#111]">Finscale Technologies</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-[#3157FF] border border-blue-200 font-mono font-bold">
                          94 FIT SCORE
                        </span>
                      </div>
                      <span className="text-xs text-[#686868]">finscale.io • 65 employees • Fintech & Payments</span>
                    </div>
                  </div>

                  <div className="text-xs text-[#686868]">
                    Decision Maker: <strong className="text-[#111]">Elena Rostova</strong> (VP Growth)
                  </div>
                </div>

                {/* AI Research Signals */}
                <div className="grid sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-black/[0.05]">
                    <span className="text-[10px] font-semibold text-[#888] uppercase block">Detected Signal</span>
                    <span className="text-[#111] font-medium mt-0.5 block">
                      Expanding into UK/EU market; checkout flow lacks local SEPA payment methods.
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-black/[0.05]">
                    <span className="text-[10px] font-semibold text-[#888] uppercase block">Hiring Indicator</span>
                    <span className="text-[#111] font-medium mt-0.5 block">
                      Currently recruiting 4 Enterprise Account Executives in London.
                    </span>
                  </div>
                </div>

                {/* Individualized Outreach Snippet */}
                <div className="p-3.5 bg-white rounded-xl border border-blue-100 text-xs space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#888] border-b border-black/[0.04] pb-1.5">
                    <span className="font-mono text-[#3157FF]">Subject: Quick note on Finscale's UK launch</span>
                    <span>Touchpoint 1 of 3</span>
                  </div>
                  <p className="text-[#333] leading-relaxed">
                    "Elena, noticed you're scaling commercial reps for the EMEA push while your checkout still defaults to single-currency processing. We built an automated local payment orchestrator that helped similar fintechs recover 18% in cross-border card drop-offs without reworking their core gateway..."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      <section id="features" className="py-20 bg-white border-y border-black/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-xs font-mono uppercase tracking-wider text-[#3157FF] font-semibold">
              The 5 Pillars of High-Relevance Outbound
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#111111] mt-2">
              Everything required to run disciplined, high-conversion outbound.
            </h2>
            <p className="text-base text-[#686868] mt-3">
              No disconnected tools or fragmented CSV exports. Every stage from account discovery to inbox reply lives in one focused system.
            </p>
          </div>

          {/* 5 Distinct Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1: Discover Prospects */}
            <div className="p-7 rounded-3xl bg-[#FAF9F6] border border-black/[0.07] hover:border-black/[0.14] transition-all space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#3157FF] flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-[#111111]">1. Discover Prospects</h3>
              <p className="text-sm text-[#686868] leading-relaxed">
                Filter target accounts by industry, geography, headcount, and verified decision-maker titles. Zero in on accounts that actually fit your economic offer.
              </p>
              <ul className="text-xs text-[#555] space-y-1.5 pt-2 border-t border-black/[0.05]">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3157FF]" /> Verified work email addresses
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3157FF]" /> Algorithmic ICP fit scoring
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3157FF]" /> Clean CSV import & segmentation
                </li>
              </ul>
            </div>

            {/* Feature 2: Research Companies */}
            <div className="p-7 rounded-3xl bg-[#FAF9F6] border border-black/[0.07] hover:border-black/[0.14] transition-all space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-[#111111]">2. Research Companies</h3>
              <p className="text-sm text-[#686868] leading-relaxed">
                Autonomous web research inspects landing pages, pricing models, tech stacks, and active hiring posts to identify concrete opportunities before drafting.
              </p>
              <ul className="text-xs text-[#555] space-y-1.5 pt-2 border-t border-black/[0.05]">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> Real website audit observations
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> Evidence-backed hook detection
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> Grounded company context summaries
                </li>
              </ul>
            </div>

            {/* Feature 3: Generate Personalized Outreach */}
            <div className="p-7 rounded-3xl bg-[#FAF9F6] border border-black/[0.07] hover:border-black/[0.14] transition-all space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-[#111111]">3. Personalized Outreach</h3>
              <p className="text-sm text-[#686868] leading-relaxed">
                Write 1:1 individualized opening angles citing verified evidence. Never spray boilerplate sales pitches that prospects immediately delete.
              </p>
              <ul className="text-xs text-[#555] space-y-1.5 pt-2 border-t border-black/[0.05]">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> Specific observations in the first sentence
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> Short, punchy, conversational tone
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> Full operator review before dispatch
                </li>
              </ul>
            </div>

            {/* Feature 4: Manage Follow-Ups */}
            <div className="p-7 rounded-3xl bg-[#FAF9F6] border border-black/[0.07] hover:border-black/[0.14] transition-all space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-[#111111]">4. Manage Follow-Ups</h3>
              <p className="text-sm text-[#686868] leading-relaxed">
                Stage multi-touch sequence cadences with natural business-day delays, alternate angles, and immediate sequence stops the second a prospect replies.
              </p>
              <ul className="text-xs text-[#555] space-y-1.5 pt-2 border-t border-black/[0.05]">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Multi-step cadence architecture
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Automated reply-stop mechanism
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Configurable daily send throttle limits
                </li>
              </ul>
            </div>

            {/* Feature 5: Organize Replies */}
            <div className="p-7 rounded-3xl bg-[#FAF9F6] border border-black/[0.07] hover:border-black/[0.14] transition-all space-y-4 md:col-span-2 lg:col-span-2">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Inbox className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-[#111111]">5. Organize Unified Replies</h3>
              <p className="text-sm text-[#686868] leading-relaxed">
                Centralized inbox with automatic classification. Separate genuine buyer interest from polite declines, out-of-office autoreplies, or referrals to colleagues.
              </p>
              <div className="grid sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-white rounded-xl border border-black/[0.05] text-xs">
                  <div className="font-semibold text-emerald-700">Interested</div>
                  <div className="text-[#666] mt-0.5">Prioritized at the top of your feed for fast booking.</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-black/[0.05] text-xs">
                  <div className="font-semibold text-amber-700">Follow Up Later</div>
                  <div className="text-[#666] mt-0.5">Prospects asking for check-ins in next quarter.</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-black/[0.05] text-xs">
                  <div className="font-semibold text-stone-600">Suppressed</div>
                  <div className="text-[#666] mt-0.5">Opt-outs automatically silenced from future campaigns.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Workflow Section */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-xs font-mono uppercase tracking-wider text-[#3157FF] font-semibold">
            Simple 4-Step Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#111111] mt-2">
            From ICP definition to booked meetings in minutes.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Define Workspace & ICP',
              desc: 'Select industry, geography, and your primary customer offer in our 4-step setup.',
            },
            {
              step: '02',
              title: 'Discover & Score Accounts',
              desc: 'Find companies that meet your revenue and tech criteria, scored for intent.',
            },
            {
              step: '03',
              title: 'Inspect Evidence & Hooks',
              desc: 'AI synthesizes actionable website and company signals to establish genuine context.',
            },
            {
              step: '04',
              title: 'Review & Dispatch',
              desc: 'Approve individual touchpoints and let the cadence handle follow-ups automatically.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-black/[0.07] shadow-sm relative space-y-3"
            >
              <span className="text-3xl font-mono font-bold text-stone-200 block">{item.step}</span>
              <h3 className="text-base font-semibold text-[#111]">{item.title}</h3>
              <p className="text-xs text-[#686868] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Relevance Philosophy Section */}
      <section id="philosophy" className="py-16 bg-[#111111] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-mono text-stone-300">
            <ShieldCheck className="w-3.5 h-3.5 text-[#3157FF]" />
            <span>Honest, Deliverable Outbound</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Built for relevance, not spam blasts.
          </h2>
          <p className="text-base text-stone-300 leading-relaxed max-w-2xl mx-auto">
            Volume without relevance burns domains and ruins company reputation. OutboundOS is
            engineered to keep sender reputation spotless through targeted volumes, verified contacts, and
            content that prospects actually appreciate reading.
          </p>

          <div className="pt-4">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-[#111] bg-white hover:bg-stone-100 transition shadow-lg"
            >
              Get started with OutboundOS <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-black/[0.06] bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-[#111] text-white flex items-center justify-center font-bold text-xs">
              O
            </div>
            <span className="text-sm font-semibold text-[#111]">OutboundOS</span>
            <span className="text-xs text-[#888] ml-2">© {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-[#686868]">
            <Link to="/signin" className="hover:text-[#111] transition">
              Sign In
            </Link>
            <Link to="/signup" className="hover:text-[#111] transition">
              Create Account
            </Link>
            <a href="#features" className="hover:text-[#111] transition">
              Features
            </a>
            <a href="#preview" className="hover:text-[#111] transition">
              Preview
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
