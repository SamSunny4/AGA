import React, { useState, useEffect } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, CheckCircle2, Clock, BarChart3, Info } from 'lucide-react';
import { AlgorithmExecutionResult } from '../../types/graph';

interface StepInspectorProps {
  result: AlgorithmExecutionResult | null;
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  onClose?: () => void;
}

export const StepInspector: React.FC<StepInspectorProps> = ({
  result,
  currentStepIndex,
  onStepChange,
  onClose
}) => {
  const [isPlayingSteps, setIsPlayingSteps] = useState(false);

  useEffect(() => {
    if (!isPlayingSteps || !result || result.steps.length === 0) return;

    const interval = setInterval(() => {
      if (currentStepIndex >= result.steps.length - 1) {
        setIsPlayingSteps(false);
      } else {
        onStepChange(currentStepIndex + 1);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [isPlayingSteps, result, onStepChange]);

  if (!result) return null;

  const currentStep = result.steps[currentStepIndex] || result.steps[result.steps.length - 1];

  return (
    <div className="glass-panel-glow p-4 flex flex-col gap-3.5 border border-sky-500/30">
      {/* Header with Algorithm Name and Execution Time */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="text-sm font-bold text-sky-200">{result.algorithmName}</h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge badge-safe text-[0.65rem] flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {result.executionTimeMs} ms
          </span>
        </div>
      </div>

      {/* Summary Box */}
      <div className="p-2.5 rounded-lg bg-sky-950/40 border border-sky-900/60 text-xs text-sky-200 flex items-start gap-2">
        <Info className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">{result.summary}</p>
      </div>

      {/* Custom Metrics Grid */}
      {result.customMetrics && Object.keys(result.customMetrics).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(result.customMetrics).map(([key, val]) => (
            <div key={key} className="glass-card-sm p-2 text-center">
              <div className="text-[0.65rem] uppercase text-slate-400 font-semibold truncate">{key}</div>
              <div className="text-xs font-mono font-bold text-sky-300 mt-0.5 truncate">{val}</div>
            </div>
          ))}
        </div>
      )}

      {/* Step Visualizer & Scrubber */}
      {result.steps.length > 1 && (
        <div className="space-y-2 pt-1 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-slate-300">
              <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
              <span>Algorithmic Execution Trace</span>
            </div>
            <span className="font-mono text-slate-400">
              Step {currentStepIndex + 1} of {result.steps.length}
            </span>
          </div>

          {/* Current Step Description */}
          {currentStep && (
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300 min-h-[48px] flex items-center font-mono">
              {currentStep.description}
            </div>
          )}

          {/* Scrubber Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onStepChange(Math.max(0, currentStepIndex - 1))}
              disabled={currentStepIndex === 0}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlayingSteps(!isPlayingSteps)}
              className={`p-1.5 rounded-lg text-slate-900 font-bold transition-all ${
                isPlayingSteps ? 'bg-rose-400' : 'bg-sky-400 hover:bg-sky-300'
              }`}
            >
              {isPlayingSteps ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              onClick={() => onStepChange(Math.min(result.steps.length - 1, currentStepIndex + 1))}
              disabled={currentStepIndex >= result.steps.length - 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <input
              type="range"
              min={0}
              max={result.steps.length - 1}
              value={currentStepIndex}
              onChange={(e) => onStepChange(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>
        </div>
      )}
    </div>
  );
};
