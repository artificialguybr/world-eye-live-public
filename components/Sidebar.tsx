import React, { useMemo, useState } from 'react';
import { Camera } from '../types';

interface SidebarProps {
  cameras: Camera[];
  selectedCameraId: string;
  onSelectCamera: (cam: Camera) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ cameras, selectedCameraId, onSelectCamera, isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCameras = useMemo(() => {
    return cameras.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [searchQuery, cameras]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-full md:w-[400px] glass-heavy border-r border-white/10 transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-8 pb-4">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-light tracking-tight text-white">Explore</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <svg className="w-6 h-6 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-500 group-focus-within:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Find a place..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-white/5 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-white/20 focus:text-white sm:text-sm transition-all"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-1">
          <div className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 md:mb-3 px-3 md:px-4 mt-2">
            {filteredCameras.length} Locations
          </div>
          {filteredCameras.map((cam, idx) => (
            <button
              key={`${cam.id}-${idx}`}
              onClick={() => {
                onSelectCamera(cam);
                onClose();
              }}
              className={`w-full text-left p-3 md:p-4 rounded-xl md:rounded-2xl transition-all group relative overflow-hidden flex items-center gap-3 md:gap-4 ${selectedCameraId === cam.id ? 'bg-white/10' : 'hover:bg-white/5'}`}
            >
              <div className="w-32 h-20 rounded-xl bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                {cam.thumbnail ? (
                  <img
                    alt={cam.name}
                    className="w-full h-full object-cover"
                    src={cam.thumbnail}
                    loading="lazy"
                  />
                ) : cam.youtubeId ? (
                  <img
                    alt={cam.name}
                    className="w-full h-full object-cover"
                    src={`https://img.youtube.com/vi/${cam.youtubeId}/mqdefault.jpg`}
                    loading="lazy"
                  />
                ) : (
                  <div className="flex items-center justify-center text-white/20">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-medium ${selectedCameraId === cam.id ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>
                  {cam.name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 group-hover:text-gray-400 transition-colors">
                  {cam.location}
                </p>
              </div>
              {selectedCameraId === cam.id && (
                <div className="flex items-center gap-2 flex-shrink-0">
                   <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-green-500 rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-green-500 rounded-full animate-bounce delay-75"></div>
                      <div className="w-1 h-1 bg-green-500 rounded-full animate-bounce delay-150"></div>
                   </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
