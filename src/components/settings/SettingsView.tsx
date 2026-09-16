import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Users,
  Building,
  Mail,
  Plus,
  LogOut,
} from 'lucide-react';
import { useToast } from "../../lib/state/ToastContext";
import { useAppState } from "../../lib/state/AppStateContext";
import { useAuth } from "../../lib/auth/AuthProvider";
import { useWorkspace } from "../../lib/workspaces/WorkspaceProvider";

export function SettingsView() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { resetStorage, prospects, campaigns } = useAppState();
  const { user, profile, signOut } = useAuth();
  const { workspace, updateWorkspace } = useWorkspace();

  const [wsName, setWsName] = useState(workspace?.name || 'My Workspace');
  const [industry, setIndustry] = useState(workspace?.industry || 'B2B Software');
  const [geography, setGeography] = useState(workspace?.geography || 'United States');
  const [companySize, setCompanySize] = useState(workspace?.company_size || '10-50 employees');
  const [offer, setOffer] = useState(workspace?.offer || 'AI Web Optimization & Lead Gen');
  const [bookingLink, setBookingLink] = useState(workspace?.booking_link || '');
  const [aiReplyMode, setAiReplyMode] = useState<'suggest' | 'approve' | 'auto'>(workspace?.ai_reply_mode || 'suggest');

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (workspace) {
        await updateWorkspace({
          name: wsName,
          industry,
          geography,
          company_size: companySize,
          offer,
          booking_link: bookingLink.trim(),
          ai_reply_mode: aiReplyMode,
        });
        showToast('Workspace Saved', 'Settings updated in database.');
      }
    } catch (err) {
      showToast('Error', 'Failed to save workspace preferences.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const totalProspectsCount = prospects.length;
  const totalCampaignsCount = campaigns.length;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">Settings & Workspace</h1>
        <p className="text-[14px] text-[#686868] mt-0.5">
          Manage sending mailbox preferences, target ICP parameters, and workspace configuration.
        </p>
      </div>

      <div className="p-6 bg-white rounded-2xl border border-black/[0.07] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4">
        <div>
          <h3 className="text-[16px] font-semibold text-[#111111]">Booking & AI reply preferences</h3>
          <p className="text-[13px] text-[#686868] mt-1">Give interested prospects a clear next step and decide how much control AI has.</p>
        </div>
        <label className="block text-xs font-semibold text-[#333]">Booking link
          <input type="url" value={bookingLink} onChange={(e) => setBookingLink(e.target.value)} placeholder="https://cal.com/your-name" className="mt-1.5 w-full px-3 py-2.5 bg-[#f9f9f8] border border-black/10 rounded-xl text-xs focus:outline-none focus:border-[#3157FF]" />
        </label>
        <label className="block text-xs font-semibold text-[#333]">AI reply behavior
          <select value={aiReplyMode} onChange={(e) => setAiReplyMode(e.target.value as typeof aiReplyMode)} className="mt-1.5 w-full px-3 py-2.5 bg-[#f9f9f8] border border-black/10 rounded-xl text-xs focus:outline-none focus:border-[#3157FF]">
            <option value="suggest">Suggest replies only</option>
            <option value="approve">Draft replies for my approval</option>
            <option value="auto">Automate low-risk replies (booking link only)</option>
          </select>
        </label>
        <p className="text-[11px] text-[#686868]">Automatic mode must never handle unsubscribe, legal, pricing, or sensitive requests. Those stay human-reviewed.</p>
      </div>

      {/* Account Profile Card */}
      <div className="p-6 bg-white rounded-2xl border border-black/[0.07] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-semibold text-[#111111]">User Account</h3>
          <button
            onClick={async () => {
              await signOut();
              showToast('Signed Out', 'You have been signed out.');
              navigate('/login', { replace: true });
            }}
            className="px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-medium flex items-center gap-1.5 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-[#686868] block mb-1 font-medium">Full Name</label>
            <div className="px-3 py-2 bg-[#f9f9f8] border border-black/10 rounded-xl font-medium text-[#111]">
              {profile?.full_name || user?.user_metadata?.full_name || 'Account Owner'}
            </div>
          </div>
          <div>
            <label className="text-[#686868] block mb-1 font-medium">Email Address</label>
            <div className="px-3 py-2 bg-[#f9f9f8] border border-black/10 rounded-xl font-mono text-[#111]">
              {profile?.email || user?.email || 'user@company.com'}
            </div>
          </div>
        </div>
      </div>

      {/* Workspace ICP Configuration */}
      <div className="p-6 bg-white rounded-2xl border border-black/[0.07] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-semibold text-[#111111]">Target Ideal Customer Profile (ICP)</h3>
          <span className="text-xs text-[#888888] font-mono">ID: {workspace?.id?.slice(0, 8)}...</span>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="text-[#333] font-semibold block mb-1.5">Workspace Name</label>
            <input
              type="text"
              value={wsName}
              onChange={(e) => setWsName(e.target.value)}
              className="w-full px-3 py-2 bg-[#f9f9f8] border border-black/10 rounded-xl text-xs focus:outline-none focus:border-[#3157FF]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[#333] font-semibold block mb-1.5">Target Industry</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2 bg-[#f9f9f8] border border-black/10 rounded-xl text-xs focus:outline-none focus:border-[#3157FF]"
              />
            </div>

            <div>
              <label className="text-[#333] font-semibold block mb-1.5">Target Geography</label>
              <input
                type="text"
                value={geography}
                onChange={(e) => setGeography(e.target.value)}
                className="w-full px-3 py-2 bg-[#f9f9f8] border border-black/10 rounded-xl text-xs focus:outline-none focus:border-[#3157FF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[#333] font-semibold block mb-1.5">Target Company Size</label>
              <input
                type="text"
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="w-full px-3 py-2 bg-[#f9f9f8] border border-black/10 rounded-xl text-xs focus:outline-none focus:border-[#3157FF]"
              />
            </div>

            <div>
              <label className="text-[#333] font-semibold block mb-1.5">Primary Value Proposition / Offer</label>
              <input
                type="text"
                value={offer}
                onChange={(e) => setOffer(e.target.value)}
                className="w-full px-3 py-2 bg-[#f9f9f8] border border-black/10 rounded-xl text-xs focus:outline-none focus:border-[#3157FF]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Usage Summary */}
      <div className="p-6 bg-white rounded-2xl border border-black/[0.07] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4">
        <h3 className="text-[16px] font-semibold text-[#111111]">Workspace Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-stone-50 border border-black/[0.05] space-y-1">
            <span className="text-xs text-[#686868]">Discovered Prospects</span>
            <div className="text-xl font-bold text-[#111]">{totalProspectsCount}</div>
          </div>
          <div className="p-4 rounded-xl bg-stone-50 border border-black/[0.05] space-y-1">
            <span className="text-xs text-[#686868]">Active Campaigns</span>
            <div className="text-xl font-bold text-[#111]">{totalCampaignsCount}</div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-between items-center pt-2">
        <button
          onClick={() => {
            if (window.confirm('Reset workspace local state cache?')) {
              resetStorage();
            }
          }}
          className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
        >
          Clear Workspace Cache
        </button>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#111111] hover:bg-black transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Workspace Settings'}
        </button>
      </div>
    </div>
  );
}
