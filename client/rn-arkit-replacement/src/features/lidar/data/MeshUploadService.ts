import type { MeshOutput } from '../domain/types';

export async function uploadMeshArtifacts(output: MeshOutput): Promise<void> {
  // Placeholder uploader: in production replace with signed URL uploads.
  // eslint-disable-next-line no-console
  console.log('uploadMeshArtifacts called with', output);
  return Promise.resolve();
}
