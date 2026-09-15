import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Building2,
  Send,
  Sparkles,
  Mail,
  BarChart3,
  Sliders,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { Prospect, Campaign } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  prospects: Prospect[];
  campaigns: Campaign[];
  onSelectProspect: (prospect: Prospect) => void;
  onSelectCampaign: (campaign: Campaign) => void;
  onNavigate: (tab: string) => void;
  onCreateCampaign: () => void;
  onOpenResearch: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  prospects,
  campaigns,
  onSelectProspect,
  onSelectCampaign,
  onNavigate,
  onCreateCampaign,
  onOpenResearch,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          setQuery('');
          setSelectedIndex(0);
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const results: {
      id: string;
      title: string;
      subtitle?: string;
      category: 'Actions' | 'Prospects' | 'Campaigns' | 'Navigation';
      icon: typeof Search;
      action: () => void;
    }[] = [];

    // Static Actions
    const actions = [
      {
        id: 'act-create-campaign',
        title: 'Create new campaign',
        subtitle: 'Start AI audience discovery workflow',
        category: 'Actions' as const,
        icon: Plus,
        action: () => {
          onClose();
          onCreateCampaign();
        },
      },
      {
        id: 'act-research-company',
        title: 'Research company URL',
        subtitle: 'Inspect conversion opportunities and website intelligence',
        category: 'Actions' as const,
        icon: Sparkles,
        action: () => {
          onClose();
          onOpenResearch();
        },
      },
      {
        id: 'nav-inbox',
        title: 'Open Inbox & Replies',
        subtitle: 'View interested lead responses and draft AI follow-ups',
        category: 'Navigation' as const,
        icon: Mail,
        action: () => {
          onClose();
          onNavigate('inbox');
        },
      },
      {
        id: 'nav-analytics',
        title: 'View Analytics & Funnel',
        subtitle: 'Inspect response rates, angles, and score correlations',
        category: 'Navigation' as const,
        icon: BarChart3,
        action: () => {
          onClose();
          onNavigate('analytics');
        },
      },
      {
        id: 'nav-settings',
        title: 'Workspace Settings & Sending Limits',
        subtitle: 'Configure daily mail volumes, team, and APIs',
        category: 'Navigation' as const,
        icon: Sliders,
        action: () => {
          onClose();
          onNavigate('settings');
        },
      },
    ];

    actions.forEach((a) => {
      if (!q || a.title.toLowerCase().includes(q) || (a.subtitle && a.subtitle.toLowerCase().includes(q))) {
        results.push(a);
      }
    });

    // Campaigns
    campaigns.forEach((c) => {
      if (!q || c.name.toLowerCase().includes(q) || c.targetIndustry.toLowerCase().includes(q)) {
        results.push({
          id: `cmp-${c.id}`,
          title: c.name,
          subtitle: `${c.targetIndustry} • ${c.stats.prospects} prospects • ${c.stats.replies} replies`,
          category: 'Campaigns',
          icon: Send,
          action: () => {
            onClose();
            onSelectCampaign(c);
          },
        });
      }
    });

    // Prospects
    prospects.forEach((p) => {
      if (
        !q ||
        p.company.name.toLowerCase().includes(q) ||
        p.contact.fullName.toLowerCase().includes(q) ||
        p.company.location.toLowerCase().includes(q)
      ) {
        results.push({
          id: `pr-${p.id}`,
          title: p.company.name,
          subtitle: `${p.contact.fullName} (${p.contact.role}) • Fit ${p.fitScore} • ${p.company.location}`,
          category: 'Prospects',
          icon: Building2,
          action: () => {
            onClose();
            onSelectProspect(p);
          },
        });
      }
    });

    return results.slice(0, 10);
  }, [query, prospects, campaigns, onClose, onCreateCampaign, onOpenResearch, onNavigate, onSelectCampaign, onSelectProspect]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, items.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + items.length) % Math.max(1, items.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[selectedIndex]) {
        items[selectedIndex].action();
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="command-palette-modal" className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 pointer-events-none" role="dialog" aria-modal="true" aria-label="Command Palette">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/25 backdrop-blur-[2px] pointer-events-auto"
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative w-full max-w-xl bg-white rounded-2xl border border-black/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col z-10 pointer-events-auto"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-black/[0.06] gap-3">
              <Search className="w-4 h-4 text-[#949494] shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search campaigns, prospects, companies, actions..."
                className="w-full text-[14px] text-[#111111] placeholder:text-[#949494] bg-transparent outline-none"
              />
              <span className="text-[11px] font-mono text-[#949494] bg-stone-100 border border-stone-200 px-1.5 py-0.5 rounded">
                ESC
              </span>
            </div>

            {/* Results List */}
            <div className="max-h-[380px] overflow-y-auto p-2">
              {items.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-[13px] text-[#686868]">No matching results found for "{query}"</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {items.map((item, idx) => {
                    const Icon = item.icon;
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={item.action}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-colors ${
                          isSelected ? 'bg-stone-100/90 text-[#111111]' : 'text-[#686868] hover:bg-stone-50'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? 'bg-white border-black/[0.08] text-[#111111]'
                              : 'bg-stone-50 border-black/[0.04] text-[#949494]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[13px] font-medium text-[#111111] truncate">{item.title}</span>
                            <span className="text-[10px] uppercase font-semibold tracking-wider text-[#949494] shrink-0">
                              {item.category}
                            </span>
                          </div>
                          {item.subtitle && (
                            <p className="text-[12px] text-[#686868] truncate mt-0.5">{item.subtitle}</p>
                          )}
                        </div>
                        {isSelected && <ArrowRight className="w-3.5 h-3.5 text-[#949494] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Navigation Hints */}
            <div className="px-4 py-2 bg-stone-50/70 border-t border-black/[0.05] flex items-center justify-between text-[11px] text-[#949494]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-stone-200">↑</kbd>
                  <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-stone-200">↓</kbd>
                  to navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-stone-200">↵</kbd>
                  to select
                </span>
              </div>
              <span>OutboundOS Quick Navigation</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
