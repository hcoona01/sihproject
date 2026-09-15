import React, { useState, useRef, useEffect } from 'react';
import { 
  VideoOff, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  Camera, 
  AlertCircle
} from 'lucide-react';
import { getVideoUrl } from '../config/api';

interface VideoViewportProps {
  backendUrl: string;
  roverId: number | null;
  distAhead: number | null;
}

export const VideoViewport: React.FC<VideoViewportProps> = ({
  backendUrl,
  roverId,
  distAhead,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [attemptLiveStream, setAttemptLiveStream] = useState(false);
  const [streamError, setStreamError] = useState(false);
  const [streamLoaded, setStreamLoaded] = useState(false);
  const [timecode, setTimecode] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const videoStreamUrl = getVideoUrl(backendUrl);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimecode(now.toISOString().replace('T', ' ').substring(11, 19));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`panel-card rounded-md overflow-hidden flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none w-screen h-screen' : 'w-full h-full min-h-[220px]'
      }`}
    >
      {/* Panel Top Header */}
      <div className="panel-header h-8 px-3 flex items-center justify-between text-xs font-mono select-none shrink-0">
        <div className="flex items-center gap-2">
          <Camera className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-semibold text-zinc-200">OPTICS: CAM-01 [FORWARD]</span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-500 text-[11px]">TARGET: ROVER-{roverId ?? '01'}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Status badge */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#1e2229] border border-[#2c323b] text-[10px]">
            {attemptLiveStream && streamLoaded ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="text-emerald-400 font-medium">STREAMING</span>
              </>
            ) : attemptLiveStream && streamError ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span className="text-rose-400 font-medium">FEED ERROR</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
                <span className="text-zinc-400 font-medium">STANDBY</span>
              </>
            )}
          </div>

          {/* Stream toggle button */}
          <button
            onClick={() => {
              setStreamError(false);
              setStreamLoaded(false);
              setAttemptLiveStream(!attemptLiveStream);
            }}
            className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1e2229] hover:bg-[#272b35] text-zinc-300 border border-[#2c323b] transition-colors"
          >
            {attemptLiveStream ? 'Standby View' : 'Connect /video'}
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1 rounded hover:bg-[#272b35] text-zinc-400 hover:text-zinc-200 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Main Screen Viewport */}
      <div className="relative flex-1 flex items-center justify-center bg-[#0d0e12] overflow-hidden min-h-[160px]">
        
        {attemptLiveStream ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={videoStreamUrl}
              alt="Rover Telemetry Feed"
              onLoad={() => {
                setStreamLoaded(true);
                setStreamError(false);
              }}
              onError={() => {
                setStreamLoaded(false);
                setStreamError(true);
              }}
              className={`w-full h-full object-contain ${streamLoaded && !streamError ? 'block' : 'hidden'}`}
            />

            {streamError && (
              <div className="flex flex-col items-center justify-center text-center p-4 space-y-2">
                <AlertCircle className="w-6 h-6 text-rose-400" />
                <div className="text-xs font-mono font-medium text-rose-400">NO VIDEO STREAM ON /video</div>
                <div className="text-[11px] font-mono text-zinc-500 max-w-xs">
                  Rover camera hardware is unpowered or stream is inactive.
                </div>
                <button
                  onClick={() => {
                    setStreamError(false);
                    setStreamLoaded(false);
                  }}
                  className="px-2.5 py-1 rounded bg-[#1e2229] hover:bg-[#272b35] text-xs font-mono text-zinc-300 border border-[#2c323b] inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3" />
                  Retry
                </button>
              </div>
            )}

            {!streamLoaded && !streamError && (
              <div className="flex flex-col items-center justify-center text-center p-4 space-y-2">
                <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
                <span className="font-mono text-xs text-zinc-400">CONNECTING VIDEO FEED...</span>
              </div>
            )}
          </div>
        ) : (
          /* Utilitarian Standby Viewport */
          <div className="relative w-full h-full flex flex-col items-center justify-center p-4 select-none text-center">
            <VideoOff className="w-8 h-8 text-zinc-600 mb-2" />
            <div className="font-mono text-xs font-semibold text-zinc-400 tracking-wider">
              VIDEO FEED STANDBY
            </div>
            <div className="text-[11px] font-mono text-zinc-600 mt-1 max-w-sm">
              Camera is in standby. Click "Connect /video" when camera hardware is transmitting.
            </div>
          </div>
        )}

        {/* Clean, non-distracting telemetry overlay bar */}
        <div className="absolute top-2 left-2 px-2 py-1 rounded bg-[#111217]/90 border border-[#22252b] text-[10px] font-mono text-zinc-400 flex items-center gap-3 pointer-events-none">
          <span>UTC: <strong className="text-zinc-200">{timecode}</strong></span>
          <span>RANGE: <strong className={distAhead !== null && distAhead < 30 ? 'text-amber-400' : 'text-emerald-400'}>
            {distAhead !== null ? `${distAhead} cm` : '--'}
          </strong></span>
        </div>

        <div className="absolute top-2 right-2 px-2 py-1 rounded bg-[#111217]/90 border border-[#22252b] text-[10px] font-mono text-zinc-400 pointer-events-none">
          SOURCE: <span className="text-zinc-300">/video</span>
        </div>

      </div>

      {/* Viewport Info Footer */}
      <div className="h-6 px-3 bg-[#16171c] border-t border-[#22252b] flex items-center justify-between text-[10px] font-mono text-zinc-500 shrink-0">
        <div className="truncate">
          URL: <span className="text-zinc-400">{videoStreamUrl}</span>
        </div>
        <div>
          STATUS: <span className="text-zinc-300">{attemptLiveStream ? 'FEED REQUESTED' : 'STANDBY'}</span>
        </div>
      </div>
    </div>
  );
};
