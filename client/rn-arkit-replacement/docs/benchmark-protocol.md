# Benchmark Protocol (ARKit vs MultiSet)

## Acceptance thresholds for "comparable":
- geometry_completeness_ratio >= 0.90 (candidate vs MultiSet baseline)
- colored_vertex_ratio >= 0.85
- mean_reprojection_error <= 3.0

## Capture protocol:
1. Capturar la misma zona con MultiSet y con la app ARKit RN.
2. Exportar ambos meshes a PLY/OBJ.
3. Ejecutar `compare_meshes.py` y guardar el reporte JSON.
4. Aprobar reemplazo solo si los 3 thresholds pasan.

## Notes
- Ensure consistent device pose and lighting when capturing for fair color comparison.
- Use `scan.ply` with vertex colors when possible.
