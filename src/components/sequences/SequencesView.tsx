import React, { useState } from 'react';
import {
  GitFork,
  Clock,
  Plus,
  Play,
  Pause,
  Mail,
  Sparkles,
  CheckCircle2,
  Layers,
  Loader2,
  X,
  FileText,
} from 'lucide-react';
import { useToast } from '../../lib/state/ToastContext';
import { useAppState } from '../../lib/state/AppStateContext';
import { Sequence } from '../../types';

export function SequencesView() {
  const { showToast } = useToast();
  const { sequences, updateSequenceStep, addSequenceStep, createSequence, isLoading } = useAppState();

  const [selectedSequenceId, setSelectedSequenceId] = useState<string | null>(null);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);

  // Active sequence determination
  const activeSequence: Sequence | undefined =
    sequences.find((s) => s.id === selectedSequenceId) || sequences[0];
  const steps = activeSequence?.steps || [];

  // Currently selected step in the active sequence
  const selectedStep =
    steps.find((s) => s.id === activeStepId) || steps[0];

  // Inspector form state (buffered for editing)
  const [stepTitle, setStepTitle] = useState('');
  const [stepSubject, setStepSubject] = useState('');
  const [stepBody, setStepBody] = useState('');
  const [stepDelay, setStepDelay] = useState(3);
  const [isSavingStep, setIsSavingStep] = useState(false);

  // Sync inspector form when selectedStep changes
  const [syncedStepKey, setSyncedStepKey] = useState<string | null>(null);
  const currentStepKey = selectedStep ? `${activeSequence?.id}-${selectedStep.id}` : null;
  if (selectedStep && syncedStepKey !== currentStepKey) {
    setSyncedStepKey(currentStepKey);
    setStepTitle(selectedStep.name);
    setStepSubject(selectedStep.subject);
    setStepBody(selectedStep.body || '');
    setStepDelay(selectedStep.delayDays ?? 3);
  }

  // Create Sequence Modal State
  const [isCreateSeqOpen, setIsCreateSeqOpen] = useState(false);
  const [newSeqName, setNewSeqName] = useState('');
  const [newSeqTemplate, setNewSeqTemplate] = useState('Value-led');
  const [isCreatingSeq, setIsCreatingSeq] = useState(false);

  const handleToggleStep = async (stepId: string, currentStatus: boolean) => {
    if (!activeSequence) return;
    try {
      await updateSequenceStep(activeSequence.id, stepId, { active: !currentStatus });
      showToast(
        currentStatus ? 'Step Paused' : 'Step Activated',
        currentStatus ? 'Prospects will skip this step.' : 'Step is now active in the sequence.'
      );
    } catch {
      showToast('Error', 'Could not update sequence step', 'error');
    }
  };

  const handleSaveStep = async () => {
    if (!activeSequence || !selectedStep) return;
    setIsSavingStep(true);
    try {
      await updateSequenceStep(activeSequence.id, selectedStep.id, {
        name: stepTitle.trim() || selectedStep.name,
        subject: stepSubject.trim() || selectedStep.subject,
        body: stepBody,
        delayDays: Number(stepDelay),
      });
      showToast('Step updated', `Saved changes for "${stepTitle || selectedStep.name}".`);
    } catch {
      showToast('Error', 'Failed to save sequence step', 'error');
    } finally {
      setIsSavingStep(false);
    }
  };

  const handleAddStep = async () => {
    if (!activeSequence) return;
    try {
      const nextNum = steps.length + 1;
      const updated = await addSequenceStep(activeSequence.id, {
        name: `Step ${nextNum} • Follow-up`,
        subject: `Re: {{company.name}} / Quick follow-up`,
        body: `Hi {{contact.first_name}},\n\nWanted to quickly follow up on my previous note.\n\nBest,\n[Your Name]`,
        delayDays: 3,
      });
      const newStep = updated.steps[updated.steps.length - 1];
      if (newStep) {
        setActiveStepId(newStep.id);
      }
      showToast('Step added', `Appended Step ${nextNum} to ${activeSequence.name}.`);
    } catch {
      showToast('Error', 'Failed to append step to sequence', 'error');
    }
  };

  const handleCreateNewSequence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSeqName.trim()) return;
    setIsCreatingSeq(true);
    try {
      const seq = await createSequence(newSeqName.trim(), newSeqTemplate);
      setSelectedSequenceId(seq.id);
      if (seq.steps && seq.steps.length > 0) {
        setActiveStepId(seq.steps[0].id);
      }
      setIsCreateSeqOpen(false);
      setNewSeqName('');
      showToast('Sequence created', `"${seq.name}" is now ready.`);
    } catch {
      showToast('Error', 'Failed to create sequence', 'error');
    } finally {
      setIsCreatingSeq(false);
    }
  };

  const handleCreateDefaultSequence = async () => {
    setIsCreatingSeq(true);
    try {
      const seq = await createSequence('Standard Value-Led Cadence', 'Value-led');
      setSelectedSequenceId(seq.id);
      if (seq.steps && seq.steps.length > 0) {
        setActiveStepId(seq.steps[0].id);
      }
      showToast('Default cadence created', '3-step value-led email sequence configured.');
    } catch {
      showToast('Error', 'Failed to initialize sequence', 'error');
    } finally {
      setIsCreatingSeq(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">Sequences</h1>
          <p className="text-[14px] text-[#686868] mt-0.5">
            Multi-stage automated outreach cadences with condition delays and variable personalization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateSeqOpen(true)}
            className="px-3.5 py-2 rounded-xl text-[13px] font-medium text-[#111111] bg-white border border-black/[0.08] hover:bg-stone-50 transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            New Sequence
          </button>
          <button
            onClick={handleAddStep}
            disabled={!activeSequence}
            className="px-4 py-2 rounded-xl text-[13px] font-medium text-white bg-[#3157FF] hover:bg-[#2545D9] transition-colors flex items-center gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.06)] shrink-0 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add Sequence Step
          </button>
        </div>
      </div>

      {/* Sequence selector pills if multiple exist */}
      {sequences.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {sequences.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSelectedSequenceId(s.id);
                if (s.steps && s.steps.length > 0) {
                  setActiveStepId(s.steps[0].id);
                }
              }}
              className={`px-3.5 py-1.5 rounded-xl text-[13px] font-medium transition-all shrink-0 ${
                activeSequence?.id === s.id
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-white border border-black/[0.07] text-[#686868] hover:text-[#111111]'
              }`}
            >
              {s.name} ({s.steps?.length || 0} steps)
            </button>
          ))}
        </div>
      )}

      {/* Main Builder Grid */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-black/[0.07] p-12 text-center flex items-center justify-center space-x-2 text-stone-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-[14px]">Loading sequences...</span>
        </div>
      ) : sequences.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-black/[0.07] border-dashed flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
            <GitFork className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-[#111111]">No sequences created yet</h3>
            <p className="text-[13px] text-[#686868] mt-1 max-w-sm">
              Create an automated multi-step email sequence to schedule follow-ups for your campaigns.
            </p>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleCreateDefaultSequence}
              disabled={isCreatingSeq}
              className="px-4 py-2 rounded-xl text-[13px] font-medium text-white bg-[#3157FF] hover:bg-[#2545D9] transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {isCreatingSeq ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Create Default 3-Step Cadence
            </button>
            <button
              onClick={() => setIsCreateSeqOpen(true)}
              className="px-4 py-2 rounded-xl text-[13px] font-medium text-[#111111] bg-white border border-black/[0.08] hover:bg-stone-50"
            >
              Create custom sequence
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Sequence Steps Timeline */}
          <div className="lg:col-span-2 space-y-3">
            {steps.length === 0 ? (
              <div className="p-10 bg-white rounded-2xl border border-black/[0.07] border-dashed flex flex-col items-center justify-center text-center space-y-3">
                <p className="text-[14px] text-[#686868]">No steps in this sequence yet.</p>
                <button
                  onClick={handleAddStep}
                  className="px-4 py-2 rounded-xl text-[13px] font-medium text-white bg-[#3157FF] hover:bg-[#2545D9] flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add First Step
                </button>
              </div>
            ) : (
              steps.map((step, idx) => (
                <div key={step.id} className="space-y-3">
                  <div
                    onClick={() => setActiveStepId(step.id)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer bg-white ${
                      selectedStep?.id === step.id
                        ? 'border-[#3157FF] shadow-[0_4px_12px_rgba(49,87,255,0.08)] ring-1 ring-[#3157FF]'
                        : 'border-black/[0.07] hover:border-black/[0.14]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-stone-100 border border-black/[0.05] flex items-center justify-center font-semibold text-xs text-[#111111] tnum">
                          {step.stepNumber}
                        </span>
                        <div>
                          <h3 className="text-[15px] font-semibold text-[#111111]">{step.name}</h3>
                          <p className="text-[12px] font-mono text-[#686868] mt-0.5 line-clamp-1">
                            Subject: "{step.subject}"
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 tnum">
                          {step.replyRate || '0%'} replies
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStep(step.id, step.active);
                          }}
                          className="p-1 text-[#686868] hover:text-[#111111] rounded hover:bg-stone-100"
                          title={step.active ? 'Pause step' : 'Activate step'}
                        >
                          {step.active ? (
                            <Pause className="w-3.5 h-3.5" />
                          ) : (
                            <Play className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                        </button>
                      </div>
                    </div>

                    {step.body && (
                      <p className="text-[13px] text-[#686868] mt-2.5 leading-relaxed line-clamp-2 bg-[#F7F7F5]/50 p-2.5 rounded-xl border border-black/[0.04]">
                        {step.body}
                      </p>
                    )}
                  </div>

                  {idx < steps.length - 1 && (
                    <div className="flex items-center justify-center gap-2 py-1">
                      <div className="h-4 w-[1px] bg-black/[0.1]" />
                      <span className="text-[11px] font-medium text-[#949494] bg-white border border-black/[0.06] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Wait {steps[idx + 1].delayDays} business days
                      </span>
                      <div className="h-4 w-[1px] bg-black/[0.1]" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Right 1 Col: Step Inspector / Configuration */}
          <div className="p-5 bg-white rounded-2xl border border-black/[0.07] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4 h-fit">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
              <h3 className="text-[15px] font-semibold text-[#111111]">
                {selectedStep ? `Step ${selectedStep.stepNumber} Editor` : 'Step Inspector'}
              </h3>
              {selectedStep && (
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                    selectedStep.active
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {selectedStep.active ? 'Active' : 'Paused'}
                </span>
              )}
            </div>

            {selectedStep ? (
              <div className="space-y-3.5 text-[13px]">
                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-[#686868]">Step Title</label>
                  <input
                    value={stepTitle}
                    onChange={(e) => setStepTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-black/[0.08] text-[13px] text-[#111111] focus:outline-none focus:border-[#3157FF]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-[#686868]">Email Subject Line</label>
                  <input
                    value={stepSubject}
                    onChange={(e) => setStepSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-black/[0.08] text-[13px] text-[#111111] font-mono text-[12px] focus:outline-none focus:border-[#3157FF]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-[#686868]">Email Body Copy</label>
                  <textarea
                    rows={6}
                    value={stepBody}
                    onChange={(e) => setStepBody(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-black/[0.08] text-[13px] text-[#111111] leading-relaxed focus:outline-none focus:border-[#3157FF]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-[#686868]">Delay Before Dispatch</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={stepDelay}
                      onChange={(e) => setStepDelay(Number(e.target.value))}
                      className="w-20 px-3 py-2 rounded-xl border border-black/[0.08] text-[13px] text-[#111111] focus:outline-none focus:border-[#3157FF]"
                    />
                    <span className="text-[12px] text-[#686868]">business days after previous step</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="text-[12px] font-medium text-[#686868]">Supported Personalization Variables</label>
                  <div className="flex flex-wrap gap-1 text-[11px] font-mono text-[#3157FF]">
                    <span className="bg-blue-50 px-2 py-0.5 rounded cursor-pointer" onClick={() => setStepBody((b) => b + ' {{contact.first_name}}')}>
                      {"{{contact.first_name}}"}
                    </span>
                    <span className="bg-blue-50 px-2 py-0.5 rounded cursor-pointer" onClick={() => setStepBody((b) => b + ' {{company.name}}')}>
                      {"{{company.name}}"}
                    </span>
                    <span className="bg-blue-50 px-2 py-0.5 rounded cursor-pointer" onClick={() => setStepBody((b) => b + ' {{primary_opportunity}}')}>
                      {"{{primary_opportunity}}"}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-black/[0.06]">
                  <button
                    onClick={handleSaveStep}
                    disabled={isSavingStep}
                    className="w-full py-2.5 rounded-xl text-[13px] font-medium text-white bg-[#111111] hover:bg-black transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isSavingStep && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save Step Changes
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#686868] leading-relaxed">
                Select a step on the timeline to edit subject, copy, and delay settings.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Create New Sequence Modal */}
      {isCreateSeqOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-black/[0.08] space-y-4">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
              <div>
                <h3 className="text-[17px] font-semibold text-[#111111]">Create Sequence</h3>
                <p className="text-[12px] text-[#686868] mt-0.5">Build a custom multi-step outreach cadence.</p>
              </div>
              <button
                onClick={() => setIsCreateSeqOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-[#949494] hover:text-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewSequence} className="space-y-4 text-[13px]">
              <div className="space-y-1">
                <label className="text-[12px] font-medium text-[#111111]">Sequence Name</label>
                <input
                  required
                  value={newSeqName}
                  onChange={(e) => setNewSeqName(e.target.value)}
                  placeholder="e.g. Executive Video Teaser Cadence"
                  className="w-full px-3 py-2 rounded-xl border border-black/[0.08] focus:outline-none focus:border-[#3157FF]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-medium text-[#111111]">Template Pattern</label>
                <select
                  value={newSeqTemplate}
                  onChange={(e) => setNewSeqTemplate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-black/[0.08] bg-white text-[13px]"
                >
                  <option value="Value-led">Value-led (3-step audit & benchmark)</option>
                  <option value="Executive-short">Executive Brief (2-step high brevity)</option>
                  <option value="Case-study">Proof-first (3-step peer benchmark)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsCreateSeqOpen(false)}
                  className="px-4 py-2 rounded-xl text-[13px] font-medium text-[#686868] hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingSeq || !newSeqName.trim()}
                  className="px-4 py-2 rounded-xl text-[13px] font-medium text-white bg-[#3157FF] hover:bg-[#2545D9] transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isCreatingSeq && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Create Sequence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
