import type { ScanPhase } from '../domain/types';

const labels: Record<ScanPhase, string> = {
  idle: 'Inactivo',
  scanning: 'Escaneando',
  exporting: 'Exportando',
  exported: 'Listo',
  error: 'Error',
};

export function scanPhaseLabel(phase: ScanPhase): string {
  return labels[phase] ?? phase;
}
