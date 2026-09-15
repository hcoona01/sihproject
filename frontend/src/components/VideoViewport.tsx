import React, { useState, useRef, useEffect } from 'react';
import { 
  VideoOff, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  Crosshair, 
  ShieldAlert, 
  Camera, 
  Radio
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
  // Default to false as per user instruction: "leave the video feed as a blank image"
  const [attemptLiveStream, setAttemptLiveStream] = useState(false);
  const [streamError, setStreamError] = useState(false);
  const [streamLoaded, setStreamLoaded] = useState(false);
  const [timecode, setTimecode] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const videoStreamUrl = getVideoUrl(backendUrl);

  // Timecode clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimecode(now.toISOString().replace('T', ' ').substring(0, 19));
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
      className={`relative flex flex-col bg-[#0b0f19] border border-slate-800/90 rounded-xl overflow-hidden shadow-2xl transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none w-screen h-screen' : 'w-full h-full min-h-[380px] lg:min-h-[440px]'
      }`}
    >
      {/* Viewport Top Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/80 text-xs font-mono select-none z-20">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/50 text-cyan-400">
            <Camera className="w-3.5 h-3.5" />
            <span className="font-semibold">CAM-01 [FORWARD GIMBAL]</span>
          </div>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-400">TARGET: ROVER-{roverId ?? '01'}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Live vs Standby status indicator */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-[11px]">
            {attemptLiveStream && streamLoaded ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping-subtle"></span>
                <span className="text-emerald-400 font-semibold">FEED LIVE</span>
              </>
            ) : attemptLiveStream && streamError ? (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span className="text-rose-400 font-semibold">FEED OFFLINE</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400/80"></span>
                <span className="text-amber-400/90 font-medium">STANDBY (AWAITING FEED)</span>
              </>
            )}
          </div>

          {/* Toggle Live Stream Attempt */}
          <button
            onClick={() => {
              setStreamError(false);
              setStreamLoaded(false);
              setAttemptLiveStream(!attemptLiveStream);
            }}
            className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-all ${
              attemptLiveStream 
                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-600/60 hover:bg-cyan-900' 
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Toggle Live /video Stream request"
          >
            {attemptLiveStream ? 'Switch to Standby' : 'Test Live Feed'}
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Viewport Screen */}
      <div className="relative flex-1 flex items-center justify-center bg-[#070a11] overflow-hidden min-h-[300px]">
        
        {/* Subtle Scanlines & Grid Overlay */}
        <div className="absolute inset-0 scanlines z-10 opacity-70 pointer-events-none" />
        <div className="absolute inset-0 grid-bg z-0 opacity-40" />

        {/* Live stream element if toggled */}
        {attemptLiveStream ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={videoStreamUrl}
              alt="Rover Video Telemetry"
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

            {/* Error or connecting fallback */}
            {streamError && (
              <div className="flex flex-col items-center justify-center text-center p-6 z-20 space-y-3">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-mono text-sm font-semibold text-rose-300">STREAM UNREACHABLE</h4>
                  <p className="text-xs font-mono text-slate-400 mt-1 max-w-sm">
                    No active video transmission detected on <code className="text-slate-300">/video</code>. Rover camera hardware may be standby or unpowered.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setStreamError(false);
                    setStreamLoaded(false);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 border border-slate-700"
                >
                  <RefreshCw className="w-3 h-3" />
                  Retry Connection
                </button>
              </div>
            )}

            {!streamLoaded && !streamError && (
              <div className="flex flex-col items-center justify-center text-center p-6 z-20 space-y-2">
                <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                <span className="font-mono text-xs text-slate-400">SYNCHRONIZING VIDEO PIPELINE...</span>
              </div>
            )}
          </div>
        ) : (
          /* Blank Standby Feed Image / Robotics Viewport Canvas */
          <div className="relative w-full h-full flex items-center justify-center bg-radial from-slate-950 via-[#07090e] to-[#040609]">
            {/* Standby Canvas HUD graphics */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Tactical reticle */}
              <div className="relative w-44 h-44 rounded-full border border-cyan-500/20 flex items-center justify-center">
                <div className="w-28 h-28 rounded-full border border-dashed border-cyan-500/30 flex items-center justify-center">
                  <Crosshair className="w-8 h-8 text-cyan-400/40" />
                </div>
                {/* Tick marks */}
                <div className="absolute top-0 w-2 h-0.5 bg-cyan-400/40" />
                <div className="absolute bottom-0 w-2 h-0.5 bg-cyan-400/40" />
                <div className="absolute left-0 w-0.5 h-2 bg-cyan-400/40" />
                <div className="absolute right-0 w-0.5 h-2 bg-cyan-400/40" />
              </div>
            </div>

            {/* Standby Message */}
            <div className="relative z-20 flex flex-col items-center text-center px-4 select-none">
              <div className="w-11 h-11 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-500 mb-2">
                <VideoOff className="w-5 h-5 text-slate-400" />
              </div>
              <div className="font-mono text-xs tracking-widest text-slate-300 uppercase font-semibold">
                TELEMETRY FEED: STANDBY
              </div>
              <div className="text-[11px] font-mono text-slate-500 mt-1 max-w-xs">
                Optical sensor in low-power idle mode. Awaiting transmission start from Rover.
              </div>
            </div>
          </div>
        )}

        {/* Viewport Corner HUD Brackets */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-500/50 z-20 pointer-events-none" />
        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-500/50 z-20 pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-500/50 z-20 pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-500/50 z-20 pointer-events-none" />

        {/* Viewport HUD Overlays */}
        <div className="absolute top-3 left-9 z-20 pointer-events-none font-mono text-[10px] text-slate-400 space-y-0.5">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>SYSTEM: NOMINAL</span>
          </div>
          <div className="text-slate-500">UTC: {timecode}</div>
        </div>

        <div className="absolute top-3 right-9 z-20 pointer-events-none font-mono text-[10px] text-right text-slate-400 space-y-0.5">
          <div>STREAM: /video</div>
          <div className="text-slate-500">RES: 1080P @ 60HZ TARGET</div>
        </div>

        {/* Bottom HUD bar */}
        <div className="absolute bottom-3 left-9 right-9 z-20 pointer-events-none flex items-center justify-between font-mono text-[11px] text-slate-400">
          <div className="flex items-center gap-3 bg-slate-950/70 px-2.5 py-1 rounded border border-slate-800/80 backdrop-blur-sm">
            <span className="text-slate-500">DIST AHEAD:</span>
            <span className={distAhead !== null && distAhead < 30 ? 'text-amber-400 font-bold' : 'text-cyan-300 font-semibold'}>
              {distAhead !== null ? `${distAhead} cm` : 'ACQUIRING...'}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/70 px-2.5 py-1 rounded border border-slate-800/80 backdrop-blur-sm">
            <Radio className="w-3 h-3 text-cyan-400" />
            <span className="text-slate-400">OPTICAL LINK: READY</span>
          </div>
        </div>

      </div>

      {/* Viewport Footer Diagnostics */}
      <div className="px-4 py-2 bg-slate-950/90 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-4">
          <span>SOURCE: <strong className="text-slate-300">{videoStreamUrl}</strong></span>
          <span className="hidden md:inline text-slate-600">•</span>
          <span className="hidden md:inline">ENCODER: <strong className="text-slate-300">H.264/MJPEG</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500">MODE:</span>
          <span className="text-cyan-400 font-semibold">{attemptLiveStream ? 'STREAM REQUEST ON' : 'STANDBY BLANK VIEWPORT'}</span>
        </div>
      </div>
    </div>
  );
};
