import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import WorldMap from './components/WorldMap';
import LivePlayer from './components/LivePlayer';
import Minimap from './components/Minimap';
import { CAMERAS } from './constants';
import { Camera } from './types';

type ViewMode = 'map' | 'immersive';

const App: React.FC = () => {
  const [activeCamera, setActiveCamera] = useState<Camera | null>(CAMERAS[0] ?? null);
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showMinimap, setShowMinimap] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);

  // Reset iframe state when camera changes
  useEffect(() => {
    if (!activeCamera) return;
    setIframeLoaded(false);
    setShowMinimap(false);
  }, [activeCamera?.id]);

  const handleCameraSelect = (camera: Camera) => {
    // Cinematic fly-to zoom into camera location before switching views
    if (mapInstance && camera.coordinates) {
      const currentZoom = mapInstance.getZoom();
      const targetZoom = 12;

      mapInstance.flyTo({
        center: [camera.coordinates.lng, camera.coordinates.lat],
        zoom: targetZoom,
        pitch: 45,
        bearing: 0,
        duration: 2000,
        essential: true,
        curve: 1.42
      });

      const duration = Math.max(2000, (targetZoom - currentZoom) * 300);

      setTimeout(() => {
        setActiveCamera(camera);
        setViewMode('immersive');
        setIsSidebarOpen(false);
        setShowMinimap(false);
      }, duration - 500);
    } else {
      setActiveCamera(camera);
      setViewMode('immersive');
      setIsSidebarOpen(false);
      setShowMinimap(false);
    }
  };

  const handleShuffle = () => {
    if (!activeCamera) return;
    const currentIndex = CAMERAS.findIndex(c => c.id === activeCamera.id);
    let nextIndex = Math.floor(Math.random() * CAMERAS.length);
    while (nextIndex === currentIndex && CAMERAS.length > 1) {
      nextIndex = Math.floor(Math.random() * CAMERAS.length);
    }
    setActiveCamera(CAMERAS[nextIndex]);
    if (viewMode === 'map') setViewMode('immersive');
  };

  return (
    <div className="relative h-screen w-screen bg-black text-white overflow-hidden font-sans selection:bg-white/20">
      
      {/* MAP VIEW LAYER */}
      {/* We keep this mounted but handle visibility/opacity for transition effects */}
      <div 
        className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${viewMode === 'map' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <WorldMap
          cameras={CAMERAS}
          onSelectCamera={handleCameraSelect}
          onOpenList={() => setIsSidebarOpen(true)}
          onShuffle={handleShuffle}
          onMapCreated={(map) => setMapInstance(map)}
        />
      </div>

      {/* IMMERSIVE VIEW LAYER */}
      <div 
        className={`absolute inset-0 z-10 transition-opacity duration-1000 ease-in-out ${viewMode === 'immersive' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Background Video (Only render iframe if in immersive mode to save resources/autoplay issues) */}
        {viewMode === 'immersive' && activeCamera && (
          <div className="absolute inset-0 z-0">
            {!iframeLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
                  <span className="text-xs font-medium tracking-[0.2em] text-white/40 uppercase">Establishing Link</span>
                </div>
              </div>
            )}
            <div className="w-full h-full relative">
              <div className={`w-full h-full transition-opacity duration-1000 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}>
                <LivePlayer
                  camera={activeCamera}
                  onLoaded={() => setIframeLoaded(true)}
                />
              </div>
              {/* Vignette Overlay */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
            </div>
          </div>
        )}

        {/* Top Bar: Brand & Status */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-50 pointer-events-none">
          <div className="flex gap-4 pointer-events-auto">
             {/* Back to Map Button */}
             <button 
               onClick={() => setViewMode('map')}
               className="glass px-4 py-2 rounded-full flex items-center gap-2 hover:bg-white/10 transition-colors group"
             >
                <svg className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="text-xs font-semibold tracking-wider uppercase text-white/90">Map</span>
             </button>
          </div>

        </div>

        {/* Bottom Information & Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pb-10 md:p-8 md:pb-10 z-50 flex flex-col items-center md:flex-row justify-between items-end gap-6 pointer-events-none">

          {/* Left: Location Info */}
          <div className="max-w-md pointer-events-auto transition-transform duration-500 hover:scale-[1.02] mb-20 md:mb-0">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-white/60 text-xs font-medium tracking-wider uppercase mb-2">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {activeCamera?.location ?? ''}
              </div>
              {activeCamera && (
                <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white leading-tight drop-shadow-lg">
                  {activeCamera.name}
                </h1>
              )}
            </div>
          </div>

          {/* Center: The Dock & Minimap (Only visible in Immersive Mode) */}
          <div className="absolute left-1/2 bottom-6 md:bottom-10 -translate-x-1/2 pointer-events-auto">
            {/* Minimap Popup */}
            {showMinimap && activeCamera && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 transition-all duration-300">
                <Minimap camera={activeCamera} onClose={() => setShowMinimap(false)} />
              </div>
            )}

            <div className="glass-panel px-2 py-2 rounded-2xl flex items-center gap-1 scale-90 md:scale-100 transition-all duration-300 hover:scale-105 hover:bg-black/60">

              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-4 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-all group flex flex-col items-center gap-1 w-20"
              >
                <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-1">List</span>
              </button>

              <div className="w-[1px] h-8 bg-white/10 mx-1"></div>

              <button
                onClick={handleShuffle}
                className="p-4 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-all group flex flex-col items-center gap-1 w-20"
              >
                <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-1">Shuffle</span>
              </button>

              <div className="w-[1px] h-8 bg-white/10 mx-1"></div>

              <button
                onClick={() => setShowMinimap(!showMinimap)}
                className={`p-4 rounded-xl transition-all group flex flex-col items-center gap-1 w-20 ${showMinimap ? 'bg-white/10 text-white' : 'hover:bg-white/10 text-white/80 hover:text-white'}`}
              >
                <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-1">Map</span>
              </button>

            </div>
          </div>

          {/* Right: Category/Meta */}
          <div className="hidden md:block pointer-events-auto">
             <div className="glass px-4 py-2 rounded-full text-xs font-medium text-white/80 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                {activeCamera?.category ?? ''}
             </div>
          </div>
        </div>
      </div>

      <Sidebar 
        selectedCameraId={activeCamera?.id ?? ''} 
        onSelectCamera={handleCameraSelect} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

    </div>
  );
};

export default App;
