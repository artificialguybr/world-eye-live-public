export interface Camera {
  id: string;
  name: string;
  location: string;
  description: string;
  youtubeId?: string;
  thumbnail?: string;
  category: CameraCategory;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export enum CameraCategory {
  CITY = 'City',
  NATURE = 'Nature',
  TRAFFIC = 'Traffic',
  SPACE = 'Space',
  BEACH = 'Beach',
  ANIMAL = 'Animal',
  LIVE = 'Live'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isThinking?: boolean;
}
