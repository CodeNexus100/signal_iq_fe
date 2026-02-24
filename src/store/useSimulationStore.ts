
import { create } from 'zustand';
import {
  IntersectionStatus,
  Vehicle,
  EmergencyVehicle,
  AIStatus,
  GridOverview
} from '../../types';
import { MapGraph } from '../types/map';

export type ControllerMode = 'FIXED' | 'HEURISTIC' | 'ML' | 'HYBRID';
export type SimulationStatus = 'RUNNING' | 'PAUSED' | 'STOPPED';

export interface SimulationStats {
    tick: number;
    avgWaitTime: number; // seconds
    throughput: number; // vehicles/hour
    emergencyDelay: number; // seconds (reduction or total)
    signalSwitchRate: number; // switches/minute
    congestion: number; // 0-1 density
}

interface SimulationState {
  // --- Domain State ---
  intersections: Record<string, IntersectionStatus>;
  vehicles: Vehicle[];
  emergency: EmergencyVehicle | null;
  mapGraph: MapGraph;
  tick_id: number;

  // --- Control State ---
  controllerMode: ControllerMode;
  simulationStatus: SimulationStatus;
  selectedIntersectionId: string | null;
  seed: number;

  // --- Metrics ---
  metrics: SimulationStats;
  metricsHistory: SimulationStats[]; // For time-series charts

  // --- AI State ---
  aiStatus: AIStatus | null;

  // --- Grid Overview (Legacy/Overview Support) ---
  gridOverview: GridOverview | null;

  // --- Actions ---
  setIntersections: (intersections: IntersectionStatus[]) => void;
  setVehicles: (vehicles: Vehicle[]) => void;
  setEmergency: (emergency: EmergencyVehicle | null) => void;
  setMapGraph: (graph: MapGraph) => void;

  setControllerMode: (mode: ControllerMode) => void;
  setSimulationStatus: (status: SimulationStatus) => void;
  setSelectedIntersectionId: (id: string | null) => void;
  setSeed: (seed: number) => void;

  setMetrics: (metrics: SimulationStats) => void;

  setAIStatus: (status: AIStatus) => void;
  setGridOverview: (overview: GridOverview) => void;

  incrementTick: () => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  intersections: {},
  vehicles: [],
  emergency: null,
  mapGraph: { nodes: [], edges: [] },
  tick_id: 0,

  controllerMode: 'FIXED',
  simulationStatus: 'RUNNING',
  selectedIntersectionId: null,
  seed: 42,

  metrics: {
      tick: 0,
      avgWaitTime: 0,
      throughput: 0,
      emergencyDelay: 0,
      signalSwitchRate: 0,
      congestion: 0
  },
  metricsHistory: [],

  aiStatus: null,
  gridOverview: null,

  setIntersections: (intersections) => set((state) => {
    const record: Record<string, IntersectionStatus> = {};
    intersections.forEach(i => { record[i.id] = i; });
    return { intersections: record };
  }),

  setVehicles: (vehicles) => set({ vehicles }),

  setEmergency: (emergency) => set({ emergency }),

  setMapGraph: (mapGraph) => set({ mapGraph }),

  setControllerMode: (controllerMode) => set({ controllerMode }),

  setSimulationStatus: (simulationStatus) => set({ simulationStatus }),

  setSelectedIntersectionId: (selectedIntersectionId) => set({ selectedIntersectionId }),

  setSeed: (seed) => set({ seed }),

  setMetrics: (metrics) => set((state) => {
      // Keep only last 50 points for history to save memory
      const newHistory = [...state.metricsHistory, metrics];
      if (newHistory.length > 50) newHistory.shift();
      return { metrics, metricsHistory: newHistory };
  }),

  setAIStatus: (aiStatus) => set({ aiStatus }),

  setGridOverview: (gridOverview) => set({ gridOverview }),

  incrementTick: () => set((state) => ({ tick_id: state.tick_id + 1 })),
}));
