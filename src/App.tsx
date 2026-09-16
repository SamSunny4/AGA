import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/navigation/Header';
import { SimulationBar } from './components/controls/SimulationBar';
import { HazardEditor } from './components/controls/HazardEditor';
import { AlgorithmSelector } from './components/algorithms/AlgorithmSelector';
import { StepInspector } from './components/algorithms/StepInspector';
import { MetricsBar } from './components/dashboard/MetricsBar';
import { ShelterList } from './components/dashboard/ShelterList';
import { DistressPanel } from './components/dashboard/DistressPanel';
import { RoutePlannerModal } from './components/navigation/RoutePlannerModal';
import { MapCanvas } from './components/map/MapCanvas';

import { SCENARIO_PRESETS, buildGraphFromScenario, getDefaultDistressCalls, getDefaultRescueTeams } from './data/defaultGraph';
import { GraphData, HazardZone, RouteResult, AlgorithmExecutionResult, DisasterType } from './types/graph';
import { ScenarioPreset, DistressCall, RescueTeam, WeatherCondition } from './types/simulation';

import { computePointHazardRisk, advanceHazards } from './ai/hazardSpread';
import { predictFutureRoadRisks } from './ai/roadRiskPredictor';
import { executeAlgorithmApi } from './api/backendClient';

// Algorithm Suite Imports
import { runBfsReachability, findConnectedComponents } from './algorithms/bfsDfs';
import { runDijkstraSafePath, runAStarSafePath, runBellmanFordSafetyCheck } from './algorithms/shortestPath';
import { runTarjanResilienceAnalysis } from './algorithms/connectivity';
import { runKruskalEmergencyBackbone, runPrimEmergencyBackbone } from './algorithms/mst';
import { runDinicMaxEvacuationFlow } from './algorithms/maxFlow';
import { runRescueTeamMatching, runShelterAllocationMatching } from './algorithms/matching';
import { runVertexColoringSchedule } from './algorithms/vertexColoring';
import { runDominatingSetHubPlacement } from './algorithms/dominatingSet';
import { runTspRescueTour } from './algorithms/tspVrp';

import { AlertTriangle, BellRing, Sparkles } from 'lucide-react';

export function App() {
  // Scenario State
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('kerala_periyar_flood');
  const scenario: ScenarioPreset = useMemo(() => SCENARIO_PRESETS[selectedScenarioId] || SCENARIO_PRESETS.kerala_periyar_flood, [selectedScenarioId]);

  // Graph and Simulation States
  const [graph, setGraph] = useState<GraphData>(() => buildGraphFromScenario(scenario));
  const [hazards, setHazards] = useState<HazardZone[]>(() => [...scenario.initialHazards]);
  const [weather, setWeather] = useState<WeatherCondition>(() => ({ ...scenario.weather }));
  const [distressCalls, setDistressCalls] = useState<DistressCall[]>(() => getDefaultDistressCalls(scenario));
  const [rescueTeams, setRescueTeams] = useState<RescueTeam[]>(() => getDefaultRescueTeams(scenario));

  // Simulation Timeline State
  const [timeHours, setTimeHours] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [intensityMultiplier, setIntensityMultiplier] = useState<number>(1.0);

  // Selection & UI States
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState<boolean>(false);
  const [activeRoute, setActiveRoute] = useState<RouteResult | null>(null);
  const [activeRouteIsAiSafe, setActiveRouteIsAiSafe] = useState<boolean>(true);

  // Algorithm Execution State
  const [selectedAlgorithmId, setSelectedAlgorithmId] = useState<string | null>('dijkstra_safe');
  const [algorithmResult, setAlgorithmResult] = useState<AlgorithmExecutionResult | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // AI Early Warnings
  const [earlyWarnings, setEarlyWarnings] = useState<any[]>([]);

  // Reset or Switch Scenario
  const handleSelectScenario = useCallback((scenarioId: string) => {
    const sc = SCENARIO_PRESETS[scenarioId];
    if (!sc) return;
    setSelectedScenarioId(scenarioId);
    setGraph(buildGraphFromScenario(sc));
    setHazards([...sc.initialHazards]);
    setWeather({ ...sc.weather });
    setDistressCalls(getDefaultDistressCalls(sc));
    setRescueTeams(getDefaultRescueTeams(sc));
    setTimeHours(0);
    setIsPlaying(false);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setActiveRoute(null);
    setSelectedAlgorithmId('dijkstra_safe');
    setAlgorithmResult(null);
    setCurrentStepIndex(0);
  }, []);

  const handleResetSimulation = useCallback(() => {
    handleSelectScenario(selectedScenarioId);
  }, [selectedScenarioId, handleSelectScenario]);

  // Execute Chosen Algorithm (Python FastAPI Backend with Local Engine Fallback)
  const executeAlgorithm = useCallback(async (algoId: string, currentGraph: GraphData) => {
    const nodeIds = Object.keys(currentGraph.nodes);
    const shelters = Object.values(currentGraph.nodes).filter(n => n.type === 'shelter' || n.type === 'hospital');
    const startNode = selectedNodeId || nodeIds[0];
    const targetShelter = shelters[0]?.id || nodeIds[nodeIds.length - 1];

    const response = await executeAlgorithmApi(algoId, currentGraph, {
      startNodeId: startNode,
      targetNodeId: targetShelter,
      useAiSafety: true,
      teams: rescueTeams,
      distressCalls: distressCalls,
      coverageRadiusKm: 3.5,
      numVehicles: 3
    });

    const res = response.execution;

    if (response.route) {
      setActiveRoute(response.route);
      setActiveRouteIsAiSafe(true);
    }

    // Update assigned teams in distress calls if bipartite matching ran
    if (response.matches && response.matches.length > 0) {
      setDistressCalls(prev => prev.map(c => {
        const m = response.matches?.find(match => match.distressId === c.id);
        return m ? { ...c, assignedTeamId: m.teamId, status: 'dispatched' } : c;
      }));
    }

    if (res) {
      setAlgorithmResult(res);
      setCurrentStepIndex(res.steps.length - 1);

      // Apply node/edge attribute updates from algorithm
      if (res.nodeAttributes || res.edgeAttributes) {
        setGraph(prev => {
          const nextNodes = { ...prev.nodes };
          const nextEdges = { ...prev.edges };

          if (res.nodeAttributes) {
            for (const [nId, attrs] of Object.entries(res.nodeAttributes)) {
              if (nextNodes[nId]) nextNodes[nId] = { ...nextNodes[nId], ...attrs };
            }
          }
          if (res.edgeAttributes) {
            for (const [eId, attrs] of Object.entries(res.edgeAttributes)) {
              if (nextEdges[eId]) nextEdges[eId] = { ...nextEdges[eId], ...attrs };
            }
          }
          return { ...prev, nodes: nextNodes, edges: nextEdges };
        });
      }
    }
  }, [selectedNodeId, rescueTeams, distressCalls]);

  const handleSelectAlgorithm = (id: string) => {
    setSelectedAlgorithmId(id);
    executeAlgorithm(id, graph);
  };

  // Distress Call Management Functions
  const handleResolveDistressCall = useCallback((callId: string) => {
    setDistressCalls(prev => prev.map(c => c.id === callId ? { ...c, status: 'rescued' } : c));
    setGraph(prev => {
      const call = distressCalls.find(c => c.id === callId);
      if (!call || !prev.nodes[call.nodeId]) return prev;
      return {
        ...prev,
        nodes: {
          ...prev.nodes,
          [call.nodeId]: {
            ...prev.nodes[call.nodeId],
            isDistressActive: false
          }
        }
      };
    });
  }, [distressCalls]);

  const handleAddDistressCall = useCallback(() => {
    const targetId = selectedNodeId || Object.keys(graph.nodes)[Math.floor(Math.random() * Object.keys(graph.nodes).length)];
    const node = graph.nodes[targetId];
    const newCall: DistressCall = {
      id: `sos_live_${Date.now()}`,
      nodeId: targetId,
      reportedTimeHours: timeHours,
      peopleCount: Math.round((node?.population || 300) * 0.25) || 50,
      priority: 'P1',
      description: `Rapid hazard onset at ${node?.name || targetId}: Emergency evacuation required.`,
      status: 'pending'
    };
    setDistressCalls(prev => [newCall, ...prev]);
    setGraph(prev => ({
      ...prev,
      nodes: {
        ...prev.nodes,
        [targetId]: {
          ...prev.nodes[targetId],
          isDistressActive: true,
          distressPriority: 'P1'
        }
      }
    }));
  }, [selectedNodeId, graph.nodes, timeHours]);

  // Simulation Advance Step Function
  const advanceSimulation = useCallback((dtHours: number) => {
    setTimeHours(prevTime => {
      const nextTime = Math.min(24, prevTime + dtHours);

      // 1. Advance Hazard Spatial Spread
      const nextHazards = advanceHazards(hazards, dtHours, weather);
      setHazards(nextHazards);

      // 2. Update Graph Nodes Hazard Risk
      const nextNodes: Record<string, any> = {};
      for (const [id, node] of Object.entries(graph.nodes)) {
        const risk = computePointHazardRisk(node.lat, node.lng, node.elevation, nextHazards, weather);
        nextNodes[id] = { ...node, hazardRisk: Math.min(1.0, risk * intensityMultiplier) };
      }

      // 3. AI Predictive Risk and Road Blockage Forecast
      const prediction = predictFutureRoadRisks(nextNodes, graph.edges, nextHazards, weather, 1.0);
      setEarlyWarnings(prediction.earlyWarnings);

      // 4. Update Edges
      const nextEdges: Record<string, any> = {};
      for (const [id, edge] of Object.entries(graph.edges)) {
        const src = nextNodes[edge.source];
        const tgt = nextNodes[edge.target];
        const currentRisk = Math.max(src?.hazardRisk || 0, tgt?.hazardRisk || 0);
        const predictedRisk = prediction.predictedRisks[id] || currentRisk;

        const isNewlyBlocked = edge.isBlocked || (currentRisk >= 0.94);
        nextEdges[id] = {
          ...edge,
          hazardRisk: currentRisk,
          predictedRisk: predictedRisk,
          isBlocked: isNewlyBlocked,
          blockageReason: isNewlyBlocked ? edge.blockageReason || 'Submerged / High Hazard Debris' : undefined
        };
      }

      const updatedGraph: GraphData = {
        ...graph,
        nodes: nextNodes,
        edges: nextEdges
      };
      setGraph(updatedGraph);

      // 5. If algorithm is active, update
      if (selectedAlgorithmId) {
        executeAlgorithm(selectedAlgorithmId, updatedGraph);
      }

      return nextTime;
    });
  }, [hazards, weather, graph, intensityMultiplier, selectedAlgorithmId, executeAlgorithm]);

  // Live Timer Tick Loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      // 100ms real tick represents (0.05 * playbackSpeed) simulation hours
      advanceSimulation(0.05 * playbackSpeed);
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, advanceSimulation]);

  // Quick Hazard Injection
  const handleAddHazard = (type: DisasterType) => {
    const newId = `hazard_${Date.now()}`;
    const offsetLat = (Math.random() - 0.5) * 0.04;
    const offsetLng = (Math.random() - 0.5) * 0.04;

    const newZone: HazardZone = {
      id: newId,
      type,
      centerLat: scenario.centerLat + offsetLat,
      centerLng: scenario.centerLng + offsetLng,
      radiusKm: 2.2,
      intensity: 0.9,
      expansionRateKmH: 0.6,
      waterLevelMeters: type === 'flood' ? 3.5 : undefined
    };

    setHazards(prev => [...prev, newZone]);
    advanceSimulation(0.01);
  };

  const handleToggleBlockSelectedRoad = () => {
    if (!selectedEdgeId) return;
    setGraph(prev => {
      const edge = prev.edges[selectedEdgeId];
      if (!edge) return prev;
      const updatedEdge = {
        ...edge,
        isBlocked: !edge.isBlocked,
        blockageReason: !edge.isBlocked ? 'Manual Barrier / Fallen Debris' : undefined
      };
      const updated = {
        ...prev,
        edges: { ...prev.edges, [selectedEdgeId]: updatedEdge }
      };
      if (selectedAlgorithmId) executeAlgorithm(selectedAlgorithmId, updated);
      return updated;
    });
  };

  // Operational Metrics Computation
  const metrics = useMemo(() => {
    const nodes = Object.values(graph.nodes);
    const edges = Object.values(graph.edges);

    const totalPopulation = nodes.reduce((sum, n) => sum + (n.population || 0), 0);
    const totalAtRisk = nodes.filter(n => n.hazardRisk > 0.4).reduce((sum, n) => sum + (n.population || 0), 0);
    const totalEvacuated = nodes.filter(n => n.type === 'shelter' || n.type === 'hospital').reduce((sum, n) => sum + (n.currentOccupancy || 0), 0);

    const shelterNodes = nodes.filter(n => n.type === 'shelter' || n.type === 'hospital');
    const shelterCapacityTotal = shelterNodes.reduce((sum, n) => sum + (n.capacity || 0), 0);
    const shelterOccupiedTotal = shelterNodes.reduce((sum, n) => sum + (n.currentOccupancy || 0), 0);

    const criticalBridgesCount = edges.filter(e => e.isBridge).length;
    const blockedEdgesCount = edges.filter(e => e.isBlocked).length;
    const resilience = Math.max(15, Math.round(100 - (blockedEdgesCount / Math.max(edges.length, 1)) * 60 - (criticalBridgesCount * 4)));

    return {
      totalPopulation,
      totalAtRisk,
      totalEvacuated,
      shelterCapacityTotal,
      shelterOccupiedTotal,
      criticalBridgesCount,
      networkResilienceScore: resilience,
      distressCallsCount: distressCalls.filter(c => c.status !== 'rescued').length
    };
  }, [graph, distressCalls]);

  return (
    <div className="min-h-screen flex flex-col bg-[#050811] text-slate-100 font-sans selection:bg-sky-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        currentScenario={scenario}
        onSelectScenario={handleSelectScenario}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        timeHours={timeHours}
        onReset={handleResetSimulation}
        onOpenRoutePlanner={() => setIsRouteModalOpen(true)}
        activeHazardsCount={hazards.length}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 p-4 flex flex-col gap-4 max-w-[1800px] w-full mx-auto">
        {/* Real-time KPI Metric Gauges */}
        <MetricsBar
          totalPopulation={metrics.totalPopulation}
          totalEvacuated={metrics.totalEvacuated}
          totalAtRisk={metrics.totalAtRisk}
          networkResilienceScore={metrics.networkResilienceScore}
          criticalBridgesCount={metrics.criticalBridgesCount}
          shelterCapacityTotal={metrics.shelterCapacityTotal}
          shelterOccupiedTotal={metrics.shelterOccupiedTotal}
          distressCallsCount={metrics.distressCallsCount}
        />

        {/* AI Early Warnings Notification Ticker */}
        {earlyWarnings.length > 0 && (
          <div className="glass-panel p-2.5 px-4 border-amber-500/30 bg-amber-950/20 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <BellRing className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>AI PREDICTIVE ROAD CLOSURE ALERT:</span>
            </div>
            <div className="flex-1 text-slate-300 truncate font-mono">
              {earlyWarnings[0].roadName} forecast to be cut off in ~{earlyWarnings[0].warningTimeMin}m ({earlyWarnings[0].hazardType} surge). {earlyWarnings[0].recommendation}
            </div>
            <span className="badge badge-warning text-[0.65rem]">{earlyWarnings.length} Warnings Active</span>
          </div>
        )}

        {/* Middle Core Grid: Interactive Map + Side Operations Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          {/* Left Column: Interactive Map & Step Inspector (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Interactive Leaflet Map */}
            <div className="w-full h-[540px] rounded-xl overflow-hidden">
              <MapCanvas
                graph={graph}
                hazards={hazards}
                activeRoute={activeRoute}
                activeRouteIsAiSafe={activeRouteIsAiSafe}
                selectedStep={algorithmResult?.steps[currentStepIndex] || null}
                selectedNodeId={selectedNodeId}
                selectedEdgeId={selectedEdgeId}
                distressCalls={distressCalls}
                rescueTeams={rescueTeams}
                onSelectNode={(nodeId) => setSelectedNodeId(nodeId)}
                onSelectEdge={(edgeId) => setSelectedEdgeId(edgeId)}
                centerLat={scenario.centerLat}
                centerLng={scenario.centerLng}
                zoom={scenario.zoom}
              />
            </div>

            {/* Timeline & Weather Simulation Bar */}
            <SimulationBar
              timeHours={timeHours}
              isPlaying={isPlaying}
              playbackSpeed={playbackSpeed}
              weather={weather}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onTimeChange={(t) => setTimeHours(t)}
              onSpeedChange={(s) => setPlaybackSpeed(s)}
              onStep={(delta) => advanceSimulation(delta)}
            />

            {/* Step-by-Step Algorithmic Trace Inspector */}
            {algorithmResult && (
              <StepInspector
                result={algorithmResult}
                currentStepIndex={currentStepIndex}
                onStepChange={(idx) => setCurrentStepIndex(idx)}
              />
            )}
          </div>

          {/* Right Column: Operations & Algorithm Controls (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Hazard Spawner & Road Barrier Toolbox */}
            <HazardEditor
              onAddHazard={handleAddHazard}
              intensityMultiplier={intensityMultiplier}
              onIntensityChange={setIntensityMultiplier}
              onToggleBlockSelectedRoad={handleToggleBlockSelectedRoad}
              isRoadSelected={!!selectedEdgeId}
              isRoadBlocked={selectedEdgeId ? graph.edges[selectedEdgeId]?.isBlocked : false}
            />

            {/* Advanced Graph Algorithms Suite Grid */}
            <AlgorithmSelector
              selectedAlgorithmId={selectedAlgorithmId}
              onSelectAlgorithm={handleSelectAlgorithm}
            />

            {/* Designated Shelters Capacity Monitor */}
            <ShelterList
              shelters={Object.values(graph.nodes).filter(n => n.type === 'shelter' || n.type === 'hospital')}
              onSelectShelter={(sId) => setSelectedNodeId(sId)}
            />

            {/* SOS Emergency Distress Signals */}
            <DistressPanel
              distressCalls={distressCalls}
              rescueTeams={rescueTeams}
              graph={graph}
              onTriggerRescueMatching={() => handleSelectAlgorithm('bipartite_matching')}
              onSelectCall={(call) => setSelectedNodeId(call.nodeId)}
              onResolveCall={handleResolveDistressCall}
              onAddDistressCall={handleAddDistressCall}
              selectedNodeName={selectedNodeId ? graph.nodes[selectedNodeId]?.name : undefined}
            />
          </div>
        </div>
      </main>

      {/* Dynamic Route Planner Modal */}
      <RoutePlannerModal
        isOpen={isRouteModalOpen}
        onClose={() => setIsRouteModalOpen(false)}
        graph={graph}
        onApplyRoute={(route, isAiSafe) => {
          setActiveRoute(route);
          setActiveRouteIsAiSafe(isAiSafe);
        }}
        defaultOriginId={selectedNodeId || undefined}
      />
    </div>
  );
}

export default App;
