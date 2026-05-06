import type { ScanPhase } from '../domain/types';

const labels: Record<ScanPhase, string> = {
  idle: 'Inactivo',
  initializing: 'Inicializando',
  scanning: 'Escaneando',
  stopping: 'Deteniendo',
  stopped: 'Detenido',
  exporting: 'Exportando',
  exported: 'Exportado',
  error: 'Error',
};

export function scanPhaseLabel(phase: ScanPhase): string {
  return labels[phase] ?? phase;
}
