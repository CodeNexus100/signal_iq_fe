
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

export interface EmergencyVehicle {
  id: string; // We might need to generate this if not provided
  laneId: string;
  position: number;
  speed: number;
  type: 'emergency';
  active: boolean;
}

export interface AIStatus {
  congestionLevel: string;
  prediction: {
    location: string;
    time: number; // minutes
  };
  recommendation: {
    action: string;
    value: string;
  };
  efficiency: number; // percentage
  aiActive: boolean;
}
