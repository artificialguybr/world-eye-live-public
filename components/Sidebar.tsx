import React, { useMemo, useState } from 'react';
import { CAMERAS } from '../constants';
import { Camera } from '../types';

interface SidebarProps {
  selectedCameraId: string;
  onSelectCamera: (cam: Camera) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedCameraId, onSelectCamera, isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCameras = useMemo(() => {
    return CAMERAS.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [searchQuery]);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-50 w-full md:w-[400px] glass-heavy border-r border-white/10
          transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="p-8 pb-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-light tracking-tight text-white">Explore</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <svg className="w-6 h-6 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search */}
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

          {/* List */}
          <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-1">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4 mt-2">
            {filteredCameras.length} Locations
          </div>
          
          {filteredCameras.map((cam, idx) => (
            <button
              key={`${cam.id}-${idx}`}
              onClick={() => {
                onSelectCamera(cam);
                onClose();
              }}
              className={`
                w-full text-left p-4 rounded-2xl transition-all group relative overflow-hidden flex items-center gap-4
                ${selectedCameraId === cam.id ? 'bg-white/10' : 'hover:bg-white/5'}
              `}
            >
              <div className="w-32 h-20 rounded-xl bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                <iframe
                  title={cam.name}
                  className="w-full h-full object-cover"
                  src={`https://img.youtube.com/vi/${cam.youtubeId}/mqdefault.jpg`}
                  loading="lazy"
                />
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
