import XCTest
@testable import UniWhereLiDAR
import simd

final class MeshReconstructorTests: XCTestCase {
    func test_mergeVertices_deduplicatesByVoxel() {
        let sut = MeshReconstructor(voxelSize: 0.05)

        // Two vertices very close -> same voxel
        let v0 = SIMD3<Float>(0.0, 0.0, 0.0)
        let v1 = SIMD3<Float>(0.01, 0.0, 0.0)
        let v2 = SIMD3<Float>(0.2, 0.0, 0.0)

        let input = [v0, v1, v2]
        // indices for a single triangle using original indices 0,1,2
        let inputIndices: [UInt32] = [0, 1, 2]

        sut.ingest(vertices: input, indices: inputIndices)
        let mesh = sut.snapshot()

        // Expect v0 and v1 merged -> 2 vertices
        XCTAssertEqual(mesh.vertices.count, 2)
        // indices should reference remapped indices length 3
        XCTAssertEqual(mesh.indices.count, 3)
    }
}
