import { useState } from 'react';
import {
  Mail,
  Clock,
  Archive,
  Sparkles,
  Send,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ThumbsUp,
  AlertCircle,
  ThumbsDown,
  Calendar,
  MessageSquare,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import { useAppState } from '../../lib/state/AppStateContext';
import { useToast } from '../../lib/state/ToastContext';
import { useAuth } from '../../lib/auth/AuthProvider';
import { useWorkspace } from '../../lib/workspaces/WorkspaceProvider';

export function InboxView() {
  const { inboxThreads: threads, sendReply, updateThreadClassification, isLoading } = useAppState();
  const { showToast } = useToast();
  const { profile, user } = useAuth();
  const { workspace } = useWorkspace();
  const userName = profile?.full_name || user?.email?.split('@')[0] || 'You';

  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'unread' | 'interested' | 'meeting_requested' | 'follow_up' | 'not_interested' | 'archived'
  >('all');

  const [selectedThreadId, setSelectedThreadId] = useState<string>('');
  const [mobileScreen, setMobileScreen] = useState<'list' | 'thread'>('list');
  const [replyText, setReplyText] = useState('');
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isUpdatingClassification, setIsUpdatingClassification] = useState(false);
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [aiReply, setAiReply] = useState<{ text: string; rationale?: string } | null>(null);

  const categories = [
    { id: 'all' as const, label: 'All Messages', count: threads.length },
    {
      id: 'interested' as const,
      label: 'Interested',
      count: threads.filter((t) => t.classification === 'interested' || (t as any).rawClassification === 'interested').length,
    },
    {
      id: 'meeting_requested' as const,
      label: 'Meeting Booked',
      count: threads.filter((t) => (t as any).rawClassification === 'meeting_requested').length,
    },
    { id: 'unread' as const, label: 'Unread', count: threads.filter((t) => t.unread).length },
    {
      id: 'follow_up' as const,
      label: 'Follow up & Questions',
      count: threads.filter((t) => t.classification === 'follow_up' || (t as any).rawClassification === 'question').length,
    },
    {
      id: 'not_interested' as const,
      label: 'Not interested',
      count: threads.filter((t) => t.classification === 'not_interested' || (t as any).rawClassification === 'unsubscribe').length,
    },
  ];

  const filteredThreads = threads.filter((t) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'unread') return t.unread;
    if (selectedCategory === 'interested') return t.classification === 'interested' || (t as any).rawClassification === 'interested';
    if (selectedCategory === 'meeting_requested') return (t as any).rawClassification === 'meeting_requested';
    if (selectedCategory === 'follow_up') return t.classification === 'follow_up' || (t as any).rawClassification === 'question';
    if (selectedCategory === 'not_interested') return t.classification === 'not_interested' || (t as any).rawClassification === 'unsubscribe';
    return true;
  });

  const activeThread =
    threads.find((t) => t.id === selectedThreadId) || filteredThreads[0] || threads[0];

  const handleGenerateAiReply = async () => {
    if (!activeThread) return;
    setIsGeneratingReply(true);
    try {
      const response = await fetch('/api/ai/reply-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: activeThread.messages, prospectName: activeThread.prospectName, bookingLink: workspace?.booking_link || '' }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Reply analysis failed.');
      setAiReply({ text: data.analysis.reply, rationale: `${data.analysis.classification} · ${data.analysis.confidence}% confidence` });
      showToast('Reply analyzed', 'AI prepared a response for your review.');
    } catch (error) {
      showToast('AI reply unavailable', error instanceof Error ? error.message : 'Could not analyze this reply.', 'error');
    } finally {
      setIsGeneratingReply(false);
    }
  };

  const handleUseAiReply = () => {
    if (activeThread?.suggestedReply?.text) {
      setReplyText(activeThread.suggestedReply.text);
      showToast('AI Draft Inserted', 'Reply placed into composer for your final review.');
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !activeThread) return;
    setIsSending(true);
    try {
      await sendReply(activeThread.id, replyText);
      showToast('Response Dispatched', `Sent email to ${activeThread.prospectName} (${activeThread.email}).`);
      setReplyText('');
    } catch {
      showToast('Error Sending', 'Could not send the reply. Please try again.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleSetClassification = async (newClass: string, label: string) => {
    if (!activeThread) return;
    setIsUpdatingClassification(true);
    try {
      await updateThreadClassification(activeThread.id, newClass);
      showToast('Classification Updated', `Thread marked as "${label}".`);
    } catch {
      showToast('Error', 'Could not update classification', 'error');
    } finally {
      setIsUpdatingClassification(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* View Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">Inbox & Reply Hub</h1>
          <p className="text-[14px] text-[#686868] mt-0.5">
            Unified inbox with automatic reply classification and human-supervised AI drafts.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-black/[0.07] p-16 text-center flex items-center justify-center space-x-2 text-stone-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-[14px]">Loading conversation threads...</span>
        </div>
      ) : threads.length === 0 ? (
        <div className="p-16 bg-white rounded-2xl border border-black/[0.07] border-dashed flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-[#111111]">No replies received yet</h3>
            <p className="text-[13px] text-[#686868] mt-1 max-w-md">
              When prospects respond to your active outreach campaigns, their replies and intent classifications will be synchronized here automatically.
            </p>
          </div>
        </div>
      ) : (
        /* 3-Panel Desktop Container */
        <div className="bg-white rounded-2xl border border-black/[0.07] shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden h-[calc(100vh-210px)] min-h-[580px] flex flex-col md:flex-row">
          {/* PANEL 1: LEFT CATEGORIES */}
          <div className="hidden md:flex w-56 shrink-0 border-r border-black/[0.06] bg-[#F7F7F5]/40 flex-col p-3 space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#949494] px-2.5 py-1.5 block">
              Mail Categories
            </span>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-[13px] font-medium flex items-center justify-between transition-colors ${
                    isSelected ? 'bg-white text-[#111111] shadow-[0_1px_2px_rgba(0,0,0,0.04)]' : 'text-[#686868] hover:bg-stone-100/70'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {cat.id === 'all' && <Mail className="w-3.5 h-3.5 text-[#686868]" />}
                    {cat.id === 'interested' && <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />}
                    {cat.id === 'meeting_requested' && <Calendar className="w-3.5 h-3.5 text-blue-600" />}
                    {cat.id === 'unread' && <AlertCircle className="w-3.5 h-3.5 text-[#3157FF]" />}
                    {cat.id === 'follow_up' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                    {cat.id === 'not_interested' && <ThumbsDown className="w-3.5 h-3.5 text-[#949494]" />}
                    <span className="truncate">{cat.label}</span>
                  </div>
                  <span
                    className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                      cat.id === 'interested' && cat.count > 0
                        ? 'bg-emerald-100/70 text-emerald-800'
                        : 'text-[#949494]'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* PANEL 2: MIDDLE THREAD LIST */}
          <div
            className={`w-full md:w-80 shrink-0 border-r border-black/[0.06] flex flex-col bg-white overflow-hidden ${
              mobileScreen === 'thread' ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Mobile Category Bar */}
            <div className="md:hidden p-2 border-b border-black/[0.06] overflow-x-auto flex gap-1 bg-[#F7F7F5]">
              {categories.slice(0, 5).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-lg text-[12px] font-medium whitespace-nowrap ${
                    selectedCategory === cat.id ? 'bg-white text-[#111111] shadow-xs' : 'text-[#686868]'
                  }`}
                >
                  {cat.label} ({cat.count})
                </button>
              ))}
            </div>

            <div className="p-3 border-b border-black/[0.06] flex items-center justify-between text-[12px] text-[#686868] bg-[#F7F7F5]/30 shrink-0">
              <span>{filteredThreads.length} conversations</span>
              <span className="text-[11px] text-[#949494]">Classified by intent</span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-black/[0.05]">
              {filteredThreads.length === 0 ? (
                <div className="p-8 text-center text-[#686868] text-[13px]">
                  <p className="font-medium text-[#111111]">No messages found</p>
                  <p className="text-[12px] text-[#949494] mt-1">No threads matching this classification view.</p>
                </div>
              ) : (
                filteredThreads.map((thread) => {
                  const isSelected = thread.id === activeThread?.id;
                  return (
                    <div
                      key={thread.id}
                      onClick={() => {
                        setSelectedThreadId(thread.id);
                        setMobileScreen('thread');
                        thread.unread = false;
                      }}
                      className={`p-3.5 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/40 border-l-2 border-[#3157FF]' : 'hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-semibold text-[13px] text-[#111111] truncate">
                            {thread.prospectName}
                          </span>
                          {thread.unread && <span className="w-1.5 h-1.5 rounded-full bg-[#3157FF] shrink-0" />}
                        </div>
                        <span className="text-[11px] text-[#949494] shrink-0 font-mono">{thread.timestamp}</span>
                      </div>

                      <div className="text-[12px] text-[#686868] truncate font-medium">{thread.companyName}</div>

                      <p className="text-[12px] text-[#686868] line-clamp-2 mt-1 leading-snug">
                        {thread.lastMessageSnippet || 'No preview available.'}
                      </p>

                      <div className="mt-2 flex items-center gap-1.5">
                        {thread.classification === 'interested' && (
                          <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Interested
                          </span>
                        )}
                        {thread.classification === 'follow_up' && (
                          <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                            Follow Up
                          </span>
                        )}
                        {thread.classification === 'not_interested' && (
                          <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200">
                            Not Interested
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* PANEL 3: RIGHT CONVERSATION THREAD */}
          <div
            className={`flex-1 flex flex-col bg-white overflow-hidden ${
              mobileScreen === 'list' ? 'hidden md:flex' : 'flex'
            }`}
          >
            {activeThread ? (
              <>
                {/* Thread Header */}
                <div className="p-4 border-b border-black/[0.06] flex items-center justify-between bg-white shrink-0">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setMobileScreen('list')}
                      className="md:hidden p-1 text-[#686868] hover:text-[#111111]"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-[15px] font-semibold text-[#111111]">{activeThread.prospectName}</h2>
                        <span className="text-[12px] text-[#949494]">•</span>
                        <span className="text-[13px] text-[#686868] font-medium">{activeThread.companyName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-[#949494] mt-0.5">
                        <span>{activeThread.prospectRole}</span>
                        <span>•</span>
                        <span className="font-mono">{activeThread.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Intent Tagger Quick Actions */}
                    <div className="hidden sm:flex items-center gap-1">
                      <button
                        onClick={() => handleSetClassification('interested', 'Interested')}
                        disabled={isUpdatingClassification}
                        className="px-2.5 py-1 text-[11px] font-medium rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors"
                        title="Mark as interested"
                      >
                        Interested
                      </button>
                      <button
                        onClick={() => handleSetClassification('meeting_requested', 'Meeting Booked')}
                        disabled={isUpdatingClassification}
                        className="px-2.5 py-1 text-[11px] font-medium rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors"
                        title="Mark as meeting booked"
                      >
                        Meeting
                      </button>
                      <button
                        onClick={() => handleSetClassification('not_interested', 'Not Interested')}
                        disabled={isUpdatingClassification}
                        className="px-2.5 py-1 text-[11px] font-medium rounded-lg border border-black/[0.08] text-stone-600 hover:bg-stone-50 transition-colors"
                        title="Mark as not interested"
                      >
                        Not Interested
                      </button>
                    </div>

                    <button
                      onClick={() => setShowCompanyDetails(!showCompanyDetails)}
                      className="text-[12px] text-[#686868] hover:text-[#111111] px-2.5 py-1.5 rounded-lg border border-black/[0.07] hover:bg-stone-50 transition-colors flex items-center gap-1"
                    >
                      <span>Details</span>
                      {showCompanyDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Company Details Accordion */}
                {showCompanyDetails && (
                  <div className="p-4 bg-stone-50 border-b border-black/[0.06] text-[12px] text-[#686868] grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="font-semibold text-[#111111] block">Company Domain</span>
                      <span className="font-mono text-[#3157FF]">{activeThread.companyDomain || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#111111] block">Classification</span>
                      <span className="capitalize font-medium text-emerald-700">
                        {activeThread.classification.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#111111] block">Contact Email</span>
                      <span className="text-[#111111] font-mono">{activeThread.email || 'N/A'}</span>
                    </div>
                  </div>
                )}

                {/* Messages Scroll Area */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white">
                  {activeThread.messages && activeThread.messages.length > 0 ? (
                    activeThread.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`max-w-xl rounded-2xl p-4 text-[13px] leading-relaxed space-y-1.5 ${
                          msg.sender === 'user'
                            ? 'ml-auto bg-[#F7F7F5] border border-black/[0.06] text-[#111111]'
                            : 'mr-auto bg-white border border-black/[0.08] text-[#111111] shadow-[0_1px_3px_rgba(0,0,0,0.03)]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] text-[#949494] pb-1 border-b border-black/[0.04]">
                          <span className="font-medium text-[#686868]">
                            {msg.sender === 'user' ? `You (${userName})` : activeThread.prospectName}
                          </span>
                          <span className="font-mono">{msg.timestamp}</span>
                        </div>
                        <p className="whitespace-pre-line text-[#111111]">{msg.body}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-[13px] text-stone-500">
                      No message history recorded for this thread yet.
                    </div>
                  )}
                </div>

                {/* AI Assistant Suggested Reply Box & Human Approval Composer */}
                <div className="p-4 border-t border-black/[0.06] bg-[#F7F7F5]/40 space-y-3 shrink-0">
                  {(activeThread.suggestedReply?.text || aiReply?.text) && (
                    <div className="p-3 rounded-xl bg-white border border-black/[0.07] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#111111]">
                          <Sparkles className="w-3.5 h-3.5 text-[#3157FF]" />
                          <span>AI Suggested Response</span>
                        </div>
                        <span className="text-[11px] text-[#949494]">{aiReply?.rationale || 'Review before sending'}</span>
                      </div>

                      <p className="text-[12px] text-[#686868] line-clamp-2 leading-relaxed bg-stone-50 p-2 rounded-lg border border-black/[0.04]">
                        {aiReply?.text || activeThread.suggestedReply?.text}
                      </p>

                      <div className="flex items-center justify-end">
                        <div className="flex items-center gap-2">
                          <button onClick={handleGenerateAiReply} disabled={isGeneratingReply} className="text-[11px] font-medium px-2.5 py-1 rounded-md border border-black/[0.08] hover:bg-stone-50 text-[#686868] transition-colors">
                            {isGeneratingReply ? 'Analyzing…' : 'Generate with AI'}
                          </button>
                          <button onClick={handleUseAiReply} className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-[#111111] transition-colors">
                            Use draft in composer
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Composer */}
                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to ${activeThread.prospectName}...`}
                      className="w-full p-3 rounded-xl border border-black/[0.08] bg-white text-[13px] text-[#111111] focus:outline-none focus:border-[#3157FF] focus:ring-1 focus:ring-[#3157FF] transition-all resize-none"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[#949494]">
                        Sends from: {profile?.email || user?.email || 'Active Mailbox'}
                      </span>
                      <button
                        onClick={handleSendReply}
                        disabled={!replyText.trim() || isSending}
                        className="px-4 py-1.5 rounded-xl text-[13px] font-medium text-white bg-[#3157FF] hover:bg-[#2545D9] transition-colors disabled:opacity-40 flex items-center gap-1.5"
                      >
                        {isSending ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        {isSending ? 'Sending...' : 'Approve & Send'}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[14px] text-[#949494]">
                Select a conversation to inspect thread history.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
