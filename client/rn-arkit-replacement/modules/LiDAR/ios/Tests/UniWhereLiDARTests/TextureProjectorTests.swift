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
}
