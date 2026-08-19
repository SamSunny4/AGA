import React from 'react';
import { Users, Shield, AlertTriangle, Home, Radio, Zap } from 'lucide-react';

interface MetricsBarProps {
  totalPopulation: number;
  totalEvacuated: number;
  totalAtRisk: number;
  networkResilienceScore: number;
  criticalBridgesCount: number;
  shelterCapacityTotal: number;
  shelterOccupiedTotal: number;
  distressCallsCount: number;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({
  totalPopulation,
  totalEvacuated,
  totalAtRisk,
  networkResilienceScore,
  criticalBridgesCount,
  shelterCapacityTotal,
  shelterOccupiedTotal,
  distressCallsCount
}) => {
  const shelterUsagePct = shelterCapacityTotal > 0 ? Math.round((shelterOccupiedTotal / shelterCapacityTotal) * 100) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 w-full">
      {/* Metric 1: At-Risk Evacuees */}
      <div className="glass-panel p-3 flex flex-col justify-between border-slate-800/80">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[0.68rem] font-bold uppercase tracking-wider">Hazard Danger Zone</span>
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
        </div>
        <div className="mt-1">
          <span className="text-lg font-mono font-extrabold text-rose-400">
            {totalAtRisk.toLocaleString()}
          </span>
          <span className="text-[0.65rem] text-slate-400 block">people in danger perimeter</span>
        </div>
      </div>

      {/* Metric 2: Evacuated to Safety */}
      <div className="glass-panel p-3 flex flex-col justify-between border-slate-800/80">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[0.68rem] font-bold uppercase tracking-wider">Evacuated to Safety</span>
          <Users className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="mt-1">
          <span className="text-lg font-mono font-extrabold text-emerald-400">
            {totalEvacuated.toLocaleString()}
          </span>
          <span className="text-[0.65rem] text-slate-400 block">reached high ground</span>
        </div>
      </div>

      {/* Metric 3: Network Resilience Score */}
      <div className="glass-panel p-3 flex flex-col justify-between border-slate-800/80">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[0.68rem] font-bold uppercase tracking-wider">Resilience Index</span>
          <Shield className="w-3.5 h-3.5 text-sky-400" />
        </div>
        <div className="mt-1">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-mono font-extrabold text-sky-300">
              {networkResilienceScore}%
            </span>
            <span className={`text-[0.65rem] font-semibold ${networkResilienceScore > 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {networkResilienceScore > 70 ? 'Robust' : 'Fragile'}
            </span>
          </div>
          <span className="text-[0.65rem] text-slate-400 block">graph connectivity</span>
        </div>
      </div>

      {/* Metric 4: Critical Cut Bridges */}
      <div className="glass-panel p-3 flex flex-col justify-between border-slate-800/80">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[0.68rem] font-bold uppercase tracking-wider">Cut Bridges (Tarjan)</span>
          <Zap className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="mt-1">
          <span className="text-lg font-mono font-extrabold text-amber-300">
            {criticalBridgesCount}
          </span>
          <span className="text-[0.65rem] text-slate-400 block">single points of failure</span>
        </div>
      </div>

      {/* Metric 5: Shelter Capacity Load */}
      <div className="glass-panel p-3 flex flex-col justify-between border-slate-800/80">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[0.68rem] font-bold uppercase tracking-wider">Shelter Capacity</span>
          <Home className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div className="mt-1">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-mono font-extrabold text-purple-300">
              {shelterUsagePct}%
            </span>
            <span className="text-[0.65rem] text-slate-400 font-mono">
              ({shelterOccupiedTotal.toLocaleString()}/{shelterCapacityTotal.toLocaleString()})
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
            <div
              className={`h-full rounded-full ${shelterUsagePct > 80 ? 'bg-rose-500' : 'bg-purple-500'}`}
              style={{ width: `${Math.min(100, shelterUsagePct)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Metric 6: Emergency SOS Distress Signals */}
      <div className="glass-panel p-3 flex flex-col justify-between border-slate-800/80">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[0.68rem] font-bold uppercase tracking-wider">Active SOS Signals</span>
          <Radio className="w-3.5 h-3.5 text-rose-500 animate-ping" />
        </div>
        <div className="mt-1">
          <span className="text-lg font-mono font-extrabold text-rose-400">
            {distressCallsCount}
          </span>
          <span className="text-[0.65rem] text-slate-400 block">critical triage alerts</span>
        </div>
      </div>
    </div>
  );
};
