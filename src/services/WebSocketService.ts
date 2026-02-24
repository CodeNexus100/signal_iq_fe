
import { useSimulationStore } from '../store/useSimulationStore';
import { IntersectionStatus, Vehicle, EmergencyVehicle } from '../../types';
import { MapNode, MapEdge, MapGraph, Point } from '../types/map';

// We reuse the generation logic from SimulationService for now
// until we receive the map from the backend via WebSocket.
const generateMapGraph = (intersections?: IntersectionStatus[]) => {
      const nodes: MapNode[] = [];
      const edges: MapEdge[] = [];
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

      // Horizontal Edges
      for (let row = 0; row < 5; row++) {
          for (let col = 0; col < 4; col++) {
              const fromId = `I-${101 + (row * 5) + col}`;
              const toId = `I-${101 + (row * 5) + col + 1}`;
              const fromNode = nodes.find(n => n.id === fromId)!;
              const toNode = nodes.find(n => n.id === toId)!;
              const midX = (fromNode.x + toNode.x) / 2;
              const midY = (fromNode.y + toNode.y) / 2 + (Math.random() > 0.5 ? 20 : -20);

              edges.push({
                  id: `H-${row}-${col}`,
                  from: fromId,
                  to: toId,
                  lanes: 2,
                  geometry: [
                      { x: fromNode.x, y: fromNode.y },
                      { x: midX, y: midY },
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
                        { x: midX, y: midY },
                        { x: toNode.x, y: toNode.y }
                    ]
               });
          }
      }
      return { nodes, edges };
};

class WebSocketService {
    private socket: WebSocket | null = null;
    private isConnected = false;
    private reconnectInterval: NodeJS.Timeout | null = null;
    private pollFallbackInterval: NodeJS.Timeout | null = null;
    private URL = 'ws://localhost:8001/ws'; // Adjust port if needed

    public connect() {
        if (this.isConnected) return;

        console.log("Connecting to Simulation WebSocket...");

        // --- Fallback Mock for Demo if WS fails ---
        // Since we don't have a real WS server running in this environment,
        // we'll default to polling immediately or mock the connection.
        // But the plan says "Replace polling with WebSocket".
        // Let's TRY to connect, and if it fails (onerror), fallback to poll.

        try {
            this.socket = new WebSocket(this.URL);

            this.socket.onopen = () => {
                console.log("WebSocket Connected");
                this.isConnected = true;
                if (this.reconnectInterval) clearInterval(this.reconnectInterval);
                if (this.pollFallbackInterval) clearInterval(this.pollFallbackInterval);

                // Request Initial Map
                this.socket?.send(JSON.stringify({ type: 'GET_MAP' }));
            };

            this.socket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.handleMessage(message);
                } catch (e) {
                    console.error("Invalid WS message", e);
                }
            };

            this.socket.onclose = () => {
                console.log("WebSocket Disconnected");
                this.isConnected = false;
                this.attemptReconnect();
            };

            this.socket.onerror = (err) => {
                console.error("WebSocket Error", err);
                // Fallback to polling if WS fails
                this.startPollingFallback();
            };
        } catch (e) {
            this.startPollingFallback();
        }
    }

    private handleMessage(message: any) {
        const store = useSimulationStore.getState();

        switch (message.type) {
            case 'SIMULATION_UPDATE':
                // { tick: 123, vehicles: [], intersections: [] }
                if (message.payload.vehicles) store.setVehicles(message.payload.vehicles);
                if (message.payload.intersections) store.setIntersections(message.payload.intersections);
                store.incrementTick();
                break;

            case 'MAP_UPDATE':
                // { nodes: [], edges: [] }
                store.setMapGraph(message.payload);
                break;

            case 'METRICS_UPDATE':
                // { avgWaitTime: ... }
                store.setMetrics(message.payload);
                break;

            case 'EMERGENCY_UPDATE':
                store.setEmergency(message.payload);
                break;

            default:
                break;
        }
    }

    private attemptReconnect() {
        if (this.reconnectInterval) return;
        this.reconnectInterval = setInterval(() => {
            console.log("Attempting WS Reconnect...");
            this.connect();
        }, 5000);
    }

    // Fallback: Use the old polling logic if WS is unavailable
    private startPollingFallback() {
        if (this.pollFallbackInterval) return;
        console.warn("WebSocket unavailable. Switching to Polling Fallback.");

        // Initial Map Gen (Simulated)
        const map = generateMapGraph();
        useSimulationStore.getState().setMapGraph(map);

        const poll = async () => {
             try {
                // Fetch Grid State
                const resGrid = await fetch('http://localhost:8001/api/grid/state').catch(() => null);
                if (resGrid && resGrid.ok) {
                    const data = await resGrid.json();
                    useSimulationStore.getState().setIntersections(data.intersections || []);
                    useSimulationStore.getState().setVehicles(data.vehicles || []);
                    useSimulationStore.getState().incrementTick();
                }

                // Fetch Emergency
                const resEmg = await fetch('http://localhost:8001/api/emergency/state').catch(() => null);
                if (resEmg && resEmg.ok) {
                    const data = await resEmg.json();
                    if (data.emergency && data.emergency.active) {
                        useSimulationStore.getState().setEmergency({
                            id: 'EMG-1',
                            laneId: data.emergency.laneId,
                            position: data.emergency.position,
                            speed: data.emergency.speed,
                            type: 'emergency',
                            active: true
                        });
                    } else {
                        useSimulationStore.getState().setEmergency(null);
                    }
                }

                // Simulate Metrics Update
                useSimulationStore.getState().setMetrics({
                    tick: useSimulationStore.getState().tick_id,
                    avgWaitTime: Math.random() * 60 + 20,
                    throughput: Math.floor(Math.random() * 500 + 1000),
                    emergencyDelay: 0,
                    signalSwitchRate: 0.5,
                    congestion: Math.random()
                });

             } catch (e) {
                 // Silent fail on poll
             }
        };

        this.pollFallbackInterval = setInterval(poll, 100);
    }
}

export const webSocketService = new WebSocketService();
