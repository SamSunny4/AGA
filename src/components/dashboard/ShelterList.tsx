import React from 'react';
import { Home, PlusCircle, ArrowUpRight } from 'lucide-react';
import { GraphNode } from '../../types/graph';

interface ShelterListProps {
  shelters: GraphNode[];
  onSelectShelter?: (shelterId: string) => void;
}

export const ShelterList: React.FC<ShelterListProps> = ({ shelters, onSelectShelter }) => {
  return (
    <div className="glass-panel p-3.5 flex flex-col gap-2.5 border border-slate-800">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Home className="w-3.5 h-3.5 text-purple-400" />
          Designated Safe Shelters & Capacity
        </h3>
        <span className="badge badge-purple text-[0.65rem]">{shelters.length} Facilities</span>
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {shelters.map((s) => {
          const cap = s.capacity || 10000;
          const occ = s.currentOccupancy || 0;
          const pct = Math.round((occ / cap) * 100);
          const isFull = pct >= 90;

          return (
            <div
              key={s.id}
              onClick={() => onSelectShelter?.(s.id)}
              className="p-2 rounded-lg bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800/80 cursor-pointer transition-all flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-200 truncate">
                  <div className={`w-2 h-2 rounded-full ${s.hazardRisk < 0.1 ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span className="truncate">{s.name}</span>
                </div>
                <span className={`font-mono text-[0.7rem] font-bold ${isFull ? 'text-rose-400' : 'text-purple-300'}`}>
                  {pct}% Full
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isFull ? 'bg-rose-500' : pct > 65 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[0.68rem] text-slate-400 font-mono">
                <span>Elev: {s.elevation}m MSL</span>
                <span>{occ.toLocaleString()} / {cap.toLocaleString()} capacity</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
