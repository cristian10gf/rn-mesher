import XCTest
@testable import UniWhereLiDAR

final class MeshExporterTests: XCTestCase {
    func test_writePLY_includesHeaderAndFaceCount() throws {
        let sut = MeshExporter()

        // Build a tiny mesh: 3 vertices, 1 face (indices repeated to match expected test)
        let v0 = ColoredVertex(position: SIMD3<Float>(0,0,0), normal: SIMD3<Float>(0,1,0))
        let v1 = ColoredVertex(position: SIMD3<Float>(1,0,0), normal: SIMD3<Float>(0,1,0))
        let v2 = ColoredVertex(position: SIMD3<Float>(0,1,0), normal: SIMD3<Float>(0,1,0))
        var mesh = MeshSnapshot(vertices: [v0, v1, v2], indices: [0, 0, 0])

        let text = try sut.plyString(from: mesh)
        XCTAssertTrue(text.contains("element face 1"))
        XCTAssertTrue(text.contains("3 0 0 0"))
    }

    func test_writeOBJ_referencesMTLAndTexture() throws {
        let sut = MeshExporter()
        let files = sut.exportBundlePaths(baseName: "scan")
        XCTAssertTrue(files.texturePath.hasSuffix("texture.png") || files.texturePath.hasSuffix("_texture.png"))
        XCTAssertTrue(files.mtlPath.hasSuffix(".mtl"))
    }
}
