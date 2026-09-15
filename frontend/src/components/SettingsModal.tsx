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
        setTestStatus(`HTTP ${res.status} OK (${elapsed}ms)`);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-mono">
      <div className="relative w-full max-w-md bg-[#181b1f] border border-[#2c323b] rounded-md shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#1a1d23] border-b border-[#22252b]">
          <div className="flex items-center gap-2 text-zinc-300 text-xs font-semibold">
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span>STATION CONFIGURATION</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-[#22252b] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 text-xs text-zinc-300">
          
          {/* Backend Base URL */}
          <div className="space-y-1">
            <label className="block text-zinc-400 font-medium text-[11px]">
              BACKEND BASE URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formConfig.backendBaseUrl}
                onChange={(e) => setFormConfig({ ...formConfig, backendBaseUrl: e.target.value })}
                placeholder="https://sihproject-qt1s.onrender.com"
                className="flex-1 px-2.5 py-1.5 bg-[#131519] border border-[#2c323b] rounded text-zinc-200 focus:outline-none focus:border-blue-500 text-xs"
                required
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-2.5 py-1.5 rounded bg-[#22252b] hover:bg-[#2c323b] border border-[#2e333d] text-zinc-300 text-xs font-semibold disabled:opacity-50"
              >
                {isTesting ? 'Ping...' : 'Ping'}
              </button>
            </div>
            {testStatus && (
              <p className={`text-[10px] mt-1 ${testStatus.includes('OK') ? 'text-emerald-400' : 'text-amber-400'}`}>
                {testStatus}
              </p>
            )}
          </div>

          {/* Buffer Limit */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-zinc-400">HISTORY BUFFER SIZE</span>
              <span className="text-blue-400 font-bold">{formConfig.historyLimit} points</span>
            </div>
            <input
              type="range"
              min={15}
              max={80}
              step={5}
              value={formConfig.historyLimit}
              onChange={(e) => setFormConfig({ ...formConfig, historyLimit: Number(e.target.value) })}
              className="w-full accent-blue-500 bg-zinc-800 h-1.5 rounded"
            />
          </div>

          {/* Thresholds */}
          <div className="space-y-2 pt-2 border-t border-[#22252b]">
            <span className="text-[11px] font-semibold text-zinc-400 block">
              ALERT THRESHOLDS
            </span>
            
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-zinc-500 block mb-1">TEMP (&gt;°C)</label>
                <input
                  type="number"
                  value={formConfig.highTempThreshold}
                  onChange={(e) => setFormConfig({ ...formConfig, highTempThreshold: Number(e.target.value) })}
                  className="w-full px-2 py-1 bg-[#131519] border border-[#2c323b] rounded text-zinc-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-500 block mb-1">DIST (&lt;CM)</label>
                <input
                  type="number"
                  value={formConfig.lowDistThreshold}
                  onChange={(e) => setFormConfig({ ...formConfig, lowDistThreshold: Number(e.target.value) })}
                  className="w-full px-2 py-1 bg-[#131519] border border-[#2c323b] rounded text-zinc-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-500 block mb-1">HUMD (&gt;%)</label>
                <input
                  type="number"
                  value={formConfig.highHumdThreshold}
                  onChange={(e) => setFormConfig({ ...formConfig, highHumdThreshold: Number(e.target.value) })}
                  className="w-full px-2 py-1 bg-[#131519] border border-[#2c323b] rounded text-zinc-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-[#22252b]">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#22252b] hover:bg-[#2c323b] text-zinc-400 text-xs transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Defaults</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1 rounded bg-[#22252b] hover:bg-[#2c323b] text-zinc-300 text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1 px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
              >
                <Check className="w-3 h-3" />
                <span>Save</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
