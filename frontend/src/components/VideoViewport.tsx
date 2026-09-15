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

type StreamMode = 'test' | 'live' | 'standby';

export const VideoViewport: React.FC<VideoViewportProps> = ({
  backendUrl,
  roverId,
  distAhead,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Default to 'test' so the user's local video plays immediately
  const [streamMode, setStreamMode] = useState<StreamMode>('test');
  const [liveStreamError, setLiveStreamError] = useState(false);
  const [liveStreamLoaded, setLiveStreamLoaded] = useState(false);
  const [timecode, setTimecode] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const videoElementRef = useRef<HTMLVideoElement>(null);
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

  // Ensure video element plays when in test mode
  useEffect(() => {
    if (streamMode === 'test' && videoElementRef.current) {
      videoElementRef.current.play().catch(() => {});
    }
  }, [streamMode]);

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
            {streamMode === 'test' ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="text-emerald-400 font-medium">TEST FEED ACTIVE</span>
              </>
            ) : streamMode === 'live' && liveStreamLoaded ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="text-emerald-400 font-medium">LIVE BACKEND</span>
              </>
            ) : streamMode === 'live' && liveStreamError ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span className="text-rose-400 font-medium">FEED ERROR</span>
              </>
            ) : streamMode === 'live' ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span className="text-amber-400 font-medium">CONNECTING</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
                <span className="text-zinc-400 font-medium">STANDBY</span>
              </>
            )}
          </div>

          {/* Source Selector Buttons */}
          <div className="flex items-center rounded bg-[#131519] p-0.5 border border-[#22252b] text-[10px]">
            <button
              onClick={() => setStreamMode('test')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                streamMode === 'test' ? 'bg-[#272b35] text-emerald-300 font-semibold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Test Video
            </button>
            <button
              onClick={() => {
                setLiveStreamError(false);
                setLiveStreamLoaded(false);
                setStreamMode('live');
              }}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                streamMode === 'live' ? 'bg-[#272b35] text-blue-300 font-semibold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Live /video
            </button>
            <button
              onClick={() => setStreamMode('standby')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                streamMode === 'standby' ? 'bg-[#272b35] text-zinc-300 font-semibold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Standby
            </button>
          </div>

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
        
        {/* 1. TEST VIDEO MODE (playing /video.mp4 / /video.mov) */}
        {streamMode === 'test' && (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <video
              ref={videoElementRef}
              src="/video.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-contain"
            >
              <source src="/video.mp4" type="video/mp4" />
              <source src="/video.mov" type="video/quicktime" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {/* 2. LIVE STREAM MODE (/video endpoint) */}
        {streamMode === 'live' && (
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={videoStreamUrl}
              alt="Live Rover Video Feed"
              onLoad={() => {
                setLiveStreamLoaded(true);
                setLiveStreamError(false);
              }}
              onError={() => {
                setLiveStreamLoaded(false);
                setLiveStreamError(true);
              }}
              className={`w-full h-full object-contain ${liveStreamLoaded && !liveStreamError ? 'block' : 'hidden'}`}
            />

            {liveStreamError && (
              <div className="flex flex-col items-center justify-center text-center p-4 space-y-2">
                <AlertCircle className="w-6 h-6 text-rose-400" />
                <div className="text-xs font-mono font-medium text-rose-400">NO VIDEO STREAM ON /video</div>
                <div className="text-[11px] font-mono text-zinc-500 max-w-xs">
                  Rover camera hardware is unpowered or stream is inactive.
                </div>
                <button
                  onClick={() => {
                    setLiveStreamError(false);
                    setLiveStreamLoaded(false);
                  }}
                  className="px-2.5 py-1 rounded bg-[#1e2229] hover:bg-[#272b35] text-xs font-mono text-zinc-300 border border-[#2c323b] inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3" />
                  Retry
                </button>
              </div>
            )}

            {!liveStreamLoaded && !liveStreamError && (
              <div className="flex flex-col items-center justify-center text-center p-4 space-y-2">
                <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
                <span className="font-mono text-xs text-zinc-400">CONNECTING TO /video STREAM...</span>
              </div>
            )}
          </div>
        )}

        {/* 3. STANDBY MODE */}
        {streamMode === 'standby' && (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-4 select-none text-center">
            <VideoOff className="w-8 h-8 text-zinc-600 mb-2" />
            <div className="font-mono text-xs font-semibold text-zinc-400 tracking-wider">
              VIDEO FEED STANDBY
            </div>
            <div className="text-[11px] font-mono text-zinc-600 mt-1 max-w-sm">
              Camera optics idle. Select "Test Video" or "Live /video" above.
            </div>
          </div>
        )}

        {/* Telemetry overlay bar */}
        <div className="absolute top-2 left-2 px-2 py-1 rounded bg-[#111217]/90 border border-[#22252b] text-[10px] font-mono text-zinc-400 flex items-center gap-3 pointer-events-none">
          <span>UTC: <strong className="text-zinc-200">{timecode}</strong></span>
          <span>RANGE: <strong className={distAhead !== null && distAhead < 30 ? 'text-amber-400' : 'text-emerald-400'}>
            {distAhead !== null ? `${distAhead} cm` : '--'}
          </strong></span>
        </div>

        <div className="absolute top-2 right-2 px-2 py-1 rounded bg-[#111217]/90 border border-[#22252b] text-[10px] font-mono text-zinc-400 pointer-events-none">
          FEED: <span className="text-zinc-200 font-semibold uppercase">{streamMode}</span>
        </div>

      </div>

      {/* Viewport Info Footer */}
      <div className="h-6 px-3 bg-[#16171c] border-t border-[#22252b] flex items-center justify-between text-[10px] font-mono text-zinc-500 shrink-0">
        <div className="truncate">
          SOURCE: <span className="text-zinc-400">
            {streamMode === 'test' ? '/video.mp4 (Local Loop)' : streamMode === 'live' ? videoStreamUrl : 'STANDBY'}
          </span>
        </div>
        <div>
          STATUS: <span className="text-zinc-300 font-semibold uppercase">{streamMode}</span>
        </div>
      </div>
    </div>
  );
};
