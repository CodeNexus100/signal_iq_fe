# SignalIQ Improvement Roadmap

## 1. Architecture Proposals

### A. Clean Agent Orchestration
**Current State**: Scattered `useState` in `App.tsx` and direct prop passing.
**Proposal**: Implement a **Central Simulation Store** (using Zustand or Redux Toolkit).
*   **Single Source of Truth**: All vehicle positions, signal states, and emergency statuses live in one store.
*   **Selectors**: Components subscribe only to what they need (e.g., `SignalControlPanel` subscribes only to `signals[id]`).

### B. Command Bus / Event-Driven Architecture
**Current State**: Direct `fetch` calls in components.
**Proposal**: Introduce a **Command Bus Service**.
*   **Pattern**: `CommandBus.dispatch({ type: 'SET_SIGNAL', payload: { id, state } })`.
*   **Optimistic Updates**: The bus immediately updates the local store, sends the API request, and rolls back if it fails.
*   **Deduplication**: Prevent spamming the API when sliding a slider (debounce/throttle at the bus level).

### C. Scalable Map Abstraction
**Current State**: Hardcoded loops for 5x5 grid (`grid.h`, `grid.v`).
**Proposal**: **Graph-Based Map Definition**.
*   **Data Structure**: Define the map as Nodes (Intersections) and Edges (Roads).
*   **Rendering**: A generic `MapRenderer` component that iterates over Nodes/Edges, supporting arbitrary layouts (curved roads, irregular grids).
*   Example:
    ```typescript
    interface MapGraph {
      nodes: { id: string; x: number; y: number; type: 'intersection' }[];
      edges: { id: string; from: string; to: string; lanes: number; geometry: Point[] }[];
    }
    ```

### D. Emergency Vehicle Priority Handling
**Current State**: Simple polling check.
**Proposal**: **Priority WebSocket Channel**.
*   Emergency events should be pushed instantly via WebSocket, bypassing the 100ms polling loop.
*   Frontend should trigger a "System Override" mode in the Store, locking manual controls to prevent conflict during emergency scenarios.

---

## 2. Phased Roadmap

### Phase 1: Consolidation (Stability & Clean Up)
*Goal: Remove polling storms and split-brain states.*

1.  **Introduce Zustand Store**: Create `useSimulationStore`.
2.  **Centralize Data Fetching**:
    *   Create a single `SimulationService` that polls `/grid/state` and `/emergency/state` once.
    *   Update the Store.
    *   Remove individual `useEffect` polling from child components (`App`, `SignalControlPanel`, `AIDecisionPanel`).
3.  **Unify Map Components**:
    *   Refactor `TrafficMap2D` to be the "Source of Truth" renderer.
    *   Make `LiveMapView` wrap `TrafficMap2D` with different styling props, rather than re-implementing logic.

### Phase 2: Abstraction (Scalability)
*Goal: Support arbitrary maps and complex road networks.*

1.  **Define Map Schema**: Create a JSON schema for the road network.
2.  **Generic Map Component**: Rewrite `TrafficMap2D` to render based on the schema (Nodes/Edges) instead of loop indices.
3.  **Command Bus Implementation**: Implement the Command pattern for all user interactions (Signals, Emergency, AI).
4.  **Refactor Vehicle Animation**:
    *   Move interpolation logic into a Web Worker or a specialized hook that doesn't block the main thread.

### Phase 3: Advanced Features & Optimization
*Goal: Real-time performance for 1000+ agents.*

1.  **WebSocket Integration**: Replace polling with Socket.io / SignalR.
2.  **Spatial Partitioning**: Implement a QuadTree for rendering to only draw vehicles currently in the viewport (if zooming is added).
3.  **ML Feedback Loop**: Visualize the AI's "Thought Process" (e.g., overlay predicted congestion paths on the map using the Graph edges).

---

## 3. Refactoring Suggestions

### Separation of Concerns
*   **`services/`**: API calls, WebSocket management.
*   **`store/`**: Zustand stores (`useGridStore`, `useUIStore`).
*   **`components/map/`**: Konva components (`MapNode`, `MapEdge`, `VehicleSprite`).
*   **`components/controls/`**: UI panels.

### Recommended State Structure (Zustand)

```typescript
interface SimulationState {
  // Domain State
  intersections: Record<string, IntersectionStatus>;
  vehicles: Record<string, Vehicle>;
  emergency: EmergencyStatus;
  mapTopology: GraphData; // Nodes & Edges

  // UI State
  selectedIntersectionId: string | null;
  isSimulationRunning: boolean;

  // Actions
  updateGrid: (data: GridState) => void;
  setSignal: (id: string, state: SignalState) => void; // Optimistic
}
```

### Async/Race Condition Fix
Instead of replacing the entire state on every poll, use **differential updates** or timestamp-based merging.
*   If the user just updated a signal (timestamp $T_1$), and the poll returns data from $T_0$ (where $T_0 < T_1$), ignore the signal status from the poll for that specific ID to prevent "jumping back".
