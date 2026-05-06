# Migration Runbook (Replace MultiSet with ARKit RN)

1. Build the iOS app and validate LiDAR availability on test devices.
2. Run a full scan export (`scan.ply`, `scan.obj`, `scan.mtl`, `texture.png`).
3. Run the benchmark comparing ARKit output against MultiSet baseline using `compare_meshes.py`.
4. If the report meets thresholds, enable the new capture route for a pilot group.
5. Keep the baseline MultiSet path available for at least 2 sprints as a rollback.

## Rollout checklist

- Devices: list of test devices with LiDAR
- Exports verified: sample `scan.ply` checked for non-empty vertices/faces
- Benchmarks: store JSON reports per capture for audit

## MVP acceptance checklist (iOS16+ LiDAR)

- Start scan on LiDAR device without crash
- Stop scan and export local artifacts
- Validate exported files exist: `scan.obj`, `scan.mtl`, `texture.png`
- Confirm export screen shows local paths and mesh counts
- Execute one indoor and one outdoor capture end-to-end
