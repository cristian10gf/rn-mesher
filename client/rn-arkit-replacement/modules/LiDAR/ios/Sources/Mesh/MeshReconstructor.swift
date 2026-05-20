import Foundation
import simd

struct ColoredVertex {
    var position: SIMD3<Float>
    var normal: SIMD3<Float>
    var color: SIMD3<Float> = SIMD3<Float>(0,0,0)
    var observations: Int = 0
}

struct MeshSnapshot {
    var vertices: [ColoredVertex]
    var indices: [UInt32]
}

final class MeshReconstructor {
    private let voxelSize: Float
    private var vertices: [ColoredVertex] = []
    private var voxelMap: [SIMD3<Int32>: UInt32] = [:]
    private var indices: [UInt32] = []

    init(voxelSize: Float) {
        self.voxelSize = voxelSize
    }

    private func voxelKey(for p: SIMD3<Float>) -> SIMD3<Int32> {
        SIMD3<Int32>(Int32(floor(p.x / voxelSize)), Int32(floor(p.y / voxelSize)), Int32(floor(p.z / voxelSize)))
    }

    func ingest(vertices input: [SIMD3<Float>], indices inputIndices: [UInt32], normals: [SIMD3<Float>]? = nil) {
        vertices.removeAll(keepingCapacity: true)
        voxelMap.removeAll(keepingCapacity: true)
        var remap: [UInt32: UInt32] = [:]

        // Deduplicate vertices by voxel
        for (i, p) in input.enumerated() {
            let key = voxelKey(for: p)
            if let existing = voxelMap[key] {
                remap[UInt32(i)] = existing
            } else {
                let normal = normals?[i] ?? SIMD3<Float>(0, 1, 0)
                let cv = ColoredVertex(position: p, normal: normal)
                let newIndex = UInt32(vertices.count)
                vertices.append(cv)
                voxelMap[key] = newIndex
                remap[UInt32(i)] = newIndex
            }
        }

        // Rebuild indices using remap
        var newIndices: [UInt32] = []
        for idx in inputIndices {
            if let n = remap[idx] {
                newIndices.append(n)
            }
        }

        self.indices = newIndices
    }

    func snapshot() -> MeshSnapshot {
        MeshSnapshot(vertices: vertices, indices: indices)
    }
}
