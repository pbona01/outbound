import { useState } from 'react';
import {
  GitFork,
  Clock,
  Plus,
  Play,
  Pause,
  Loader2,
} from 'lucide-react';
import { useToast } from '../../lib/state/ToastContext';
import { useAppState } from '../../lib/state/AppStateContext';

export function SequencesView() {
  const { showToast } = useToast();
  const { sequences, updateSequenceStep, isLoading, error } = useAppState();

  const [activeStepId, setActiveStepId] = useState<string>('');

  const activeSequence = sequences[0] ?? null;
  const steps = activeSequence?.steps ?? [];

  const selectedStep =
    steps.find((s) => s.id === activeStepId) ??
    steps[0] ??
    null;

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

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-[#686868]">
          <Loader2 className="w-4 h-4 animate-spin text-[#3157FF]" />
          Loading sequence cadences...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 space-y-3">
        <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
          <GitFork className="w-5 h-5" />
        </div>
        <h3 className="text-base font-semibold text-[#111]">Failed to load sequences</h3>
        <p className="text-xs text-[#666] max-w-sm">{error.message || 'An error occurred while fetching cadences.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">Sequence Architect</h1>
          <p className="text-[14px] text-[#686868] mt-0.5">
            Design multi-stage follow-up cadences with automated condition branching and AI personalization tokens.
          </p>
        </div>

        <button
          onClick={() => showToast('New Step Added', 'Appended new step to the sequence.')}
          className="px-4 py-2 rounded-xl text-[13px] font-medium text-white bg-[#3157FF] hover:bg-[#2545D9] transition-colors flex items-center gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.06)] shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Sequence Step
        </button>
      </div>

      {/* Check if no sequences exist */}
      {!activeSequence || sequences.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-black/[0.07] flex flex-col items-center justify-center text-center space-y-3 min-h-[360px]">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center">
            <GitFork className="w-6 h-6 text-[#949494]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#111111]">No sequences configured yet</h3>
            <p className="text-xs text-[#686868] mt-1.5 max-w-md leading-relaxed">
              Create a campaign to generate your first automated multi-stage sequence cadence with AI-personalized touchpoints.
            </p>
          </div>
        </div>
      ) : (
        /* 2-Column Builder */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Timeline Steps */}
          <div className="lg:col-span-2 space-y-3">
            {steps.length === 0 ? (
              <div className="p-10 bg-white rounded-2xl border border-black/[0.07] border-dashed flex flex-col items-center justify-center text-center space-y-3 h-full min-h-[300px]">
                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                  <GitFork className="w-5 h-5 text-[#949494]" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-[#111111]">No steps in this sequence</h3>
                  <p className="text-[13px] text-[#686868] mt-1 max-w-sm">
                    Add an email step to start building your follow-up cadence.
                  </p>
                </div>
              </div>
            ) : (
              steps.map((step, idx) => (
                <div key={step.id} className="space-y-3">
                  <div
                    onClick={() => setActiveStepId(step.id)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer bg-white ${
                      selectedStep?.id === step.id
                        ? 'border-[#3157FF] shadow-[0_4px_12px_rgba(49,87,255,0.08)]'
                        : 'border-black/[0.07] hover:border-black/[0.14]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-stone-100 border border-black/[0.05] flex items-center justify-center font-semibold text-xs text-[#111111] tnum">
                          {step.stepNumber ?? idx + 1}
                        </span>
                        <div>
                          <h3 className="text-[15px] font-semibold text-[#111111]">{step.name || `Step ${idx + 1}`}</h3>
                          <p className="text-[12px] font-mono text-[#686868] mt-0.5">
                            Subject: "{step.subject || '(No subject)'}"
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
                          className="p-1 text-[#686868] hover:text-[#111111]"
                        >
                          {step.active ? (
                            <Pause className="w-3.5 h-3.5" />
                          ) : (
                            <Play className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                        </button>
                      </div>
                    </div>

                    {step.bodyPreview && (
                      <p className="text-[13px] text-[#686868] mt-2.5 leading-relaxed">{step.bodyPreview}</p>
                    )}
                  </div>

                  {idx < steps.length - 1 && (
                    <div className="flex items-center justify-center gap-2 py-1">
                      <div className="h-4 w-[1px] bg-black/[0.1]" />
                      <span className="text-[11px] font-medium text-[#949494] bg-white border border-black/[0.06] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Wait {steps[idx + 1]?.delayDays ?? 1} business days
                      </span>
                      <div className="h-4 w-[1px] bg-black/[0.1]" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Right 1 Col: Step Inspector */}
          <div className="p-5 bg-white rounded-2xl border border-black/[0.07] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4 h-fit">
            {!selectedStep ? (
              <div className="text-center py-8 text-xs text-[#888888]">
                Select or add a sequence step to edit its settings.
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
                  <h3 className="text-[15px] font-semibold text-[#111111]">
                    Step {selectedStep.stepNumber ?? 1} Settings
                  </h3>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                    selectedStep.active ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {selectedStep.active ? 'Active' : 'Paused'}
                  </span>
                </div>

                <div className="space-y-3 text-[13px]">
                  <div className="space-y-1">
                    <label className="text-[12px] font-medium text-[#686868]">Step Title</label>
                    <input
                      value={selectedStep.name || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (activeSequence) {
                          updateSequenceStep(activeSequence.id, selectedStep.id, { name: val });
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-black/[0.08] text-[13px] text-[#111111] focus:outline-none focus:border-[#3157FF]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[12px] font-medium text-[#686868]">Subject Line</label>
                    <input
                      value={selectedStep.subject || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (activeSequence) {
                          updateSequenceStep(activeSequence.id, selectedStep.id, { subject: val });
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-black/[0.08] text-[13px] text-[#111111] focus:outline-none focus:border-[#3157FF]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[12px] font-medium text-[#686868]">Delay Before Sending</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={selectedStep.delayDays ?? 0}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (activeSequence) {
                            updateSequenceStep(activeSequence.id, selectedStep.id, { delayDays: val });
                          }
                        }}
                        className="w-20 px-3 py-2 rounded-xl border border-black/[0.08] text-[13px] text-[#111111] focus:outline-none focus:border-[#3157FF]"
                      />
                      <span className="text-[12px] text-[#686868]">business days after previous step</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[12px] font-medium text-[#686868]">Personalization Variables</label>
                    <div className="flex flex-wrap gap-1 text-[11px] font-mono text-[#3157FF]">
                      <span className="bg-blue-50 px-2 py-0.5 rounded">{"{{contact.first_name}}"}</span>
                      <span className="bg-blue-50 px-2 py-0.5 rounded">{"{{company.name}}"}</span>
                      <span className="bg-blue-50 px-2 py-0.5 rounded">{"{{primary_opportunity}}"}</span>
                      <span className="bg-blue-50 px-2 py-0.5 rounded">{"{{detected_tech}}"}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-black/[0.06]">
                  <button
                    onClick={() => showToast('Template saved', 'Updated sequence step definition.')}
                    className="w-full py-2 rounded-xl text-[13px] font-medium text-white bg-[#111111] hover:bg-black transition-colors"
                  >
                    Save Step Changes
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
