import React, { useState, useEffect } from 'react';
import { Camera } from '../types';
import { Map, MapMarker } from '@/components/ui/map';

interface MinimapProps {
  camera: Camera | null;
  onClose: () => void;
}

const Minimap: React.FC<MinimapProps> = ({ camera, onClose }) => {
  const [map, setMap] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
  }, [camera?.id]);

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
          style={{ width: '100%', height: '100%' }}
          onCreated={setMap}
          onClick={() => setIsLoaded(true)}
        >
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
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Minimap;
