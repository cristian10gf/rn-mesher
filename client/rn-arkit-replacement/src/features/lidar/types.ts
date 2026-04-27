export type ScanPhase = 'idle' | 'scanning' | 'exporting' | 'exported' | 'error';

export interface MeshOutput {
  plyPath: string;
  objPath: string;
  mtlPath?: string;
  texturePath?: string;
}

export interface ScanState {
  phase: ScanPhase;
  output?: MeshOutput;
  error?: string;
}
