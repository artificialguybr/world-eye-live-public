import React, { useMemo, useState, useEffect } from 'react';
import { Camera } from '../types';
import tzLookup from 'tz-lookup';
import { Map, MapMarker, MarkerContent, MarkerTooltip } from '@/components/ui/map';

interface WorldMapProps {
  cameras: Camera[];
  onSelectCamera: (camera: Camera) => void;
  onOpenList: () => void;
  onShuffle: () => void;
  onMapCreated?: (map: any) => void;
}

const WorldMap: React.FC<WorldMapProps> = ({ cameras, onSelectCamera, onOpenList, onShuffle, onMapCreated }) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const getLocalTime = (timeZone: string, date: Date) => {
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(date);
    } catch {
      return '--:--';
    }
  };

  const camerasWithTz = useMemo(() => {
    return cameras.map(cam => {
      let timeZone = cam.timeZone;
      try {
        if (!timeZone) {
          timeZone = tzLookup(cam.coordinates.lat, cam.coordinates.lng);
        }
      } catch {
        timeZone = undefined;
      }
      return { ...cam, timeZone };
    });
  }, [cameras]);

  return (
    <div className="w-full h-full relative bg-[#050505] flex flex-col items-center justify-end pb-24 overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute inset-0 z-0 opacity-25"
           style={{
             backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
             backgroundSize: '80px 80px'
           }}>
      </div>
      <div className="absolute inset-0 z-0 opacity-40 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(255,255,255,0.06),transparent_70%)]"></div>

      {/* Brand */}
      <div className="absolute top-6 left-8 z-20 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
        <div className="text-xs tracking-[0.4em] uppercase text-white/70">GlobalEyes</div>
        <div className="text-[10px] tracking-[0.3em] uppercase text-red-500 font-semibold animate-pulse">Live</div>
      </div>

      {/* Live Count */}
      <div className="absolute top-6 right-8 z-20 flex items-center gap-2">
        <span className="text-xs tracking-[0.2em] uppercase text-white/50 font-mono">{cameras.length.toLocaleString('pt-BR')}</span>
        <span className="text-[10px] tracking-[0.3em] uppercase text-red-500 font-semibold">LIVE now</span>
      </div>

      {/* Map Container */}
      <div className="absolute inset-0 px-3 top-20 bottom-24">
        <div className="absolute inset-0 rounded-[28px] border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.7)]"></div>
        <div className="absolute inset-0 rounded-[28px] bg-gradient-to-b from-white/5 via-transparent to-black/30 pointer-events-none"></div>
        <div className="absolute inset-0 rounded-[28px] bg-[radial-gradient(120%_120%_at_50%_-10%,rgba(255,255,255,0.08),transparent_60%)] pointer-events-none"></div>
        <div className="w-full h-full rounded-[28px] overflow-hidden">
          <Map
            center={[20, 0]}
            zoom={2}
            minZoom={1}
            maxZoom={8}
            styles={{
              dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
              light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
            }}
            onCreated={onMapCreated}
          >
            {camerasWithTz.map((camera, index) => (
              <MapMarker
                key={`${camera.id}-${index}`}
                longitude={camera.coordinates.lng}
                latitude={camera.coordinates.lat}
                onClick={() => onSelectCamera(camera)}
              >
                <MarkerContent>
                  <div className="relative w-3.5 h-3.5 rounded-full border-2 border-[#8ab4ff] bg-[#8ab4ff] shadow-lg cursor-pointer hover:scale-125 transition-transform" />
                </MarkerContent>
                <MarkerTooltip offset={[-0, -8]}>
                  <div className="glass-heavy px-3 py-2 rounded border border-white/10 text-center min-w-[160px] backdrop-blur-xl bg-black/80">
                    <p className="text-white text-[10px] font-bold tracking-wider uppercase mb-0.5">{camera.name}</p>
                    <div className="h-[1px] w-full bg-white/10 my-1"></div>
                    <div className="flex justify-between text-[9px] text-gray-400">
                      <span>{camera.category}</span>
                      <span className="text-green-400">LIVE</span>
                    </div>
                    <div className="mt-1 text-[9px] text-white/70 tabular-nums">Local {camera.timeZone ? getLocalTime(camera.timeZone, now) : '--:--'}</div>
                  </div>
                </MarkerTooltip>
              </MapMarker>
            ))}
          </Map>
        </div>
        <div className="absolute inset-0 rounded-[28px] pointer-events-none bg-gradient-to-b from-black/10 via-transparent to-black/20"></div>
      </div>

      {/* Map Actions (List & Shuffle) */}
      <div className="absolute bottom-6 z-[9999] flex gap-4" onClick={(e) => e.stopPropagation()}>
         <button
           onClick={onOpenList}
           className="glass px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-white/10 transition-all group cursor-pointer"
         >
            <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-xs font-semibold tracking-wider uppercase text-white">Locations</span>
         </button>

         <button
           onClick={onShuffle}
           className="glass px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-white/10 transition-all group cursor-pointer"
         >
            <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <span className="text-xs font-semibold tracking-wider uppercase text-white">Shuffle</span>
         </button>
      </div>

    </div>
  );
};

export default WorldMap;
