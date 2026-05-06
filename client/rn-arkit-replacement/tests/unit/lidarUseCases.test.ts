import type { LiDARRepository } from '../../src/features/lidar/domain/LiDARRepository';
import { createLiDARUseCases } from '../../src/features/lidar/domain/usecases';

describe('LiDAR use cases', () => {
  it('delegates start/stop/export to repository', async () => {
    const repo: LiDARRepository = {
      startScan: jest.fn().mockResolvedValue(undefined),
      stopScan: jest.fn().mockResolvedValue(undefined),
      exportMesh: jest.fn().mockResolvedValue({
        objPath: '/tmp/scan.obj',
        mtlPath: '/tmp/scan.mtl',
        texturePath: '/tmp/texture.png',
        vertexCount: 3,
        faceCount: 1,
        timestamp: '2026-05-05T19:00:00.000Z',
      }),
      subscribe: jest.fn(() => () => undefined),
    };

    const useCases = createLiDARUseCases(repo);

    await useCases.start();
    await useCases.stop();
    const out = await useCases.exportMesh();

    expect(repo.startScan).toHaveBeenCalledWith({
      qualityPreset: 'balanced',
      environmentMode: 'auto',
    });
    expect(repo.stopScan).toHaveBeenCalledTimes(1);
    expect(repo.exportMesh).toHaveBeenCalledTimes(1);
    expect(out.objPath).toContain('scan.obj');
  });
});
