import { useState } from 'react';
import {
  GitFork,
  Clock,
  Plus,
  Edit3,
  Trash2,
  Play,
  Pause,
  Mail,
  ArrowDown,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from '../../lib/state/ToastContext';
import { useAppState } from '../../lib/state/AppStateContext';

export function SequencesView() {
  const { showToast } = useToast();
  const { sequences, updateSequenceStep } = useAppState();
  
  const activeSequence = sequences[0];
  const steps = activeSequence?.steps || [];

  const handleToggleStep = async (stepId: string, currentStatus: boolean) => {
    if (!activeSequence) return;
    try {
      await updateSequenceStep(activeSequence.id, stepId, { active: !currentStatus });
      showToast(
        currentStatus ? 'Step Paused' : 'Step Activated',
        currentStatus ? 'Prospects will skip this step.' : 'Step is now active in the sequence.'
      );
    } catch (e) {
      showToast('Error', 'Could not update sequence step', 'error');
    }
  };

  const [activeStepId, setActiveStepId] = useState<string>("step-1");

  const selectedStep = steps.find((s) => s.id === activeStepId) || steps[0];

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
          onClick={() => showToast('New Step Added', 'Appended Step 5 to the sequence.')}
          className="px-4 py-2 rounded-xl text-[13px] font-medium text-white bg-[#3157FF] hover:bg-[#2545D9] transition-colors flex items-center gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.06)] shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Sequence Step
        </button>
      </div>

      {/* 2-Column Builder */}
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
                    activeStepId === step.id
                      ? 'border-[#3157FF] shadow-[0_4px_12px_rgba(49,87,255,0.08)]'
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
                      <p className="text-[12px] font-mono text-[#686868] mt-0.5">
                        Subject: "{step.subject}"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 tnum">
                      {step.replyRate} replies
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

                <p className="text-[13px] text-[#686868] mt-2.5 leading-relaxed">{step.description}</p>
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
          )))}
        </div>

        {/* Right 1 Col: Step Inspector / Prompt Guidance */}
        <div className="p-5 bg-white rounded-2xl border border-black/[0.07] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4 h-fit">
          <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
            <h3 className="text-[15px] font-semibold text-[#111111]">
              Step {selectedStep.stepNumber} Settings
            </h3>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-50 text-[#3157FF]">
              Active
            </span>
          </div>

          <div className="space-y-3 text-[13px]">
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-[#686868]">Step Title</label>
              <input
                value={selectedStep.name}
                onChange={(e) => {
                  const val = e.target.value;
                  if (activeSequence) {
                    updateSequenceStep(activeSequence.id, selectedStep.id, { name: val });
                  }
                }}
                className="w-full px-3 py-2 rounded-xl border border-black/[0.08] text-[13px] text-[#111111]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-medium text-[#686868]">Delay Before Sending</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={selectedStep.delayDays}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (activeSequence) {
                      updateSequenceStep(activeSequence.id, selectedStep.id, { delayDays: val });
                    }
                  }}
                  className="w-20 px-3 py-2 rounded-xl border border-black/[0.08] text-[13px] text-[#111111]"
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
        </div>
      </div>
    </div>
  );
}
