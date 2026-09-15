import React, { useState } from 'react';
import { X, Check, Sliders, RotateCcw } from 'lucide-react';
import { DashboardConfig } from '../types/telemetry';
import { DEFAULT_CONFIG } from '../config/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DashboardConfig;
  onSave: (newCfg: DashboardConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [formConfig, setFormConfig] = useState<DashboardConfig>({ ...config });
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestStatus('Testing link...');
    try {
      const url = formConfig.backendBaseUrl.replace(/\/+$/, '');
      const start = performance.now();
      const res = await fetch(url, { method: 'GET' });
      const elapsed = Math.round(performance.now() - start);
      if (res.ok) {
        setTestStatus(`Success: HTTP ${res.status} in ${elapsed}ms`);
      } else {
        setTestStatus(`Warning: HTTP ${res.status}`);
      }
    } catch (e) {
      setTestStatus(`Error: ${e instanceof Error ? e.message : 'Unreachable'}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleReset = () => {
    setFormConfig({ ...DEFAULT_CONFIG });
    setTestStatus(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0b0f19] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden font-mono">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/90 border-b border-slate-800">
          <div className="flex items-center gap-2 text-cyan-400">
            <Sliders className="w-4 h-4" />
            <h3 className="font-display text-sm font-bold tracking-wider text-slate-100 uppercase">
              Station Configuration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs text-slate-300">
          
          {/* Backend Base URL */}
          <div className="space-y-1.5">
            <label className="block text-slate-400 font-semibold tracking-wider uppercase text-[11px]">
              Backend Base URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formConfig.backendBaseUrl}
                onChange={(e) => setFormConfig({ ...formConfig, backendBaseUrl: e.target.value })}
                placeholder="https://sihproject-qt1s.onrender.com"
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                required
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-cyan-400 font-semibold tracking-wide disabled:opacity-50"
              >
                {isTesting ? 'Testing...' : 'Test'}
              </button>
            </div>
            {testStatus && (
              <p className={`text-[11px] mt-1 ${testStatus.startsWith('Success') ? 'text-emerald-400' : 'text-amber-400'}`}>
                {testStatus}
              </p>
            )}
            <p className="text-[10px] text-slate-500">
              Streams will consume <code className="text-slate-400">/temp</code>, <code className="text-slate-400">/dist</code>, <code className="text-slate-400">/humd</code>, and <code className="text-slate-400">/video</code>.
            </p>
          </div>

          {/* History Limit */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-slate-400 font-semibold tracking-wider uppercase text-[11px]">
                Rolling Buffer Limit
              </label>
              <span className="text-cyan-400 font-bold">{formConfig.historyLimit} pts</span>
            </div>
            <input
              type="range"
              min={15}
              max={100}
              step={5}
              value={formConfig.historyLimit}
              onChange={(e) => setFormConfig({ ...formConfig, historyLimit: Number(e.target.value) })}
              className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg"
            />
            <span className="text-[10px] text-slate-500">
              Memory cap for real-time rolling trend charts without unbounded growth.
            </span>
          </div>

          {/* Alert Thresholds */}
          <div className="space-y-3 pt-3 border-t border-slate-800/80">
            <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Safety Warning Thresholds
            </h4>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">HIGH TEMP (°C)</label>
                <input
                  type="number"
                  value={formConfig.highTempThreshold}
                  onChange={(e) => setFormConfig({ ...formConfig, highTempThreshold: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">PROXIMITY (CM)</label>
                <input
                  type="number"
                  value={formConfig.lowDistThreshold}
                  onChange={(e) => setFormConfig({ ...formConfig, lowDistThreshold: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">HIGH HUMIDITY (%)</label>
                <input
                  type="number"
                  value={formConfig.highHumdThreshold}
                  onChange={(e) => setFormConfig({ ...formConfig, highHumdThreshold: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Defaults</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-colors shadow-md"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Settings</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
