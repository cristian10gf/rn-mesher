import XCTest
@testable import UniWhereLiDAR
import simd

final class TextureProjectorTests: XCTestCase {
    func test_projectColor_accumulatesObservationCount() {
        var vertex = ColoredVertex(position: SIMD3<Float>(0,0,0), normal: SIMD3<Float>(0,1,0))
        XCTAssertEqual(vertex.observations, 0)

        TextureProjector.accumulateColor(on: &vertex, rgb: SIMD3<Float>(1.0, 0.0, 0.0))
        XCTAssertEqual(vertex.observations, 1)
        XCTAssertGreaterThan(vertex.color.x, 0)

        TextureProjector.accumulateColor(on: &vertex, rgb: SIMD3<Float>(0.0, 1.0, 0.0))
        XCTAssertEqual(vertex.observations, 2)
        // color should be between the two observations
        XCTAssertGreaterThan(vertex.color.x, 0)
        XCTAssertGreaterThan(vertex.color.y, 0)
    }

    func test_generatePlanarUVs_returnsOnePerVertexInUnitRange() {
        let vertices = [
            SIMD3<Float>(0, 0, 0),
            SIMD3<Float>(2, 0, 0),
            SIMD3<Float>(0, 0, 4),
        ]

        let uvs = TextureProjector.generatePlanarUVs(vertices: vertices)
        XCTAssertEqual(uvs.count, vertices.count)
        XCTAssertEqual(uvs[0].x, 0, accuracy: 0.0001)
        XCTAssertEqual(uvs[0].y, 0, accuracy: 0.0001)
        XCTAssertEqual(uvs[1].x, 1, accuracy: 0.0001)
        XCTAssertEqual(uvs[2].y, 1, accuracy: 0.0001)
    }

    func test_defaultTexturePNGData_hasPngSignature() {
        let data = TextureProjector.defaultTexturePNGData()
        let expectedHeader: [UInt8] = [0x89, 0x50, 0x4E, 0x47]

        XCTAssertGreaterThan(data.count, 8)
        XCTAssertEqual(Array(data.prefix(4)), expectedHeader)
    }
}
