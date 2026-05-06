import XCTest
@testable import UniWhereLiDAR
import simd

final class MeshReconstructorTests: XCTestCase {
    func test_buildMesh_aggregatesChunksInWorldSpace() {
        let sut = MeshReconstructor()

        let chunkA = MeshChunk(
            vertices: [
                SIMD3<Float>(0, 0, 0),
                SIMD3<Float>(1, 0, 0),
                SIMD3<Float>(0, 1, 0),
            ],
            faces: [SIMD3<UInt32>(0, 1, 2)],
            normals: Array(repeating: SIMD3<Float>(0, 1, 0), count: 3)
        )
        let chunkB = MeshChunk(
            vertices: [
                SIMD3<Float>(0, 0, 0),
                SIMD3<Float>(1, 0, 0),
                SIMD3<Float>(0, 1, 0),
            ],
            faces: [SIMD3<UInt32>(0, 1, 2)],
            normals: Array(repeating: SIMD3<Float>(0, 1, 0), count: 3)
        )

        sut.consume(chunk: chunkA, transform: matrix_identity_float4x4, anchorID: UUID(uuidString: "00000000-0000-0000-0000-000000000001")!)

        var translated = matrix_identity_float4x4
        translated.columns.3 = SIMD4<Float>(1, 0, 0, 1)
        sut.consume(chunk: chunkB, transform: translated, anchorID: UUID(uuidString: "00000000-0000-0000-0000-000000000002")!)

        let mesh = sut.buildMesh()
        XCTAssertEqual(mesh.vertices.count, 6)
        XCTAssertEqual(mesh.faces.count, 2)

        // Second chunk first vertex should be translated +1 on X.
        XCTAssertEqual(mesh.vertices[3].x, 1, accuracy: 0.0001)
        XCTAssertEqual(mesh.vertices[3].y, 0, accuracy: 0.0001)
        XCTAssertEqual(mesh.vertices[3].z, 0, accuracy: 0.0001)

        // Face indices for second chunk must be offset by first chunk vertex count.
        XCTAssertEqual(mesh.faces[1], SIMD3<UInt32>(3, 4, 5))
    }
}
