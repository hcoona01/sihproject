import React, { useState } from 'react';
import { 
  Lightbulb, 
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Terminal, 
  Power,
  ShieldCheck
} from 'lucide-react';
import { toggleRoverLed, LedCommandResult } from '../services/roverApi';

interface LedControlPanelProps {
  backendUrl: string;
  roverId: number | null;
  onLog: (source: 'LED', level: 'info' | 'warn' | 'error' | 'success', msg: string) => void;
}

export const LedControlPanel: React.FC<LedControlPanelProps> = ({
  backendUrl,
  roverId,
  onLog,
}) => {
  const [isOn, setIsOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<LedCommandResult | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const handleToggle = async () => {
    if (isLoading || isLocked) return;

    const nextState = !isOn;
    setIsLoading(true);
    onLog('LED', 'info', `Transmitting LED command: SET_LED_${nextState ? 'ON' : 'OFF'} via GET`);

    const start = performance.now();
    const result = await toggleRoverLed(backendUrl, nextState, roverId ?? 100);
    const elapsed = Math.round(performance.now() - start);

    setIsLoading(false);
    setLastResult(result);

    if (result.success) {
      setIsOn(nextState);
      onLog('LED', 'success', `LED command acknowledged [${nextState ? 'ON' : 'OFF'}] (${elapsed}ms)`);
    } else {
      onLog('LED', 'warn', `LED command returned status ${result.status}: ${result.message}`);
      // If server returned 404 (route not yet mounted), toggle state optimistically with notice
      if (result.status === 404) {
        setIsOn(nextState);
      }
    }
  };

  return (
    <div className="flex flex-col bg-[#0b0f19] border border-slate-800/90 hover:border-slate-700/80 rounded-xl overflow-hidden shadow-xl transition-all">
      {/* Panel Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800/80 font-mono text-xs">
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded border transition-colors ${
            isOn ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            <Lightbulb className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-slate-200 tracking-wider">ROVER LED ILLUMINATION</span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold border ${
            isOn 
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
              : 'bg-slate-800/60 text-slate-400 border-slate-700/60'
          }`}>
            {isOn ? 'ILLUMINATORS ACTIVE' : 'LIGHTS OFF'}
          </span>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        
        {/* Visual Headlight Emitter Preview */}
        <div className="relative w-full h-24 rounded-lg bg-slate-950 border border-slate-800/80 overflow-hidden flex items-center justify-center select-none">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 grid-bg opacity-30" />

          {/* Light cone beam effect when ON */}
          {isOn && (
            <div className="absolute inset-0 bg-radial from-amber-400/25 via-amber-500/10 to-transparent pointer-events-none transition-opacity duration-300" />
          )}

          {/* Dual LED Pod Indicators */}
          <div className="relative z-10 flex items-center gap-12">
            {/* Left Pod */}
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 ${
                isOn 
                  ? 'bg-amber-300 border-white shadow-[0_0_25px_rgba(251,191,36,0.9)] scale-105' 
                  : 'bg-slate-900 border-slate-700 text-slate-600'
              }`}>
                <Zap className={`w-4 h-4 ${isOn ? 'text-amber-950 fill-amber-950' : 'text-slate-600'}`} />
              </div>
              <span className="text-[9px] font-mono text-slate-500">POD-L</span>
            </div>

            {/* Center Chassis Plate */}
            <div className="px-3 py-1 rounded bg-slate-900/90 border border-slate-800 text-center font-mono">
              <div className="text-[10px] text-slate-400">HIGH-BEAM ARRAY</div>
              <div className={`text-xs font-bold tracking-widest ${isOn ? 'text-amber-400' : 'text-slate-500'}`}>
                {isOn ? '100% LUMENS' : 'STANDBY (0%)'}
              </div>
            </div>

            {/* Right Pod */}
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 ${
                isOn 
                  ? 'bg-amber-300 border-white shadow-[0_0_25px_rgba(251,191,36,0.9)] scale-105' 
                  : 'bg-slate-900 border-slate-700 text-slate-600'
              }`}>
                <Zap className={`w-4 h-4 ${isOn ? 'text-amber-950 fill-amber-950' : 'text-slate-600'}`} />
              </div>
              <span className="text-[9px] font-mono text-slate-500">POD-R</span>
            </div>
          </div>
        </div>

        {/* Primary Toggle Switch */}
        <div className="flex items-center justify-between gap-4 p-3 bg-slate-900/50 rounded-lg border border-slate-800">
          <div>
            <div className="text-xs font-mono font-semibold text-slate-200">
              LED POWER BUS
            </div>
            <div className="text-[11px] font-mono text-slate-500">
              Dispatches GET /led?state={isOn ? '0' : '1'}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLocked(!isLocked)}
              className={`p-1.5 rounded text-xs font-mono border transition-colors ${
                isLocked ? 'bg-amber-950/60 text-amber-300 border-amber-700/50' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title={isLocked ? 'Unlock LED control' : 'Lock LED control from accidental toggle'}
            >
              <ShieldCheck className="w-4 h-4" />
            </button>

            <button
              onClick={handleToggle}
              disabled={isLoading || isLocked}
              className={`relative px-5 py-2.5 rounded-lg font-mono text-xs font-bold tracking-wider transition-all flex items-center gap-2 select-none shadow-md ${
                isLocked
                  ? 'bg-slate-800/50 text-slate-600 border border-slate-800 cursor-not-allowed'
                  : isLoading
                  ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50 cursor-wait'
                  : isOn
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)] border border-amber-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>TRANSMITTING...</span>
                </>
              ) : (
                <>
                  <Power className="w-4 h-4" />
                  <span>{isOn ? 'TURN OFF LEDS' : 'ACTIVATE LEDS'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Command Audit / Status Output */}
        <div className="bg-slate-950/90 rounded-md p-2.5 border border-slate-800/80 font-mono text-[11px] space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Terminal className="w-3 h-3 text-cyan-400" />
              <span>COMMAND TELEMETRY</span>
            </span>
            {lastResult && (
              <span className={lastResult.success ? 'text-emerald-400' : 'text-amber-400'}>
                HTTP {lastResult.status || 'ERR'}
              </span>
            )}
          </div>

          <div className="text-slate-300 truncate">
            {lastResult ? (
              <span className="flex items-center gap-1.5">
                {lastResult.success ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
                )}
                <span className="truncate">{lastResult.message}</span>
              </span>
            ) : (
              <span className="text-slate-500 italic">Ready for operator commands.</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
