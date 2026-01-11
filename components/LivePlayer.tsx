import React from 'react';
import { Camera } from '../types';

interface LivePlayerProps {
  camera: Camera;
  onLoaded?: () => void;
}

const LivePlayer: React.FC<LivePlayerProps> = ({ camera, onLoaded }) => {
  const handleLoad = () => {
    onLoaded?.();
  };

  if (camera.source === 'windy' && camera.windyPlayerUrl) {
    return (
      <iframe
        src={camera.windyPlayerUrl}
        title={camera.name}
        className="w-full h-full object-cover"
        frameBorder="0"
        allow="autoplay; fullscreen"
        allowFullScreen
        onLoad={handleLoad}
      />
    );
  }

  if (camera.source === 'youtube' && camera.youtubeId) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${camera.youtubeId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1`}
        title={camera.name}
        className="w-full h-full object-cover"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={handleLoad}
      />
    );
  }

  return null;
};

export default LivePlayer;
