import XCTest
@testable import UniWhereLiDAR
import simd

final class MeshExporterTests: XCTestCase {
    func test_exportWritesObjMtlTextureAndCounts() throws {
        let sut = MeshExporter()
        let folder = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString, isDirectory: true)
        defer {
            try? FileManager.default.removeItem(at: folder)
        }

        let mesh = ReconstructedMesh(
            vertices: [
                SIMD3<Float>(0, 0, 0),
                SIMD3<Float>(1, 0, 0),
                SIMD3<Float>(0, 1, 0),
            ],
            faces: [SIMD3<UInt32>(0, 1, 2)],
            normals: Array(repeating: SIMD3<Float>(0, 1, 0), count: 3)
        )
        let result = try sut.export(mesh: mesh, folderName: "test-export", baseDirectory: folder)

        XCTAssertTrue(FileManager.default.fileExists(atPath: result.objPath.path))
        XCTAssertTrue(FileManager.default.fileExists(atPath: result.mtlPath.path))
        XCTAssertTrue(FileManager.default.fileExists(atPath: result.texturePath.path))
        XCTAssertEqual(result.vertexCount, 3)
        XCTAssertEqual(result.faceCount, 1)
        XCTAssertFalse(result.timestamp.isEmpty)
    }

    func test_exportFiltersDegenerateFacesFromObjOutput() throws {
        let sut = MeshExporter()
        let folder = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString, isDirectory: true)
        defer {
            try? FileManager.default.removeItem(at: folder)
        }

        let mesh = ReconstructedMesh(
            vertices: [
                SIMD3<Float>(0, 0, 0),
                SIMD3<Float>(1, 0, 0),
                SIMD3<Float>(0, 1, 0),
            ],
            faces: [
                SIMD3<UInt32>(0, 1, 2),
                SIMD3<UInt32>(0, 0, 2), // degenerate face
            ],
            normals: Array(repeating: SIMD3<Float>(0, 1, 0), count: 3)
        )

        let result = try sut.export(mesh: mesh, folderName: "test-filter", baseDirectory: folder)
        XCTAssertEqual(result.faceCount, 1)
    }
}
