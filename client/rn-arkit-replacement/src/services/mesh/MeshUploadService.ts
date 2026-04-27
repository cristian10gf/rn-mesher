import type { MeshOutput } from '../features/lidar/types';

export async function uploadMeshArtifacts(output: MeshOutput): Promise<void> {
  // Placeholder uploader: in production replace with signed URL uploads
  // For now just log and resolve
  // eslint-disable-next-line no-console
  console.log('uploadMeshArtifacts called with', output);
  return Promise.resolve();
}
