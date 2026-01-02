import React, { useEffect } from 'react';
import { Camera } from '../types';
import { Map, MapMarker, useMap } from '@/components/ui/map';

const MapResizer: React.FC<{ camera: Camera | null }> = ({ camera }) => {
  const { map } = useMap();

  useEffect(() => {
    if (map) {
      map.resize();
    }
  }, [map, camera?.id]);

  return null;
};

interface MinimapProps {
  camera: Camera | null;
  onClose: () => void;
}

const Minimap: React.FC<MinimapProps> = ({ camera, onClose }) => {
  if (!camera || !camera.coordinates) return null;

  return (
    <div className="relative z-[100] transition-all duration-300">
        <div className="flex items-center justify-between mb-2 bg-black/60 backdrop-blur-md rounded-lg px-3 py-1.5 border border border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 animate-pulse"></div>
            <span className="text-[10px] font-semibold text-white/90">
              {camera.location}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white p-1 hover:bg-white/10 rounded-md transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div
          className="w-56 h-40 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)]"
          onClick={(e) => e.stopPropagation()}
        >
          <Map
            center={[camera.coordinates.lng, camera.coordinates.lat]}
            zoom={13}
            styles={{
              dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
              light: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
            }}
          >
            <MapResizer camera={camera} />
            <MapMarker
              longitude={camera.coordinates.lng}
              latitude={camera.coordinates.lat}
              anchor="bottom"
            >
               <div className="relative">
                 <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow-lg"></div>
                 <div className="absolute -inset-2 rounded-full bg-red-500/20 animate-ping"></div>
               </div>
            </MapMarker>
          </Map>
        </div>
      </div>
);
};

export default Minimap;
