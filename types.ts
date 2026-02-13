
export type SignalState = 'RED' | 'YELLOW' | 'GREEN';

export type VehicleType = 'car' | 'emergency' | 'truck' | 'bus';

export interface Vehicle {
  id: string;
  laneId: string; // Identifies which road/lane the vehicle is on
  laneType: 'horizontal' | 'vertical';
  direction: 'forward' | 'backward'; // forward: L->R or T->B, backward: R->L or B->T
  position: number;
  speed: number;
  type: VehicleType;
}

export interface SignalStatus {
  id: string;
  state: SignalState;
  timer: number;
}

export interface IntersectionStatus {
  id: string;
  nsSignal: SignalState;
  ewSignal: SignalState;
  timer: number;
}
