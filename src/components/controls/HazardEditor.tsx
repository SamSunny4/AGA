import React from 'react';
import { Flame, Waves, Activity, Mountain, AlertOctagon, Plus, ShieldCheck } from 'lucide-react';
import { DisasterType } from '../../types/graph';

interface HazardEditorProps {
  onAddHazard: (type: DisasterType) => void;
  intensityMultiplier: number;
  onIntensityChange: (val: number) => void;
  onToggleBlockSelectedRoad: () => void;
  isRoadSelected: boolean;
  isRoadBlocked?: boolean;
}

export const HazardEditor: React.FC<HazardEditorProps> = ({
  onAddHazard,
  intensityMultiplier,
  onIntensityChange,
  onToggleBlockSelectedRoad,
  isRoadSelected,
  isRoadBlocked
}) => {
  return (
    <div className="glass-panel p-3.5 flex flex-col gap-3 border border-slate-800">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
          Disaster Injection & Hazard Controls
        </h3>
        <span className="badge badge-warning text-[0.65rem]">Live Hazard Modeler</span>
      </div>

      {/* Quick Hazard Spawn Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => onAddHazard('flood')}
          className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-800/60 text-cyan-300 text-xs font-semibold transition-all hover:scale-[1.02]"
        >
          <Waves className="w-4 h-4 text-cyan-400" />
          + Flood Surge
        </button>

        <button
          onClick={() => onAddHazard('wildfire')}
          className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-orange-950/60 hover:bg-orange-900/80 border border-orange-800/60 text-orange-300 text-xs font-semibold transition-all hover:scale-[1.02]"
        >
          <Flame className="w-4 h-4 text-orange-400" />
          + Wildfire Front
        </button>

        <button
          onClick={() => onAddHazard('earthquake')}
          className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 text-rose-300 text-xs font-semibold transition-all hover:scale-[1.02]"
        >
          <Activity className="w-4 h-4 text-rose-400" />
          + Quake Shock
        </button>

        <button
          onClick={() => onAddHazard('landslide')}
          className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 border border-amber-800/60 text-amber-300 text-xs font-semibold transition-all hover:scale-[1.02]"
        >
          <Mountain className="w-4 h-4 text-amber-400" />
          + Landslide Slip
        </button>
      </div>

      {/* Intensity Multiplier & Road Block Tool */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Disaster Intensity:</span>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.1"
            value={intensityMultiplier}
            onChange={(e) => onIntensityChange(parseFloat(e.target.value))}
            className="w-24 h-1.5 bg-slate-800 rounded-lg accent-rose-500 cursor-pointer"
          />
          <span className="text-xs font-mono font-bold text-rose-400">{intensityMultiplier}x</span>
        </div>

        {isRoadSelected && (
          <button
            onClick={onToggleBlockSelectedRoad}
            className={`text-xs py-1 px-3 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              isRoadBlocked
                ? 'bg-emerald-950/70 border border-emerald-500 text-emerald-300 hover:bg-emerald-900'
                : 'bg-rose-950/70 border border-rose-500 text-rose-300 hover:bg-rose-900'
            }`}
          >
            {isRoadBlocked ? <ShieldCheck className="w-3.5 h-3.5" /> : <AlertOctagon className="w-3.5 h-3.5" />}
            {isRoadBlocked ? 'Unblock Selected Road' : 'Block Selected Road (Debris)'}
          </button>
        )}
      </div>
    </div>
  );
};
