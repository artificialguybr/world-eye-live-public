import { Camera, CameraCategory } from './types';
import camerasRaw from './data/cameras.json';

export const CAMERAS: Camera[] = (camerasRaw as Omit<Camera, 'category'>[]).map(cam => ({
  ...cam,
  category: CameraCategory.LIVE
}));
