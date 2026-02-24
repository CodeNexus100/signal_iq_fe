
import { useSimulationStore } from '../store/useSimulationStore';
import { IntersectionStatus, Vehicle, EmergencyVehicle } from '../../types';
import { MapNode, MapEdge, MapGraph, Point } from '../types/map';

class SimulationService {
  private pollInterval: NodeJS.Timeout | null = null;
  private emergencyInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  // Configuration
  private POLL_RATE = 100;
  private EMERGENCY_POLL_RATE = 200;

  constructor() {
    // Singleton pattern or just export instance
  }

  public start() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    this.pollState();
    this.pollEmergency();
    this.pollAI();
    this.pollOverview();

    // Initial fetch to build graph if not dynamic
    // In a real app, we might fetch /map/config
    this.generateMapGraph();
  }

  public stop() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    if (this.emergencyInterval) clearInterval(this.emergencyInterval);
    this.isInitialized = false;
  }

  private async pollState() {
    const fetchState = async () => {
      try {
        const response = await fetch('http://localhost:8001/api/grid/state');
        if (!response.ok) return;
        const data = await response.json();

        // Batch updates to store
        useSimulationStore.getState().setIntersections(data.intersections || []);
        useSimulationStore.getState().setVehicles(data.vehicles || []);
        useSimulationStore.getState().incrementTick();

        // If map graph is empty, maybe try to infer it once from intersections?
        if (useSimulationStore.getState().mapGraph.nodes.length === 0 && data.intersections?.length > 0) {
            this.generateMapGraph(data.intersections);
        }

      } catch (error) {
        console.warn("Failed to fetch grid state:", error);
      }
    };

    // Initial call
    fetchState();
    // Loop
    this.pollInterval = setInterval(fetchState, this.POLL_RATE);
  }

  private async pollEmergency() {
    const fetchEmg = async () => {
        try {
            const response = await fetch('http://localhost:8001/api/emergency/state');
            if (!response.ok) return;
            const data = await response.json();

            if (data.emergency && data.emergency.active) {
                const emg: EmergencyVehicle = {
                    id: 'EMG-1',
                    laneId: data.emergency.laneId,
                    position: data.emergency.position,
                    speed: data.emergency.speed,
                    type: 'emergency',
                    active: true
                };
                useSimulationStore.getState().setEmergency(emg);
            } else {
                 // Only clear if currently active to avoid flickering or just set null
                 useSimulationStore.getState().setEmergency(null);
            }
        } catch (e) {
            console.warn("Emergency poll failed", e);
        }
    };

    this.emergencyInterval = setInterval(fetchEmg, this.EMERGENCY_POLL_RATE);
  }

  private async pollAI() {
      // Less frequent polling for AI
      setInterval(async () => {
          try {
            const res = await fetch('http://localhost:8001/api/ai/status');
            if (res.ok) useSimulationStore.getState().setAIStatus(await res.json());
          } catch {}
      }, 1000);
  }

  private async pollOverview() {
      setInterval(async () => {
          try {
              const res = await fetch('http://localhost:8001/api/grid/overview');
              if (res.ok) useSimulationStore.getState().setGridOverview(await res.json());
          } catch {}
      }, 500);
  }

  // --- Map Generation Logic (Phase 2 Prep) ---
  // Since we don't have a map endpoint yet, we infer from the 5x5 convention
  private generateMapGraph(intersections?: IntersectionStatus[]) {
      const nodes: MapNode[] = [];
      const edges: MapEdge[] = [];

      // Standard grid dimensions
      // 5 horizontal roads (H0-H4), 5 vertical roads (V0-V4)
      // Intersection IDs: I-101 to I-125 ? Or I-1xx logic.
      // Based on TrafficMap2D: row = floor(i/5), col = i%5.

      // We need absolute coordinates. Let's assume a 1000x1000 arbitrary space.
      const WIDTH = 1000;
      const HEIGHT = 1000;
      const SPACING = 200;
      const OFFSET = 100;

      for (let row = 0; row < 5; row++) {
          for (let col = 0; col < 5; col++) {
              const id = `I-${101 + (row * 5) + col}`;
              const x = OFFSET + col * SPACING;
              const y = OFFSET + row * SPACING;

              nodes.push({ id, x, y, type: 'intersection' });
          }
      }

      // Create Edges (Roads) between nodes
      // Horizontal Edges
      for (let row = 0; row < 5; row++) {
          for (let col = 0; col < 4; col++) {
              const fromId = `I-${101 + (row * 5) + col}`;
              const toId = `I-${101 + (row * 5) + col + 1}`;

              // Add a slight curve (Bezier control point) to demonstrate curved roads
              // Just offset the midpoint Y slightly
              const fromNode = nodes.find(n => n.id === fromId)!;
              const toNode = nodes.find(n => n.id === toId)!;
              const midX = (fromNode.x + toNode.x) / 2;
              const midY = (fromNode.y + toNode.y) / 2 + (Math.random() > 0.5 ? 20 : -20); // Random curve

              edges.push({
                  id: `H-${row}-${col}`,
                  from: fromId,
                  to: toId,
                  lanes: 2,
                  geometry: [
                      { x: fromNode.x, y: fromNode.y },
                      { x: midX, y: midY }, // Control Point
                      { x: toNode.x, y: toNode.y }
                  ]
              });
          }
      }

      // Vertical Edges
      for (let col = 0; col < 5; col++) {
          for (let row = 0; row < 4; row++) {
               const fromId = `I-${101 + (row * 5) + col}`;
               const toId = `I-${101 + ((row + 1) * 5) + col}`;

               // Add a slight curve
               const fromNode = nodes.find(n => n.id === fromId)!;
               const toNode = nodes.find(n => n.id === toId)!;
               const midX = (fromNode.x + toNode.x) / 2 + (Math.random() > 0.5 ? 20 : -20);
               const midY = (fromNode.y + toNode.y) / 2;

               edges.push({
                   id: `V-${col}-${row}`,
                   from: fromId,
                   to: toId,
                   lanes: 2,
                   geometry: [
                        { x: fromNode.x, y: fromNode.y },
                        { x: midX, y: midY }, // Control Point
                        { x: toNode.x, y: toNode.y }
                    ]
               });
          }
      }

      useSimulationStore.getState().setMapGraph({ nodes, edges });
  }
}

export const simulationService = new SimulationService();
