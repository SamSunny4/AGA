import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { GraphData, HazardZone, RouteResult, AlgorithmStep } from '../../types/graph';
import { DistressCall, RescueTeam } from '../../types/simulation';
import { Map as MapIcon, Globe, Mountain, Moon, Navigation2, Compass } from 'lucide-react';

interface MapCanvasProps {
  graph: GraphData;
  hazards: HazardZone[];
  activeRoute: RouteResult | null;
  activeRouteIsAiSafe: boolean;
  selectedStep: AlgorithmStep | null;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  distressCalls: DistressCall[];
  rescueTeams: RescueTeam[];
  onSelectNode: (nodeId: string) => void;
  onSelectEdge: (edgeId: string) => void;
  centerLat: number;
  centerLng: number;
  zoom: number;
}

type TileType = 'dark' | 'osm' | 'satellite' | 'topo';

const TILE_PROVIDERS: Record<TileType, { name: string; url: string; subdomains?: string; maxZoom: number; attribution: string }> = {
  dark: {
    name: 'Tactical Dark',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  },
  osm: {
    name: 'OSM Standard',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  },
  satellite: {
    name: 'Esri Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 18,
    attribution: '© Esri & Maxar Earth Imagery'
  },
  topo: {
    name: 'Ghats Topo',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    subdomains: 'abc',
    maxZoom: 17,
    attribution: '© OpenTopoMap (CC-BY-SA)'
  }
};

export const MapCanvas: React.FC<MapCanvasProps> = ({
  graph,
  hazards,
  activeRoute,
  activeRouteIsAiSafe,
  selectedStep,
  selectedNodeId,
  selectedEdgeId,
  distressCalls,
  rescueTeams,
  onSelectNode,
  onSelectEdge,
  centerLat,
  centerLng,
  zoom
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const activeTileLayerRef = useRef<L.TileLayer | null>(null);
  const [activeTileType, setActiveTileType] = useState<TileType>('dark');

  const layersRef = useRef<{
    hazardsLayer: L.LayerGroup;
    edgesLayer: L.LayerGroup;
    nodesLayer: L.LayerGroup;
    routeLayer: L.LayerGroup;
    stepHighlightLayer: L.LayerGroup;
  } | null>(null);

  // Switch Tile Layer Helper
  const switchTileLayer = (tileType: TileType) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (activeTileLayerRef.current) {
      map.removeLayer(activeTileLayerRef.current);
    }

    const provider = TILE_PROVIDERS[tileType];
    const newLayer = L.tileLayer(provider.url, {
      maxZoom: provider.maxZoom,
      subdomains: provider.subdomains || 'abc',
      attribution: provider.attribution
    }).addTo(map);

    activeTileLayerRef.current = newLayer;
    setActiveTileType(tileType);
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: zoom,
      zoomControl: true,
      attributionControl: false
    });

    const initialProvider = TILE_PROVIDERS[activeTileType];
    const tileLayer = L.tileLayer(initialProvider.url, {
      maxZoom: initialProvider.maxZoom,
      subdomains: initialProvider.subdomains || 'abc',
      attribution: initialProvider.attribution
    }).addTo(map);

    activeTileLayerRef.current = tileLayer;

    const hazardsLayer = L.layerGroup().addTo(map);
    const edgesLayer = L.layerGroup().addTo(map);
    const stepHighlightLayer = L.layerGroup().addTo(map);
    const routeLayer = L.layerGroup().addTo(map);
    const nodesLayer = L.layerGroup().addTo(map);

    layersRef.current = {
      hazardsLayer,
      edgesLayer,
      nodesLayer,
      routeLayer,
      stepHighlightLayer
    };

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map view when scenario center changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([centerLat, centerLng], zoom, { animate: true });
    }
  }, [centerLat, centerLng, zoom]);

  // Render Map Elements
  useEffect(() => {
    if (!layersRef.current || !mapInstanceRef.current) return;
    const { hazardsLayer, edgesLayer, nodesLayer, routeLayer, stepHighlightLayer } = layersRef.current;

    hazardsLayer.clearLayers();
    edgesLayer.clearLayers();
    nodesLayer.clearLayers();
    routeLayer.clearLayers();
    stepHighlightLayer.clearLayers();

    // 1. Render Hazard Zones
    for (const hazard of hazards) {
      let fillColor = '#06b6d4'; // flood cyan
      let strokeColor = '#22d3ee';
      if (hazard.type === 'wildfire') {
        fillColor = '#f97316';
        strokeColor = '#ea580c';
      } else if (hazard.type === 'earthquake') {
        fillColor = '#f43f5e';
        strokeColor = '#e11d48';
      } else if (hazard.type === 'landslide') {
        fillColor = '#eab308';
        strokeColor = '#ca8a04';
      } else if (hazard.type === 'cyclone') {
        fillColor = '#3b82f6';
        strokeColor = '#60a5fa';
      }

      const circle = L.circle([hazard.centerLat, hazard.centerLng], {
        radius: hazard.radiusKm * 1000,
        color: strokeColor,
        weight: 2.5,
        opacity: 0.85,
        fillColor: fillColor,
        fillOpacity: Math.min(0.48, hazard.intensity * 0.48)
      });

      circle.bindTooltip(`
        <div style="font-family: Inter, sans-serif; padding: 4px;">
          <div style="font-weight: 800; color: ${strokeColor}; text-transform: uppercase;">${hazard.type} Hazard Zone</div>
          <div style="font-size: 11px; color: #cbd5e1;">Radius: ${hazard.radiusKm.toFixed(1)} km | Intensity: ${(hazard.intensity * 100).toFixed(0)}%</div>
          <div style="font-size: 10px; color: #94a3b8;">Propagation: +${hazard.expansionRateKmH} km/h (Heading ${hazard.directionDeg || 0}°)</div>
        </div>
      `, { sticky: true, className: 'leaflet-custom-tooltip' });

      circle.addTo(hazardsLayer);
    }

    // 2. Render Road Edges
    const activeRouteEdgeSet = new Set(activeRoute?.pathEdgeIds || []);
    const stepEdgeSet = new Set(selectedStep?.highlightedEdgeIds || []);

    for (const edge of Object.values(graph.edges)) {
      const src = graph.nodes[edge.source];
      const tgt = graph.nodes[edge.target];
      if (!src || !tgt) continue;

      const isSelected = selectedEdgeId === edge.id;
      const inActiveRoute = activeRouteEdgeSet.has(edge.id);
      const inStepHighlight = stepEdgeSet.has(edge.id);

      // Determine road line color
      let color = '#38bdf8'; // safe sky blue
      let dashArray: string | undefined = undefined;
      let weight = isSelected ? 6 : inActiveRoute ? 6.5 : 3.5;
      let opacity = 0.85;

      if (edge.isBlocked) {
        color = '#ef4444';
        dashArray = '6, 6';
        opacity = 0.95;
      } else if (edge.isMstEdge) {
        color = '#c084fc'; // purple for MST
        weight = 4.5;
      } else if (edge.isMinCut) {
        color = '#f59e0b'; // amber min-cut
        dashArray = '4, 4';
        weight = 5;
      } else if (edge.isBridge) {
        color = '#fb7185'; // rose bridge
        weight = 4.5;
      } else if (edge.hazardRisk > 0.7) {
        color = '#f43f5e';
      } else if (edge.hazardRisk > 0.35) {
        color = '#fbbf24';
      } else {
        color = '#10b981';
      }

      if (inActiveRoute) {
        color = activeRouteIsAiSafe ? '#10b981' : '#f43f5e';
        weight = 7;
        opacity = 1;
      } else if (inStepHighlight) {
        color = '#38bdf8';
        weight = 6;
        opacity = 1;
      }

      const polyline = L.polyline(
        [
          [src.lat, src.lng],
          [tgt.lat, tgt.lng]
        ],
        {
          color,
          weight,
          opacity,
          dashArray
        }
      );

      polyline.on('click', () => onSelectEdge(edge.id));

      polyline.bindTooltip(`
        <div style="font-family: Inter, sans-serif; font-size: 11px;">
          <div style="font-weight: 700; color: #38bdf8;">${src.name} ➔ ${tgt.name}</div>
          <div style="color: #cbd5e1;">Type: ${edge.roadType.toUpperCase()} | Dist: ${edge.distance} km | Speed: ${edge.baseSpeed} km/h</div>
          <div style="color: ${edge.hazardRisk > 0.6 ? '#f43f5e' : '#34d399'}; font-weight: 600;">
            Hazard Risk: ${(edge.hazardRisk * 100).toFixed(0)}% | Capacity: ${edge.capacity} cap/hr
          </div>
          ${edge.isBridge ? '<div style="color: #fb7185; font-weight: 800;">⚠️ Tarjan Critical Bridge Bottleneck</div>' : ''}
          ${edge.isBlocked ? `<div style="color: #f43f5e; font-weight: 800;">⛔ IMPASSABLE: ${edge.blockageReason || 'Blocked'}</div>` : ''}
        </div>
      `, { sticky: true });

      polyline.addTo(edgesLayer);
    }

    // 3. Render Nodes
    const activeRouteNodeSet = new Set(activeRoute?.pathNodeIds || []);
    const stepNodeSet = new Set(selectedStep?.highlightedNodeIds || []);

    for (const node of Object.values(graph.nodes)) {
      const isSelected = selectedNodeId === node.id;
      const inActiveRoute = activeRouteNodeSet.has(node.id);
      const inStep = stepNodeSet.has(node.id);

      // Icon & Marker Styling
      let iconColor = '#38bdf8';
      let iconLabel = '•';
      let size = 24;

      if (node.type === 'shelter') {
        iconColor = '#a855f7'; // purple
        iconLabel = '🏠';
        size = 32;
      } else if (node.type === 'hospital') {
        iconColor = '#ec4899'; // pink
        iconLabel = '🏥';
        size = 30;
      } else if (node.type === 'depot') {
        iconColor = '#0284c7'; // blue
        iconLabel = '🚚';
        size = 28;
      } else if (node.isDistressActive) {
        iconColor = '#f43f5e';
        iconLabel = '🆘';
        size = 34;
      } else if (node.color) {
        iconColor = node.color; // Vertex coloring wave color
        size = 24;
      }

      if (inActiveRoute) {
        iconColor = '#10b981';
        size = 34;
      }

      const customIcon = L.divIcon({
        className: 'custom-node-icon',
        html: `
          <div style="
            width: ${size}px;
            height: ${size}px;
            background: ${iconColor};
            border: 2px solid ${isSelected ? '#ffffff' : 'rgba(255,255,255,0.75)'};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${size > 28 ? 14 : 11}px;
            box-shadow: 0 0 16px ${iconColor}, 0 4px 10px rgba(0,0,0,0.65);
            cursor: pointer;
            transition: all 0.2s ease;
            transform: scale(${isSelected || inStep ? 1.3 : 1});
          ">
            ${iconLabel}
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
      });

      const marker = L.marker([node.lat, node.lng], { icon: customIcon });

      marker.on('click', () => onSelectNode(node.id));

      marker.bindPopup(`
        <div style="font-family: Inter, sans-serif; min-width: 190px;">
          <div style="font-weight: 800; font-size: 13px; color: #38bdf8;">${node.name}</div>
          <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 600;">
            ${node.type} • Elev: ${node.elevation}m
          </div>
          <div style="margin-top: 6px; font-size: 11px; color: #e2e8f0; line-height: 1.5;">
            <div>Population: <b>${node.population.toLocaleString()}</b></div>
            ${node.capacity ? `<div>Capacity: <b>${node.currentOccupancy || 0} / ${node.capacity}</b></div>` : ''}
            <div style="color: ${node.hazardRisk > 0.5 ? '#f43f5e' : '#34d399'}; font-weight: 700;">
              Hazard Risk: ${(node.hazardRisk * 100).toFixed(0)}%
            </div>
            ${node.zoneId ? `<div style="color: ${node.color || '#38bdf8'}; font-weight: 700;">Evacuation: ${node.zoneId}</div>` : ''}
            ${node.isDistressActive ? '<div style="color: #f43f5e; font-weight: 800; margin-top: 4px;">⚠️ Active SOS Distress Call</div>' : ''}
          </div>
        </div>
      `);

      marker.addTo(nodesLayer);
    }
  }, [
    graph,
    hazards,
    activeRoute,
    activeRouteIsAiSafe,
    selectedStep,
    selectedNodeId,
    selectedEdgeId,
    distressCalls,
    rescueTeams
  ]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([centerLat, centerLng], zoom, { animate: true });
    }
  };

  return (
    <div className={`w-full h-full min-h-[480px] rounded-xl overflow-hidden border border-slate-800 relative shadow-2xl tile-${activeTileType === 'dark' ? 'dark-tactical' : activeTileType}`}>
      <div ref={mapContainerRef} className="w-full h-full min-h-[480px]" />

      {/* Top Map Toolbar: Tile Switcher & Recenter */}
      <div className="absolute top-3 right-3 z-[490] flex items-center gap-1.5 glass-panel p-1 border border-slate-700/80 shadow-lg">
        <button
          onClick={() => switchTileLayer('dark')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all ${
            activeTileType === 'dark'
              ? 'bg-sky-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
          }`}
          title="Tactical Dark Map"
        >
          <Moon className="w-3.5 h-3.5" />
          <span>Dark</span>
        </button>

        <button
          onClick={() => switchTileLayer('osm')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all ${
            activeTileType === 'osm'
              ? 'bg-sky-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
          }`}
          title="OpenStreetMap Live Tiles"
        >
          <MapIcon className="w-3.5 h-3.5" />
          <span>Street</span>
        </button>

        <button
          onClick={() => switchTileLayer('satellite')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all ${
            activeTileType === 'satellite'
              ? 'bg-sky-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
          }`}
          title="Esri Satellite Imagery"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Satellite</span>
        </button>

        <button
          onClick={() => switchTileLayer('topo')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all ${
            activeTileType === 'topo'
              ? 'bg-sky-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
          }`}
          title="Western Ghats Topographic Elevation"
        >
          <Mountain className="w-3.5 h-3.5" />
          <span>Topo</span>
        </button>

        <div className="w-[1px] h-4 bg-slate-700 mx-0.5" />

        <button
          onClick={handleRecenter}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-md transition-all"
          title="Recenter Map on Kerala Focus Region"
        >
          <Compass className="w-4 h-4 text-sky-400" />
        </button>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[490] glass-panel px-3 py-2 text-[0.68rem] text-slate-300 flex flex-wrap items-center gap-3 border border-slate-800/90 pointer-events-none">
        <div className="flex items-center gap-1.5 font-bold text-slate-200">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span>Safe Route</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Hazard Area</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
          <span>Camp / Shelter</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-pink-400" />
          <span>Hospital</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <span>SOS Distress</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <Navigation2 className="w-3 h-3 text-sky-400" />
          <span>Kerala GIS</span>
        </div>
      </div>
    </div>
  );
};
