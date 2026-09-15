import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Plus,
  ExternalLink,
  ShieldCheck,
  Check,
  ChevronDown,
  Sparkles,
  Layers,
  Building2,
  Mail,
} from 'lucide-react';
import { Prospect } from '../../types';
import { getScoreColor, getStatusBadge } from '../../lib/utils';
import { useAppState } from '../../lib/state/AppStateContext';
import { useToast } from '../../lib/state/ToastContext';

export function ProspectDiscoveryView() {
  const { prospects, campaigns, addProspectsToCampaign } = useAppState();
  const { showToast } = useToast();
  const { setSelectedProspectId, setIsCampaignWizardOpen } = useOutletContext<{ 
    setSelectedProspectId: (id: string | null) => void,
    setIsCampaignWizardOpen: (v: boolean) => void 
  }>();

  const onSelectProspect = (p: Prospect) => setSelectedProspectId(p.id);
  const onOpenCampaignWizard = () => setIsCampaignWizardOpen(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);
  const [sortField, setSortField] = useState<'fitScore' | 'name' | 'websiteScore'>('fitScore');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);

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
          diff = a.company.websiteQualityScore - b.company.websiteQualityScore;
        } else {
          diff = a.company.name.localeCompare(b.company.name);
        }
        return sortDirection === 'desc' ? -diff : diff;
      });
  }, [prospects, searchQuery, industryFilter, statusFilter, minScoreFilter, sortField, sortDirection]);

  // Unique industries for filter dropdown
  const industries = useMemo(() => {
    return Array.from(new Set(prospects.map((p) => p.company.industry)));
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
    
    const escapeCsv = (str: string) => `"${String(str).replace(/"/g, '""')}"`;
    
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
    link.setAttribute('download', `outboundos-prospects-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('CSV exported', `Exported ${filteredProspects.length} verified prospect records.`);
  };

  const handleBulkAddToCampaign = async (campaignId: string) => {
    if (selectedIds.size === 0) return;
    try {
      await addProspectsToCampaign(Array.from(selectedIds), campaignId);
      const campaign = campaigns.find((c) => c.id === campaignId);
      showToast('Added to campaign', `Assigned ${selectedIds.size} prospects to ${campaign?.name}.`);
      setSelectedIds(new Set());
      setShowAssignDropdown(false);
    } catch (e) {
      showToast('Error', 'Failed to add prospects to campaign', 'error');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">Prospect Discovery</h1>
          <p className="text-[14px] text-[#686868] mt-0.5">
            Verified high-intent accounts researched by AI with detected conversion gaps.
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
            onClick={onOpenCampaignWizard}
            className="px-4 py-2 rounded-xl text-[13px] font-medium text-white bg-[#3157FF] hover:bg-[#2545D9] transition-colors flex items-center gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
          >
            <Plus className="w-4 h-4" />
            Find New Prospects
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
            <option value="ready">Ready</option>
            <option value="in_sequence">In Sequence</option>
            <option value="contacted">Contacted</option>
            <option value="interested">Interested</option>
            <option value="unverified">Unverified</option>
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

                      {/* Company Name & Domain */}
                      <td className="py-3.5 px-4 font-medium text-[#111111] max-w-[200px]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-stone-100 border border-black/[0.05] flex items-center justify-center font-semibold text-[11px] text-stone-700 shrink-0">
                            {prospect.company.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="truncate">
                            <span className="truncate block font-medium hover:text-[#3157FF] transition-colors">
                              {prospect.company.name}
                            </span>
                            <span className="text-[11px] text-[#949494] block font-mono truncate">
                              {prospect.company.domain}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Industry */}
                      <td className="py-3.5 px-4 text-[#686868] whitespace-nowrap">
                        {prospect.company.industry}
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-[#686868] whitespace-nowrap">
                        {prospect.company.location}
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-[#111111] font-medium leading-snug flex items-center gap-1.5">
                          <span>{prospect.contact.fullName}</span>
                          {prospect.contact.emailVerified && (
                            <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" title="Verified MX" />
                          )}
                        </div>
                        <span className="text-[11px] text-[#949494] block leading-snug">
                          {prospect.contact.role}
                        </span>
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
            <strong className="text-[#111111] font-medium tnum">{prospects.length}</strong> researched prospects
          </span>
          <span className="text-[11px] text-[#949494]">Click any row to open research dossier & AI email draft</span>
        </div>
      </div>

      {/* Mobile Card View (Properly adapted, never squished!) */}
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
    </div>
  );
}
