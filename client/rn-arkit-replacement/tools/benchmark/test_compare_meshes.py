from compare_meshes import compute_metrics, write_tetra_ply
from pathlib import Path


def test_identical_meshes_have_perfect_colored_ratio(tmp_path):
    a = tmp_path / 'a.ply'
    b = tmp_path / 'b.ply'
    write_tetra_ply(a, colored=True)
    write_tetra_ply(b, colored=True)

    report = compute_metrics(str(a), str(b))
    assert report['colored_vertex_ratio'] == 1.0
    assert report['geometry_completeness_ratio'] == 1.0
