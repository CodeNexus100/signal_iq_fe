
import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Wifi, Video, Database, CheckCircle, AlertTriangle, RefreshCw, HardDrive, Terminal } from 'lucide-react';

const hardwareNodes = [
  { id: 'NODE-A1', type: 'Edge Server', status: 'Online', cpu: '12%', temp: '42°C', location: 'District 1' },
  { id: 'NODE-A2', type: 'Edge Server', status: 'Online', cpu: '24%', temp: '45°C', location: 'District 2' },
  { id: 'CAM-X10', type: 'Optical Sensor', status: 'Online', bandwidth: '45Mbps', temp: '38°C', location: 'Central' },
  { id: 'IoT-404', type: 'Pressure Pad', status: 'Maintenance', error: 'Packet Loss', location: 'East Bridge' },
];

const InfrastructureView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">System Infrastructure</h1>
          <p className="text-slate-400 text-sm">Real-time health monitoring for hardware and network layers</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all text-sm font-bold">
          <RefreshCw size={16} />
          Force Hardware Sync
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Edge Nodes', value: '42 / 42', icon: Database, color: 'text-emerald-400' },
          { label: 'Network Bandwidth', value: '2.4 Gbps', icon: Wifi, color: 'text-blue-400' },
          { label: 'Camera Feed Uptime', value: '99.98%', icon: Video, color: 'text-emerald-400' },
          { label: 'Database Sync', value: 'Synced', icon: HardDrive, color: 'text-purple-400' },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-slate-900/40 border border-slate-700/50 p-5 rounded-2xl flex flex-col gap-2"
          >
            <div className="flex justify-between items-start">
              <div className={`p-2 rounded-lg bg-slate-800 ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <CheckCircle size={14} className="text-emerald-500" />
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mt-2">{stat.label}</span>
            <span className="text-xl font-mono font-bold text-white">{stat.value}</span>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Cpu size={20} className="text-slate-400" />
            Hardware Deployment Map
          </h3>
          <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl overflow-hidden min-h-[400px]">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/50 text-[10px] uppercase text-slate-500 font-bold tracking-widest">
                <tr>
                  <th className="px-6 py-4">Node ID</th>
                  <th className="px-6 py-4">Component Type</th>
                  <th className="px-6 py-4">Load / Speed</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {hardwareNodes.map((node) => (
                  <tr key={node.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4 font-mono font-bold text-blue-400">{node.id}</td>
                    <td className="px-6 py-4 text-slate-300">{node.type}</td>
                    <td className="px-6 py-4 font-mono text-xs">{node.cpu || node.bandwidth}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${node.status === 'Online' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                        <span className={`text-[10px] font-bold uppercase ${node.status === 'Online' ? 'text-emerald-500' : 'text-amber-500'}`}>{node.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{node.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-6 space-y-4 h-full">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Terminal size={20} className="text-slate-400" />
              Real-time Logs
            </h3>
            <div className="bg-black/40 rounded-xl p-4 font-mono text-[10px] space-y-2 h-[450px] overflow-y-auto custom-scrollbar">
              <p className="text-emerald-400">[12:44:02] Heartbeat from I-104 - OK</p>
              <p className="text-slate-500">[12:44:05] Camera 42 frame buffer synced</p>
              <p className="text-amber-400">[12:44:12] Warning: Packet drop on East Bridge node (IoT-404)</p>
              <p className="text-blue-400">[12:44:18] AI Engine: Deploying local weights to NODE-A1</p>
              <p className="text-slate-500">[12:44:22] NTP Server drift corrected (-0.002s)</p>
              <p className="text-emerald-400">[12:44:25] Edge inference complete on Zone 4 (12ms)</p>
              <p className="text-slate-500">[12:44:30] Routine backup to cloud storage started</p>
              <p className="text-slate-600 animate-pulse">_ system listening...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfrastructureView;
