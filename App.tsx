
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import KPISection from './components/KPISection';
import GraphMap from './src/components/map/GraphMap';
import AIDecisionPanel from './components/AIDecisionPanel';
import SignalControlPanel from './components/SignalControlPanel';
import EmergencyCard from './components/EmergencyCard';
import InfraStatus from './components/InfraStatus';
import AnalyticsWidget from './components/AnalyticsWidget';
import AnalyticsView from './components/AnalyticsView';
import EmergencyView from './components/EmergencyView';
import SignalControlView from './components/SignalControlView';
import InfrastructureView from './components/InfrastructureView';
import LiveMapView from './components/LiveMapView';

// Stores & Services
import { useSimulationStore } from './src/store/useSimulationStore';
import { simulationService } from './src/services/SimulationService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');

  // Selectors
  const intersectionsMap = useSimulationStore(state => state.intersections);
  const intersections = Object.values(intersectionsMap);
  const selectedIntersectionId = useSimulationStore(state => state.selectedIntersectionId);
  const vehicles = useSimulationStore(state => state.vehicles);
  const emergency = useSimulationStore(state => state.emergency);
  const aiStatus = useSimulationStore(state => state.aiStatus);
  const controllerMode = useSimulationStore(state => state.controllerMode);

  // Initialize Simulation Service
  useEffect(() => {
    simulationService.start();
    return () => simulationService.stop();
  }, []);

  const selectedInter = (selectedIntersectionId ? intersectionsMap[selectedIntersectionId] : null) || intersections[0];

  // Loading State
  if (intersections.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0b1e] text-slate-400">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <span className="text-sm font-mono animate-pulse">Initializing SignalIQ Grid...</span>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'Analytics':
        return <AnalyticsView />;
      case 'Emergency':
        return <EmergencyView />;
      case 'Signal Control':
        return <SignalControlView />;
      case 'Infrastructure':
        return <InfrastructureView />;
      case 'Live Map':
        return <LiveMapView />;
      case 'Dashboard':
      default:
        return (
          <div className="flex flex-col gap-6">
            <KPISection />
            <div className="grid grid-cols-12 gap-6 flex-1 min-h-[600px]">
              <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden flex-1 relative group shadow-2xl min-h-[500px]">
                  <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                    <span className="text-xs font-bold tracking-widest text-blue-400 uppercase">Urban Grid Logic (5x5)</span>
                    <h2 className="text-xl font-bold">SignalIQ Central Command</h2>
                  </div>
                  
                  <div className="absolute top-4 right-4 z-20 flex gap-2">
                     <div className="bg-black/60 px-3 py-1.5 rounded-full border border-slate-700 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${emergency?.active ? 'bg-red-500' : 'bg-green-500'}`} />
                        <span className="text-xs font-mono uppercase tracking-tighter">System: {emergency?.active ? 'Critical' : 'Nominal'}</span>
                      </div>
                  </div>
                  
                  <GraphMap />
                  
                  <div className="absolute bottom-4 left-4 z-20 flex gap-4 bg-black/40 backdrop-blur-sm p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                      <span className="text-[10px] uppercase font-bold text-emerald-500">Flowing</span>
                    </div>
                    {emergency?.active && (
                      <div className="flex items-center gap-2 border-l border-white/10 pl-4">
                        <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                        <span className="text-[10px] uppercase font-bold text-red-400">EMERGENCY ACTIVE</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SignalControlPanel intersection={selectedInter} />
                  <AnalyticsWidget />
                </div>
              </div>

              <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                <AIDecisionPanel />
                <EmergencyCard />
                <InfraStatus />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0b1e] text-slate-200 overflow-hidden font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden p-6 gap-6 custom-scrollbar">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
