import React, { useState } from 'react';
import { 
  Lightbulb, 
  Power, 
  Lock, 
  Unlock, 
  RefreshCw,
  CheckCircle2,
  AlertCircle
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
    onLog('LED', 'info', `Dispatching GET /led?state=${nextState ? '1' : '0'}`);

    const start = performance.now();
    const result = await toggleRoverLed(backendUrl, nextState, roverId ?? 100);
    const elapsed = Math.round(performance.now() - start);

    setIsLoading(false);
    setLastResult(result);

    if (result.success) {
      setIsOn(nextState);
      onLog('LED', 'success', `LED state [${nextState ? 'ON' : 'OFF'}] confirmed (${elapsed}ms)`);
    } else {
      onLog('LED', 'warn', `LED request returned HTTP ${result.status}: ${result.message}`);
      if (result.status === 404) {
        setIsOn(nextState);
      }
    }
  };

  return (
    <div className="panel-card rounded-md overflow-hidden flex flex-col">
      {/* Header */}
      <div className="panel-header h-7 px-3 flex items-center justify-between text-xs font-mono select-none">
        <div className="flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-semibold text-zinc-200">ROVER LED CONTROL</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Physical LED Indicator lamp */}
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className={`w-2 h-2 rounded-full border border-black/50 ${
              isOn ? 'bg-amber-400 shadow-[0_0_6px_#f59e0b]' : 'bg-zinc-700'
            }`} />
            <span className={`font-mono font-medium ${isOn ? 'text-amber-400' : 'text-zinc-500'}`}>
              {isOn ? 'ILLUMINATION ON' : 'OFF'}
            </span>
          </div>

          {/* Safety lock */}
          <button
            onClick={() => setIsLocked(!isLocked)}
            className="p-0.5 rounded text-zinc-500 hover:text-zinc-300 transition-colors"
            title={isLocked ? 'Unlock LED control' : 'Lock LED control'}
          >
            {isLocked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-3 flex items-center justify-between gap-3 text-xs font-mono">
        <div className="space-y-0.5">
          <div className="text-[11px] text-zinc-400">BUS: GET /led</div>
          <div className="text-[10px] text-zinc-500 truncate max-w-[200px]">
            {lastResult ? (
              <span className={`flex items-center gap-1 ${lastResult.success ? 'text-emerald-400' : 'text-zinc-400'}`}>
                {lastResult.success ? <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" /> : <AlertCircle className="w-3 h-3 text-zinc-500 shrink-0" />}
                <span className="truncate">HTTP {lastResult.status || 'ERR'}</span>
              </span>
            ) : (
              <span>Ready for command</span>
            )}
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={isLoading || isLocked}
          className={`h-8 px-4 rounded font-mono text-xs font-semibold flex items-center gap-2 transition-all select-none ${
            isLocked
              ? 'bg-zinc-800/60 text-zinc-600 cursor-not-allowed border border-zinc-800'
              : isLoading
              ? 'bg-zinc-800 text-zinc-400 cursor-wait border border-zinc-700'
              : isOn
              ? 'bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold border border-amber-500'
              : 'bg-[#22252b] hover:bg-[#2c323b] text-zinc-200 border border-[#2e333d]'
          }`}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>SENDING...</span>
            </>
          ) : (
            <>
              <Power className="w-3.5 h-3.5" />
              <span>{isOn ? 'TURN OFF' : 'ACTIVATE'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
