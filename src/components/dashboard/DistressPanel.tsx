import React from 'react';
import { Radio, Users, CheckCircle2, Navigation, AlertCircle, ShieldAlert } from 'lucide-react';
import { DistressCall, RescueTeam } from '../../types/simulation';
import { GraphData } from '../../types/graph';

interface DistressPanelProps {
  distressCalls: DistressCall[];
  rescueTeams: RescueTeam[];
  graph: GraphData;
  onTriggerRescueMatching: () => void;
  onSelectCall?: (call: DistressCall) => void;
  onResolveCall?: (callId: string) => void;
  onAddDistressCall?: () => void;
  selectedNodeName?: string;
}

export const DistressPanel: React.FC<DistressPanelProps> = ({
  distressCalls,
  rescueTeams,
  graph,
  onTriggerRescueMatching,
  onSelectCall,
  onResolveCall,
  onAddDistressCall,
  selectedNodeName
}) => {
  return (
    <div className="glass-panel p-3.5 flex flex-col gap-2.5 border border-slate-800">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
          Active SOS Distress Calls & Triage
        </h3>
        <div className="flex items-center gap-1.5">
          {onAddDistressCall && (
            <button
              onClick={onAddDistressCall}
              className="btn-secondary text-[0.68rem] py-1 px-2 text-rose-300 border-rose-500/40 hover:bg-rose-950/40"
              title={selectedNodeName ? `Trigger SOS at ${selectedNodeName}` : "Trigger SOS Distress Call"}
            >
              + SOS Call
            </button>
          )}
          <button
            onClick={onTriggerRescueMatching}
            className="btn-primary text-[0.7rem] py-1 px-2.5 bg-gradient-to-r from-orange-600 to-rose-500 border-rose-400/40"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Dispatch Units
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {distressCalls.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500 font-medium">
            No active distress calls reported. All zones stable.
          </div>
        ) : (
          distressCalls.map((call) => {
            const node = graph.nodes[call.nodeId];
            const assignedTeam = rescueTeams.find((t) => t.id === call.assignedTeamId);

            return (
              <div
                key={call.id}
                onClick={() => onSelectCall?.(call)}
                className="p-2.5 rounded-lg bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800/80 cursor-pointer transition-all flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`badge text-[0.6rem] ${
                        call.priority === 'P1'
                          ? 'badge-danger'
                          : call.priority === 'P2'
                          ? 'badge-warning'
                          : 'badge-primary'
                      }`}
                    >
                      {call.priority} {call.priority === 'P1' ? 'CRITICAL' : call.priority === 'P2' ? 'URGENT' : 'STABLE'}
                    </span>
                    <span className="text-xs font-bold text-slate-200">{node?.name || call.nodeId}</span>
                  </div>

                  <span className="text-[0.68rem] font-mono text-rose-400 font-semibold">
                    {call.peopleCount} trapped
                  </span>
                </div>

                <p className="text-[0.7rem] text-slate-400 line-clamp-1">{call.description}</p>

                <div className="flex items-center justify-between text-[0.68rem] font-mono pt-1 border-t border-slate-800/60">
                  <span className="text-slate-400">
                    Status:{' '}
                    <span
                      className={`font-semibold ${
                        call.status === 'rescued'
                          ? 'text-emerald-400'
                          : call.status === 'dispatched'
                          ? 'text-sky-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {call.status.toUpperCase()}
                    </span>
                  </span>

                  <div className="flex items-center gap-2">
                    {assignedTeam ? (
                      <span className="text-sky-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-sky-400" />
                        {assignedTeam.name}
                      </span>
                    ) : (
                      <span className="text-rose-400 animate-pulse">Awaiting Unit</span>
                    )}

                    {onResolveCall && call.status !== 'rescued' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onResolveCall(call.id);
                        }}
                        className="px-1.5 py-0.5 rounded text-[0.62rem] bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900 font-sans"
                        title="Mark distress call as rescued"
                      >
                        ✓ Rescued
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
