from __future__ import annotations

import json
from pathlib import Path
from typing import Dict

import numpy as np
import trimesh


def _mean_abs_vertex_distance(reference: trimesh.Trimesh, candidate: trimesh.Trimesh) -> float:
    ref_v = np.asarray(reference.vertices)
    cand_v = np.asarray(candidate.vertices)
    if len(ref_v) == 0 or len(cand_v) == 0:
        return float('inf')
    n = min(len(ref_v), len(cand_v))
    # assume corresponded ordering for simplicity; for real usage use nearest-neighbor
    dists = np.linalg.norm(ref_v[:n] - cand_v[:n], axis=1)
    return float(np.abs(dists).mean())


def _colored_vertex_ratio(mesh: trimesh.Trimesh) -> float:
    # Check for vertex colors (trimesh stores as visual.vertex_colors)
    rgb = getattr(mesh.visual, 'vertex_colors', None)
    if rgb is None:
        return 0.0
    rgb = np.asarray(rgb)
    if rgb.size == 0:
        return 0.0
    # rgb may include alpha; consider first three channels
    if rgb.ndim == 2 and rgb.shape[1] >= 3:
        cols = rgb[:, :3]
    else:
        return 0.0
    colored = np.any(cols != 0, axis=1).sum()
    return float(colored) / float(len(cols))


def compute_metrics(reference_mesh_path: str, candidate_mesh_path: str) -> Dict[str, float]:
    reference = trimesh.load(reference_mesh_path, force='mesh')
    candidate = trimesh.load(candidate_mesh_path, force='mesh')

    geometry_completeness_ratio = 0.0
    if len(reference.vertices) > 0:
        geometry_completeness_ratio = float(len(candidate.vertices)) / float(len(reference.vertices))

    mean_reprojection_error_px = _mean_abs_vertex_distance(reference, candidate)
    colored_vertex_ratio_ref = _colored_vertex_ratio(reference)
    colored_vertex_ratio_cand = _colored_vertex_ratio(candidate)

    report = {
        'geometry_completeness_ratio': float(geometry_completeness_ratio),
        'mean_reprojection_error': float(mean_reprojection_error_px),
        'colored_vertex_ratio': float(colored_vertex_ratio_cand),
        'colored_vertex_ratio_ref': float(colored_vertex_ratio_ref),
    }
    return report


def write_tetra_ply(path: Path, colored: bool = True) -> None:
    # Create a simple tetrahedron with 4 vertices and 4 triangular faces
    verts = [
        (0.0, 0.0, 0.0),
        (1.0, 0.0, 0.0),
        (0.0, 1.0, 0.0),
        (0.0, 0.0, 1.0),
    ]
    faces = [
        (0, 1, 2),
        (0, 1, 3),
        (0, 2, 3),
        (1, 2, 3),
    ]

    lines = []
    lines.append('ply')
    lines.append('format ascii 1.0')
    lines.append(f'element vertex {len(verts)}')
    lines.append('property float x')
    lines.append('property float y')
    lines.append('property float z')
    if colored:
        lines.append('property uchar red')
        lines.append('property uchar green')
        lines.append('property uchar blue')
    lines.append(f'element face {len(faces)}')
    lines.append('property list uchar int vertex_indices')
    lines.append('end_header')

    for v in verts:
        if colored:
            lines.append(f"{v[0]} {v[1]} {v[2]} 255 0 0")
        else:
            lines.append(f"{v[0]} {v[1]} {v[2]}")

    for f in faces:
        lines.append(f"3 {f[0]} {f[1]} {f[2]}")

    path.write_text("\n".join(lines), encoding='utf-8')


def main() -> None:
    import argparse

    p = argparse.ArgumentParser()
    p.add_argument('reference')
    p.add_argument('candidate')
    p.add_argument('--out', default='report.json')
    args = p.parse_args()

    report = compute_metrics(args.reference, args.candidate)
    Path(args.out).write_text(json.dumps(report, indent=2), encoding='utf-8')


if __name__ == '__main__':
    main()
