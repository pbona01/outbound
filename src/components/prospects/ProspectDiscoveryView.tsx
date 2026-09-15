import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Search,
  ArrowUpDown,
  Download,
  Plus,
  Layers,
  Sparkles,
  Users,
  Building2,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { Prospect } from '../../types';
import { getScoreColor, getStatusBadge } from '../../lib/utils';
import { useAppState } from '../../lib/state/AppStateContext';
import { useToast } from '../../lib/state/ToastContext';

export function ProspectDiscoveryView() {
  const {
    prospects,
    campaigns,
    addProspectsToCampaign,
    addManualProspect,
    discoverProspects,
    isLoading,
  } = useAppState();
  const { showToast } = useToast();
  const { setSelectedProspectId, setIsCampaignWizardOpen } = useOutletContext<{
    setSelectedProspectId: (id: string | null) => void;
    setIsCampaignWizardOpen: (v: boolean) => void;
  }>();

  const onSelectProspect = (p: Prospect) => setSelectedProspectId(p.id);
  const onOpenCampaignWizard = () => setIsCampaignWizardOpen(true);

  // Filters & sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);
  const [sortField, setSortField] = useState<'fitScore' | 'name' | 'websiteScore'>('fitScore');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);

  // Manual Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [manualForm, setManualForm] = useState({
    companyName: '',
    domain: '',
    industry: 'Technology',
    location: '',
    firstName: '',
    lastName: '',
    role: '',
    email: '',
    phone: '',
    primaryProblem: '',
    fitScore: 85,
    campaignId: '',
  });

  // Discovery Modal State
  const [isDiscoveryModalOpen, setIsDiscoveryModalOpen] = useState(false);
  const [discoveryState, setDiscoveryState] = useState<'idle' | 'submitted' | 'searching' | 'returned' | 'empty' | 'unavailable'>('idle');
  const [discoveryQuery, setDiscoveryQuery] = useState('');
  const [discoveryIndustry, setDiscoveryIndustry] = useState('B2B SaaS');
  const [discoveryGeo, setDiscoveryGeo] = useState('United States');
  const [discoveredResults, setDiscoveredResults] = useState<Prospect[]>([]);
  const [selectedDiscoveredIds, setSelectedDiscoveredIds] = useState<Set<string>>(new Set());

  // Filtered & sorted prospects
  const filteredProspects = useMemo(() => {
    return prospects
      .filter((p) => {
        const matchesSearch =
          !searchQuery ||
          p.company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.contact.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.company.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.primaryProblem.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesIndustry = industryFilter === 'all' || p.company.industry === industryFilter;
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        const matchesScore = p.fitScore >= minScoreFilter;

        return matchesSearch && matchesIndustry && matchesStatus && matchesScore;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'fitScore') {
          diff = a.fitScore - b.fitScore;
        } else if (sortField === 'websiteScore') {
          diff = (a.company.websiteQualityScore || 0) - (b.company.websiteQualityScore || 0);
        } else {
          diff = a.company.name.localeCompare(b.company.name);
        }
        return sortDirection === 'desc' ? -diff : diff;
      });
  }, [prospects, searchQuery, industryFilter, statusFilter, minScoreFilter, sortField, sortDirection]);

  // Unique industries for filter dropdown
  const industries = useMemo(() => {
    return Array.from(new Set(prospects.map((p) => p.company.industry).filter(Boolean)));
  }, [prospects]);

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredProspects.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProspects.map((p) => p.id)));
    }
  };

  const handleExportCSV = () => {
    const headers = 'Company,Industry,Location,Website,Contact,Role,Email,Fit Score,Website Health,Primary Issue,Status\n';
    const escapeCsv = (str: string) => `"${String(str || '').replace(/"/g, '""')}"`;

    const rows = filteredProspects
      .map((p) =>
        [
          p.company.name,
          p.company.industry,
          p.company.location,
          p.company.websiteUrl,
          p.contact.fullName,
          p.contact.role,
          p.contact.email,
          p.fitScore,
          p.company.websiteQualityScore,
          p.primaryProblem,
          p.status,
        ]
          .map(escapeCsv)
          .join(',')
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `outbound-prospects-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('CSV exported', `Exported ${filteredProspects.length} prospect records.`);
  };

  const handleBulkAddToCampaign = async (campaignId: string) => {
    if (selectedIds.size === 0) return;
    try {
      await addProspectsToCampaign(Array.from(selectedIds), campaignId);
      const campaign = campaigns.find((c) => c.id === campaignId);
      showToast('Added to campaign', `Assigned ${selectedIds.size} prospects to ${campaign?.name || 'campaign'}.`);
      setSelectedIds(new Set());
      setShowAssignDropdown(false);
    } catch {
      showToast('Error', 'Failed to add prospects to campaign', 'error');
    }
  };

  const handleManualAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.companyName.trim() || !manualForm.firstName.trim() || !manualForm.lastName.trim()) {
      showToast('Validation Error', 'Company name, first name, and last name are required.', 'error');
      return;
    }

    if (manualForm.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(manualForm.email.trim())) {
        showToast('Validation Error', 'Please enter a valid email address.', 'error');
        return;
      }
    }

    setIsAdding(true);
    try {
      await addManualProspect({
        companyName: manualForm.companyName.trim(),
        domain: manualForm.domain.trim() || undefined,
        industry: manualForm.industry.trim() || undefined,
        location: manualForm.location.trim() || undefined,
        firstName: manualForm.firstName.trim(),
        lastName: manualForm.lastName.trim(),
        role: manualForm.role.trim() || undefined,
        email: manualForm.email.trim() || undefined,
        phone: manualForm.phone.trim() || undefined,
        primaryProblem: manualForm.primaryProblem.trim() || undefined,
        fitScore: manualForm.fitScore,
        campaignId: manualForm.campaignId || undefined,
      });

      showToast('Prospect added', `${manualForm.companyName} added to workspace.`);
      setIsAddModalOpen(false);
      setManualForm({
        companyName: '',
        domain: '',
        industry: 'Technology',
        location: '',
        firstName: '',
        lastName: '',
        role: '',
        email: '',
        phone: '',
        primaryProblem: '',
        fitScore: 85,
        campaignId: '',
      });
    } catch (err: any) {
      showToast('Error', err?.message || 'Failed to add prospect', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRunDiscovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setDiscoveryState('submitted');

    setTimeout(async () => {
      setDiscoveryState('searching');
      try {
        const results = await discoverProspects({
          query: discoveryQuery,
          industry: discoveryIndustry,
          geography: discoveryGeo,
        });

        if (results && results.length > 0) {
          setDiscoveredResults(results);
          setSelectedDiscoveredIds(new Set(results.map((p) => p.id)));
          setDiscoveryState('returned');
        } else {
          setDiscoveredResults([]);
          setDiscoveryState('empty');
        }
      } catch {
        setDiscoveredResults([]);
        setDiscoveryState('unavailable');
      }
    }, 400);
  };

  return (
    <div className="space-y-4">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">Prospects</h1>
          <p className="text-[14px] text-[#686868] mt-0.5">
            Verified high-intent accounts and decision makers scoped to your active workspace.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowAssignDropdown(!showAssignDropdown)}
                className="px-3.5 py-2 rounded-xl text-[13px] font-medium bg-[#111111] text-white hover:bg-black transition-colors flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" />
                Add ({selectedIds.size}) to Campaign
              </button>
              {showAssignDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowAssignDropdown(false)} />
                  <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-lg border border-black/[0.08] z-20 overflow-hidden">
                    <div className="p-2 border-b border-black/[0.04]">
                      <span className="text-[11px] font-semibold text-[#949494] uppercase tracking-wider px-2">
                        Select Campaign
                      </span>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto p-1">
                      {campaigns.length === 0 ? (
                        <div className="px-3 py-4 text-center text-[13px] text-[#686868]">
                          No campaigns available.
                        </div>
                      ) : (
                        campaigns.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => handleBulkAddToCampaign(c.id)}
                            className="w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium text-[#111111] hover:bg-stone-50 transition-colors"
                          >
                            {c.name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-[13px] font-medium text-[#111111] bg-white border border-black/[0.08] hover:bg-stone-50 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add prospect
          </button>

          <button
            onClick={() => {
              setDiscoveryState('idle');
              setIsDiscoveryModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl text-[13px] font-medium text-white bg-[#3157FF] hover:bg-[#2545D9] transition-colors flex items-center gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
          >
            <Sparkles className="w-4 h-4" />
            Discover leads
          </button>
        </div>
      </div>

      {/* Toolbar: Search, Filters, Sort, Export */}
      <div className="bg-white p-3 rounded-2xl border border-black/[0.07] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        {/* Search input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#949494] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company, contact, city, problem..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-black/[0.06] bg-[#F7F7F5]/50 text-[13px] text-[#111111] placeholder:text-[#949494] focus:outline-none focus:bg-white focus:border-[#3157FF] transition-all"
          />
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Industry dropdown */}
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-black/[0.07] bg-white text-[13px] text-[#111111] focus:outline-none hover:border-black/[0.14] transition-colors cursor-pointer"
          >
            <option value="all">All Industries</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>

          {/* Status dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-black/[0.07] bg-white text-[13px] text-[#111111] focus:outline-none hover:border-black/[0.14] transition-colors cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="ready">Ready to Review</option>
            <option value="in_sequence">In Sequence</option>
            <option value="contacted">Contacted</option>
            <option value="interested">Interested</option>
            <option value="meeting_booked">Meeting Booked</option>
            <option value="not_interested">Not Interested</option>
          </select>

          {/* Min Score filter */}
          <select
            value={minScoreFilter}
            onChange={(e) => setMinScoreFilter(Number(e.target.value))}
            className="px-3 py-2 rounded-xl border border-black/[0.07] bg-white text-[13px] text-[#111111] focus:outline-none hover:border-black/[0.14] transition-colors cursor-pointer"
          >
            <option value={0}>Any Fit Score</option>
            <option value={80}>Fit Score &gt; 80 (High Priority)</option>
            <option value={90}>Fit Score &gt; 90 (Tier 1)</option>
          </select>

          {/* Sort field */}
          <button
            onClick={() => {
              if (sortField === 'fitScore') {
                setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
              } else {
                setSortField('fitScore');
                setSortDirection('desc');
              }
            }}
            className="px-3 py-2 rounded-xl border border-black/[0.07] bg-white hover:bg-stone-50 text-[13px] text-[#686868] flex items-center gap-1.5 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Score {sortDirection === 'desc' ? '↓' : '↑'}</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl border border-black/[0.07] bg-white hover:bg-stone-50 text-[13px] text-[#686868] flex items-center gap-1.5 transition-colors"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-black/[0.07] p-8 space-y-4">
          <div className="flex items-center justify-center space-x-2 text-stone-500 py-8">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-[14px]">Loading workspace prospects...</span>
          </div>
        </div>
      ) : prospects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/[0.07] border-dashed p-12 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center">
            <Users className="w-6 h-6 text-[#949494]" />
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-[#111111]">No prospects in this workspace yet</h3>
            <p className="text-[13px] text-[#686868] mt-1 max-w-md mx-auto">
              Add verified decision makers to target or use AI discovery to search for high-intent accounts in your target ICP.
            </p>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl text-[13px] font-medium text-[#111111] bg-white border border-black/[0.1] hover:bg-stone-50 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add prospect manually
            </button>
            <button
              onClick={onOpenCampaignWizard}
              className="px-4 py-2 rounded-xl text-[13px] font-medium text-white bg-[#3157FF] hover:bg-[#2545D9] transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              Launch campaign discovery
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl border border-black/[0.07] shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/[0.06] bg-[#F7F7F5]/70 text-[12px] font-semibold text-[#686868] uppercase tracking-wider">
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.size > 0 && selectedIds.size === filteredProspects.length}
                        onChange={handleSelectAll}
                        className="rounded border-stone-300 text-[#3157FF] focus:ring-[#3157FF] cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4">Industry</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4 text-center">Fit Score</th>
                    <th className="py-3 px-4 text-center">Web Health</th>
                    <th className="py-3 px-4">Conversion Opportunity</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.05] text-[13px]">
                  {filteredProspects.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-16 text-center text-[#686868]">
                        <div className="max-w-xs mx-auto space-y-2">
                          <p className="text-[14px] font-medium text-[#111111]">No prospects match your filters</p>
                          <p className="text-[12px] text-[#949494]">
                            Try resetting your search query or adjusting your minimum fit score threshold.
                          </p>
                          <button
                            onClick={() => {
                              setSearchQuery('');
                              setIndustryFilter('all');
                              setStatusFilter('all');
                              setMinScoreFilter(0);
                            }}
                            className="text-[12px] text-[#3157FF] font-medium hover:underline mt-2"
                          >
                            Reset filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProspects.map((prospect) => {
                      const scoreStyle = getScoreColor(prospect.fitScore);
                      const isSelected = selectedIds.has(prospect.id);
                      const statusBadge = getStatusBadge(prospect.status);

                      return (
                        <tr
                          key={prospect.id}
                          onClick={() => onSelectProspect(prospect)}
                          className={`hover:bg-stone-50/80 cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-50/30' : ''
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-3.5 px-4" onClick={(e) => handleToggleSelect(prospect.id, e)}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="rounded border-stone-300 text-[#3157FF] focus:ring-[#3157FF] cursor-pointer"
                            />
                          </td>

                          {/* Company */}
                          <td className="py-3.5 px-4 font-medium text-[#111111]">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-3.5 h-3.5 text-[#949494]" />
                              <span>{prospect.company.name}</span>
                            </div>
                          </td>

                          {/* Industry */}
                          <td className="py-3.5 px-4 text-[#686868]">{prospect.company.industry}</td>

                          {/* Location */}
                          <td className="py-3.5 px-4 text-[#686868]">{prospect.company.location}</td>

                          {/* Contact */}
                          <td className="py-3.5 px-4">
                            <div>
                              <div className="font-medium text-[#111111]">{prospect.contact.fullName}</div>
                              <div className="text-[12px] text-[#686868]">{prospect.contact.role}</div>
                            </div>
                          </td>

                          {/* Fit Score */}
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center justify-center px-2 py-0.5 rounded-lg border text-[12px] font-semibold tnum ${scoreStyle.bg} ${scoreStyle.border} ${scoreStyle.text}`}
                            >
                              {prospect.fitScore}
                            </span>
                          </td>

                          {/* Website Score */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="text-[12px] text-[#686868] font-mono tnum">
                              {prospect.company.websiteQualityScore}
                            </span>
                          </td>

                          {/* Primary Problem */}
                          <td className="py-3.5 px-4 max-w-[260px]">
                            <span
                              className="text-[12px] text-[#686868] line-clamp-1 bg-stone-50 border border-black/[0.04] px-2 py-1 rounded-md"
                              title={prospect.primaryProblem}
                            >
                              “{prospect.primaryProblem}”
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <span
                              className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full border ${statusBadge.classes}`}
                            >
                              {statusBadge.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table footer count */}
            <div className="px-4 py-3 bg-[#F7F7F5]/50 border-t border-black/[0.06] flex items-center justify-between text-[12px] text-[#686868]">
              <span>
                Showing <strong className="text-[#111111] font-medium tnum">{filteredProspects.length}</strong> of{' '}
                <strong className="text-[#111111] font-medium tnum">{prospects.length}</strong> workspace prospects
              </span>
              <span className="text-[11px] text-[#949494]">Click any row to open research drawer</span>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {filteredProspects.map((prospect) => {
              const scoreStyle = getScoreColor(prospect.fitScore);
              const statusBadge = getStatusBadge(prospect.status);

              return (
                <div
                  key={prospect.id}
                  onClick={() => onSelectProspect(prospect)}
                  className="p-4 bg-white rounded-2xl border border-black/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-3 active:scale-[0.99] transition-transform cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-stone-100 border border-black/[0.06] flex items-center justify-center font-semibold text-xs text-stone-700 shrink-0">
                        {prospect.company.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-[14px] font-semibold text-[#111111] leading-tight">
                          {prospect.company.name}
                        </h3>
                        <p className="text-[12px] text-[#686868] mt-0.5">
                          {prospect.company.location} • {prospect.company.industry}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-lg border text-[12px] font-semibold tnum ${scoreStyle.bg} ${scoreStyle.border} ${scoreStyle.text}`}
                    >
                      {prospect.fitScore}
                    </span>
                  </div>

                  {/* Problem snippet */}
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-black/[0.04] text-[12px] text-[#686868]">
                    <strong className="text-[#111111] font-medium block mb-0.5">Observed Conversion Gap:</strong>
                    “{prospect.primaryProblem}”
                  </div>

                  <div className="flex items-center justify-between text-[12px] pt-1">
                    <div className="flex items-center gap-1.5 text-[#111111]">
                      <span>{prospect.contact.fullName}</span>
                      <span className="text-[#949494]">({prospect.contact.role})</span>
                    </div>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${statusBadge.classes}`}>
                      {statusBadge.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Manual Add Prospect Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-black/[0.08] space-y-4">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
              <div>
                <h3 className="text-[17px] font-semibold text-[#111111]">Add Prospect</h3>
                <p className="text-[12px] text-[#686868] mt-0.5">Add a verified decision maker to your workspace.</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-[#949494] hover:text-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualAddSubmit} className="space-y-4 text-[13px]">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-[#111111]">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={manualForm.companyName}
                    onChange={(e) => setManualForm({ ...manualForm, companyName: e.target.value })}
                    placeholder="Acme Corp"
                    className="w-full px-3 py-2 rounded-xl border border-black/[0.08] focus:outline-none focus:border-[#3157FF]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-[#111111]">Website Domain</label>
                  <input
                    value={manualForm.domain}
                    onChange={(e) => setManualForm({ ...manualForm, domain: e.target.value })}
                    placeholder="acme.com"
                    className="w-full px-3 py-2 rounded-xl border border-black/[0.08] focus:outline-none focus:border-[#3157FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-[#111111]">Industry</label>
                  <input
                    value={manualForm.industry}
                    onChange={(e) => setManualForm({ ...manualForm, industry: e.target.value })}
                    placeholder="Technology, Healthcare..."
                    className="w-full px-3 py-2 rounded-xl border border-black/[0.08] focus:outline-none focus:border-[#3157FF]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-[#111111]">Location</label>
                  <input
                    value={manualForm.location}
                    onChange={(e) => setManualForm({ ...manualForm, location: e.target.value })}
                    placeholder="Austin, TX"
                    className="w-full px-3 py-2 rounded-xl border border-black/[0.08] focus:outline-none focus:border-[#3157FF]"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-black/[0.04] grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-[#111111]">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={manualForm.firstName}
                    onChange={(e) => setManualForm({ ...manualForm, firstName: e.target.value })}
                    placeholder="Jane"
                    className="w-full px-3 py-2 rounded-xl border border-black/[0.08] focus:outline-none focus:border-[#3157FF]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-[#111111]">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={manualForm.lastName}
                    onChange={(e) => setManualForm({ ...manualForm, lastName: e.target.value })}
                    placeholder="Doe"
                    className="w-full px-3 py-2 rounded-xl border border-black/[0.08] focus:outline-none focus:border-[#3157FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-[#111111]">Role / Title</label>
                  <input
                    value={manualForm.role}
                    onChange={(e) => setManualForm({ ...manualForm, role: e.target.value })}
                    placeholder="VP of Growth"
                    className="w-full px-3 py-2 rounded-xl border border-black/[0.08] focus:outline-none focus:border-[#3157FF]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-[#111111]">Contact Email (optional)</label>
                  <input
                    type="email"
                    value={manualForm.email}
                    onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                    placeholder="jane@acme.com"
                    className="w-full px-3 py-2 rounded-xl border border-black/[0.08] focus:outline-none focus:border-[#3157FF]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-medium text-[#111111]">Conversion Opportunity / Pain Point</label>
                <input
                  value={manualForm.primaryProblem}
                  onChange={(e) => setManualForm({ ...manualForm, primaryProblem: e.target.value })}
                  placeholder="e.g. Mobile checkout friction, legacy CRM migration"
                  className="w-full px-3 py-2 rounded-xl border border-black/[0.08] focus:outline-none focus:border-[#3157FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-[#111111]">Initial Fit Score ({manualForm.fitScore})</label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={manualForm.fitScore}
                    onChange={(e) => setManualForm({ ...manualForm, fitScore: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-[#111111]">Assign to Campaign</label>
                  <select
                    value={manualForm.campaignId}
                    onChange={(e) => setManualForm({ ...manualForm, campaignId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-black/[0.08] bg-white text-[13px]"
                  >
                    <option value="">Unassigned</option>
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[13px] font-medium text-[#686868] hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="px-4 py-2 rounded-xl text-[13px] font-medium text-white bg-[#111111] hover:bg-black transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isAdding && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save prospect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Discovery Modal */}
      {isDiscoveryModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-black/[0.08] space-y-4">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
              <div>
                <h3 className="text-[17px] font-semibold text-[#111111]">Discover High-Intent Leads</h3>
                <p className="text-[12px] text-[#686868] mt-0.5">Search verified accounts based on your ICP parameters.</p>
              </div>
              <button
                onClick={() => setIsDiscoveryModalOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-[#949494] hover:text-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {discoveryState === 'idle' && (
              <form onSubmit={handleRunDiscovery} className="space-y-4 text-[13px]">
                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-[#111111]">Natural Language ICP Prompt</label>
                  <input
                    required
                    value={discoveryQuery}
                    onChange={(e) => setDiscoveryQuery(e.target.value)}
                    placeholder="e.g. Series A B2B SaaS in California needing custom landing page conversion"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.08] focus:outline-none focus:border-[#3157FF]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[12px] font-medium text-[#111111]">Target Industry</label>
                    <input
                      value={discoveryIndustry}
                      onChange={(e) => setDiscoveryIndustry(e.target.value)}
                      placeholder="B2B SaaS, Luxury Retail..."
                      className="w-full px-3 py-2 rounded-xl border border-black/[0.08]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[12px] font-medium text-[#111111]">Geography</label>
                    <input
                      value={discoveryGeo}
                      onChange={(e) => setDiscoveryGeo(e.target.value)}
                      placeholder="United States, Austin, TX..."
                      className="w-full px-3 py-2 rounded-xl border border-black/[0.08]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/[0.06]">
                  <button
                    type="button"
                    onClick={() => setIsDiscoveryModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-[13px] font-medium text-[#686868] hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-[13px] font-medium text-white bg-[#3157FF] hover:bg-[#2545D9] transition-colors flex items-center gap-1.5"
                  >
                    <Search className="w-3.5 h-3.5" />
                    Submit criteria & search
                  </button>
                </div>
              </form>
            )}

            {(discoveryState === 'submitted' || discoveryState === 'searching') && (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <Loader2 className="w-8 h-8 text-[#3157FF] animate-spin" />
                <div>
                  <h4 className="text-[15px] font-semibold text-[#111111]">
                    {discoveryState === 'submitted' ? 'Search criteria submitted...' : 'Querying discovery providers...'}
                  </h4>
                  <p className="text-[13px] text-[#686868] mt-1 max-w-sm">
                    Filtering decision-makers and calculating website health benchmarks for "{discoveryQuery || discoveryIndustry}".
                  </p>
                </div>
              </div>
            )}

            {discoveryState === 'empty' && (
              <div className="py-8 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-500">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold text-[#111111]">No matching prospects found</h4>
                  <p className="text-[13px] text-[#686868] mt-1 max-w-sm mx-auto">
                    Try broadening your industry keyword or target geography to expand search coverage.
                  </p>
                </div>
                <button
                  onClick={() => setDiscoveryState('idle')}
                  className="px-4 py-2 rounded-xl text-[13px] font-medium bg-stone-100 hover:bg-stone-200 text-[#111111]"
                >
                  Adjust search criteria
                </button>
              </div>
            )}

            {discoveryState === 'unavailable' && (
              <div className="py-8 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mx-auto text-amber-600">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold text-[#111111]">Discovery provider not connected</h4>
                  <p className="text-[13px] text-[#686868] mt-1 max-w-sm mx-auto">
                    An external B2B data provider (Apollo, Clearbit, or custom scraper endpoint) is not yet active in this environment.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      setIsDiscoveryModalOpen(false);
                      setIsAddModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl text-[13px] font-medium bg-[#111111] text-white hover:bg-black"
                  >
                    Add prospect manually
                  </button>
                  <button
                    onClick={() => setIsDiscoveryModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-[13px] font-medium bg-stone-100 hover:bg-stone-200 text-[#111111]"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {discoveryState === 'returned' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[13px] text-[#686868]">
                  <span>Found <strong>{discoveredResults.length}</strong> matching prospects</span>
                  <button
                    onClick={() => {
                      if (selectedDiscoveredIds.size === discoveredResults.length) {
                        setSelectedDiscoveredIds(new Set());
                      } else {
                        setSelectedDiscoveredIds(new Set(discoveredResults.map((p) => p.id)));
                      }
                    }}
                    className="text-[#3157FF] hover:underline"
                  >
                    {selectedDiscoveredIds.size === discoveredResults.length ? 'Deselect all' : 'Select all'}
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 divide-y divide-black/[0.04]">
                  {discoveredResults.map((p) => {
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
                        className={`pt-2 flex items-center justify-between p-2 rounded-xl cursor-pointer ${
                          isSelected ? 'bg-blue-50/40' : 'hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded border-stone-300 text-[#3157FF]"
                          />
                          <div>
                            <div className="font-medium text-[#111111] text-[13px]">{p.company.name}</div>
                            <div className="text-[12px] text-[#686868]">
                              {p.contact.fullName} ({p.contact.role})
                            </div>
                          </div>
                        </div>
                        <span className="text-[12px] font-semibold text-emerald-700">
                          {p.fitScore} Fit
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/[0.06]">
                  <button
                    onClick={() => setIsDiscoveryModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-[13px] font-medium text-[#686868] hover:bg-stone-100"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
