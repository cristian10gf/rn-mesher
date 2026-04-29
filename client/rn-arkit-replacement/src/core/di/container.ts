import type { DIContainer } from './tokens';
import { LiDARRepositoryImpl } from '../../features/lidar/data/LiDARRepositoryImpl';

export function createContainer(): DIContainer {
  return {
    lidarRepository: new LiDARRepositoryImpl(),
  };
}
