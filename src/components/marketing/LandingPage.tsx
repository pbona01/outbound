import { motion } from 'motion/react';
import { ThemeToggle } from '../common/ThemeToggle';
import { ArrowRight, Check, ChevronRight, Command, Radar, Sparkles, Target, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const capabilities = [
  { icon: Radar, label: 'Discover', text: 'Find the accounts that fit your offer.' },
  { icon: Target, label: 'Understand', text: 'See the signal behind every score.' },
  { icon: Sparkles, label: 'Reach out', text: 'Turn context into thoughtful drafts.' },
];

function LogoMark({ small = false }: { small?: boolean }) {
  return <img src="/outbound-logo.png" alt="" className={`${small ? 'h-8 w-8 rounded-[10px]' : 'h-9 w-9 rounded-xl'} object-contain`} />;
}

function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[650px]">
      <div className="absolute -inset-10 rounded-[48px] bg-[#3157FF]/10 blur-3xl" />
      <div className="relative overflow-hidden rounded-[26px] border border-black/[0.09] bg-white p-2 shadow-[0_30px_100px_rgba(17,17,17,0.16)]">
        <div className="overflow-hidden rounded-[20px] border border-black/[0.06] bg-[#F7F7F5]">
          <div className="flex items-center justify-between border-b border-black/[0.06] bg-white/70 px-4 py-3 backdrop-blur-xl sm:px-5">
            <div className="flex items-center gap-2.5"><LogoMark small /><div><p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#949494]">Example workspace</p><p className="text-[13px] font-semibold tracking-tight">Outbound command center</p></div></div>
            <div className="hidden items-center gap-2 sm:flex"><span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">Research ready</span><span className="h-7 w-7 rounded-full bg-stone-200" /></div>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-[1.1fr_0.9fr] sm:p-5">
            <div className="rounded-2xl border border-black/[0.06] bg-white p-4">
              <div className="flex items-start justify-between"><div><p className="text-[11px] text-[#949494]">Next best action</p><h3 className="mt-1 text-[18px] font-semibold tracking-[-0.04em]">Review your high-fit accounts.</h3></div><span className="rounded-xl bg-blue-50 p-2 text-[#3157FF]"><Target className="h-4 w-4" /></span></div>
              <div className="mt-5 space-y-2.5"><div className="flex items-center justify-between rounded-xl bg-[#F7F7F5] px-3 py-2.5"><span className="text-[12px] font-medium">Northline Kitchens</span><span className="text-[11px] font-semibold text-emerald-700">94 fit</span></div><div className="flex items-center justify-between rounded-xl bg-[#F7F7F5] px-3 py-2.5"><span className="text-[12px] font-medium">Apex Roofing Systems</span><span className="text-[11px] font-semibold text-emerald-700">91 fit</span></div><div className="flex items-center justify-between rounded-xl bg-[#F7F7F5] px-3 py-2.5"><span className="text-[12px] font-medium">Evergreen Mechanical</span><span className="text-[11px] font-semibold text-emerald-700">88 fit</span></div></div>
            </div>
            <div className="space-y-3"><div className="rounded-2xl border border-black/[0.06] bg-white p-4"><p className="text-[11px] text-[#949494]">Pipeline</p><p className="mt-2 text-[30px] font-semibold tracking-[-0.06em]">Ready</p><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-stone-100"><div className="h-full w-[68%] rounded-full bg-[#3157FF]" /></div><p className="mt-2 text-[10px] text-[#686868]">Research → review → outreach</p></div><div className="rounded-2xl border border-black/[0.06] bg-[#111111] p-4 text-white"><div className="flex items-center gap-2 text-[11px] text-white/60"><Zap className="h-3.5 w-3.5 text-[#a9b9ff]" />Signal-led outreach</div><p className="mt-3 text-[13px] leading-relaxed text-white/85">Every message starts with a reason, not a template.</p></div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#F7F7F5] text-[#111111]">
      <div className="pointer-events-none absolute left-1/2 top-[-25rem] h-[44rem] w-[54rem] -translate-x-1/2 rounded-full bg-[#3157FF]/[0.09] blur-3xl" />
      <nav className="sticky top-4 z-40 mx-auto mt-4 flex w-[calc(100%-2rem)] max-w-6xl items-center justify-between rounded-2xl border border-black/[0.09] bg-white/[0.68] px-3 py-2 shadow-[0_8px_30px_rgba(17,17,17,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl supports-[backdrop-filter]:bg-white/[0.52] sm:px-4" aria-label="Primary navigation">
        <Link to="/" className="flex items-center gap-2.5"><LogoMark /><span className="text-[15px] font-semibold tracking-[-0.03em]">Outbound</span></Link>
        <div className="hidden items-center gap-1 md:flex"><a href="#product" className="rounded-xl px-3 py-2 text-[12px] font-medium text-[#686868] transition-colors hover:bg-black/[0.05] hover:text-[#111111]">Product</a><a href="#workflow" className="rounded-xl px-3 py-2 text-[12px] font-medium text-[#686868] transition-colors hover:bg-black/[0.05] hover:text-[#111111]">How it works</a><a href="#principles" className="rounded-xl px-3 py-2 text-[12px] font-medium text-[#686868] transition-colors hover:bg-black/[0.05] hover:text-[#111111]">Principles</a></div>
        <div className="flex items-center gap-1.5"><ThemeToggle /><Link to="/signin" className="rounded-xl px-3 py-2 text-[12px] font-semibold text-[#686868] transition-colors hover:bg-black/[0.05] hover:text-[#111111]">Sign in</Link><Link to="/signup" className="rounded-xl bg-[#111111] px-3.5 py-2 text-[12px] font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.16)] transition-transform hover:-translate-y-px">Get started</Link></div>
      </nav>

      <section id="product" className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-20 sm:px-8 sm:pt-28 lg:grid-cols-[0.86fr_1.14fr] lg:gap-16 lg:pb-28">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
          <div className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/65 px-3 py-1.5 text-[11px] font-semibold text-[#686868] backdrop-blur-xl"><span className="h-1.5 w-1.5 rounded-full bg-[#3157FF]" />Outbound intelligence for thoughtful teams</div>
          <h1 className="mt-6 max-w-xl text-[3.35rem] font-semibold leading-[0.96] tracking-[-0.075em] sm:text-7xl">Find the signal.<br /><span className="text-[#3157FF]">Start the conversation.</span></h1>
          <p className="mt-7 max-w-lg text-[16px] leading-7 text-[#686868] sm:text-[18px]">Outbound brings prospect discovery, research, scoring, and personalized outreach into one calm workspace—so your team spends less time guessing who to contact.</p>
          <div className="mt-8 flex flex-wrap items-center gap-3"><Link to="/signup" className="group inline-flex items-center gap-2 rounded-xl bg-[#3157FF] px-5 py-3 text-[13px] font-semibold text-white shadow-[0_10px_24px_rgba(49,87,255,0.2)] transition-all hover:-translate-y-0.5 hover:bg-[#2545D9]">Create your workspace <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></Link><a href="#workflow" className="inline-flex items-center gap-1.5 rounded-xl border border-black/[0.09] bg-white/75 px-5 py-3 text-[13px] font-semibold transition-colors hover:bg-white">See how it works <ChevronRight className="h-4 w-4 text-[#949494]" /></a></div>
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-[#686868]"><span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" />Review before sending</span><span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" />Evidence behind every lead</span></div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 26, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}><DashboardPreview /></motion.div>
      </section>

      <section id="workflow" className="relative border-y border-black/[0.06] bg-white/55 px-5 py-10 sm:px-8"><div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">{capabilities.map(({ icon: Icon, label, text }, index) => <div key={label} className="flex gap-3 rounded-2xl border border-black/[0.06] bg-white/65 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#F7F7F5] text-[#3157FF]"><Icon className="h-4 w-4" /></div><div><p className="text-[12px] font-semibold">0{index + 1} / {label}</p><p className="mt-1 text-[12px] leading-5 text-[#686868]">{text}</p></div></div>)}</div></section>

      <section id="principles" className="mx-auto grid max-w-6xl gap-8 px-5 py-16 sm:px-8 sm:py-20 md:grid-cols-[0.8fr_1.2fr] md:items-end"><div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3157FF]">A better outbound rhythm</p><h2 className="mt-3 max-w-md text-3xl font-semibold tracking-[-0.06em] sm:text-4xl">Clarity before scale.</h2></div><p className="max-w-xl text-[15px] leading-7 text-[#686868]">Outbound is designed around a simple sequence: understand the account, make the message useful, and keep the human in control. No black-box blasts. No vanity metrics.</p></section>

      <footer className="border-t border-black/[0.07] bg-[#111111] text-white"><div className="mx-auto grid max-w-6xl gap-12 px-5 py-12 sm:px-8 md:grid-cols-[1.3fr_0.7fr_0.7fr_0.9fr]"><div><div className="flex items-center gap-2.5"><LogoMark /><span className="text-[15px] font-semibold tracking-[-0.03em]">Outbound</span></div><p className="mt-5 max-w-xs text-[13px] leading-6 text-white/55">A focused operating system for finding the right accounts and starting better conversations.</p><div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[10px] text-white/60"><Command className="h-3 w-3" />Built for signal, not noise</div></div><div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Product</p><div className="mt-4 space-y-3 text-[12px] text-white/65"><a href="#product" className="block hover:text-white">Overview</a><a href="#workflow" className="block hover:text-white">How it works</a><Link to="/signup" className="block hover:text-white">Get started</Link></div></div><div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Workspace</p><div className="mt-4 space-y-3 text-[12px] text-white/65"><Link to="/signin" className="block hover:text-white">Sign in</Link><Link to="/signup" className="block hover:text-white">Create account</Link><a href="#principles" className="block hover:text-white">Principles</a></div></div><div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Stay focused</p><p className="mt-4 text-[12px] leading-5 text-white/55">Discover deliberately. Research deeply. Send when it is ready.</p><Link to="/signup" className="mt-5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#a9b9ff] hover:text-white">Start with Outbound <ArrowRight className="h-3.5 w-3.5" /></Link></div></div><div className="mx-auto flex max-w-6xl flex-col gap-2 border-t border-white/10 px-5 py-5 text-[10px] text-white/40 sm:flex-row sm:items-center sm:justify-between sm:px-8"><span>© {new Date().getFullYear()} Outbound</span><span>Thoughtful outreach, built with intent.</span></div></footer>
    </main>
  );
}
