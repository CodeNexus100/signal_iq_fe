
import { create } from 'zustand';
import {
  IntersectionStatus,
  Vehicle,
  EmergencyVehicle,
  AIStatus,
  GridOverview
} from '../../types';

export type ControllerMode = 'FIXED' | 'HEURISTIC' | 'ML' | 'HYBRID';

export interface MapNode {
  id: string;
  x: number;
  y: number;
  type: 'intersection' | 'endpoint';
}

export interface MapEdge {
  id: string;
  from: string;
  to: string;
  lanes: number;
  geometry?: { x: number; y: number }[]; // Array of points for rendering curves
}

export interface MapGraph {
  nodes: MapNode[];
  edges: MapEdge[];
}

interface SimulationState {
  // --- Domain State ---
  intersections: Record<string, IntersectionStatus>;
  vehicles: Vehicle[]; // Kept as array for easier iteration in rendering, could be map
  emergency: EmergencyVehicle | null;
  mapGraph: MapGraph;
  tick_id: number;

  // --- Control State ---
  controllerMode: ControllerMode;
  isSimulationRunning: boolean;
  selectedIntersectionId: string | null;

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
  setIsSimulationRunning: (running: boolean) => void;
  setSelectedIntersectionId: (id: string | null) => void;
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
  isSimulationRunning: true,
  selectedIntersectionId: null,

  aiStatus: null,
  gridOverview: null,

  setIntersections: (intersections) => set((state) => {
    // Convert array to record for faster lookup if needed, or keep array
    // Here we store as Record for O(1) access by ID
    const record: Record<string, IntersectionStatus> = {};
    intersections.forEach(i => { record[i.id] = i; });
    return { intersections: record };
  }),

  setVehicles: (vehicles) => set({ vehicles }),

  setEmergency: (emergency) => set({ emergency }),

  setMapGraph: (mapGraph) => set({ mapGraph }),

  setControllerMode: (controllerMode) => set({ controllerMode }),

  setIsSimulationRunning: (isSimulationRunning) => set({ isSimulationRunning }),

  setSelectedIntersectionId: (selectedIntersectionId) => set({ selectedIntersectionId }),

  setAIStatus: (aiStatus) => set({ aiStatus }),

  setGridOverview: (gridOverview) => set({ gridOverview }),

  incrementTick: () => set((state) => ({ tick_id: state.tick_id + 1 })),
}));
