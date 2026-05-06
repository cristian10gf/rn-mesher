import Foundation
import simd

struct MeshExportResult {
    let objPath: URL
    let mtlPath: URL
    let texturePath: URL
    let vertexCount: Int
    let faceCount: Int
    let timestamp: String
}

enum MeshExportError: Error {
    case emptyMesh
    case invalidTextureData
}

final class MeshExporter {
    func export(mesh: ReconstructedMesh, folderName: String? = nil, baseDirectory: URL? = nil) throws -> MeshExportResult {
        guard !mesh.vertices.isEmpty, !mesh.faces.isEmpty else {
            throw MeshExportError.emptyMesh
        }

        let exportableFaces = mesh.faces.filter { isFaceExportable($0, vertices: mesh.vertices) }
        guard !exportableFaces.isEmpty else {
            throw MeshExportError.emptyMesh
        }

        let timestamp = ISO8601DateFormatter().string(from: Date())
        let root = baseDirectory ?? defaultScansRoot()
        let exportFolder = root.appendingPathComponent(folderName ?? timestamp, isDirectory: true)
        try FileManager.default.createDirectory(at: exportFolder, withIntermediateDirectories: true, attributes: nil)

        let textureURL = exportFolder.appendingPathComponent("texture.png")
        let mtlURL = exportFolder.appendingPathComponent("scan.mtl")
        let objURL = exportFolder.appendingPathComponent("scan.obj")

        let pngData = TextureProjector.defaultTexturePNGData()
        guard !pngData.isEmpty else {
            throw MeshExportError.invalidTextureData
        }
        try pngData.write(to: textureURL, options: .atomic)

        let mtl = mtlString(textureFileName: textureURL.lastPathComponent)
        try mtl.write(to: mtlURL, atomically: true, encoding: .utf8)

        let obj = objString(mesh: mesh, faces: exportableFaces, mtlFileName: mtlURL.lastPathComponent)
        try obj.write(to: objURL, atomically: true, encoding: .utf8)

        return MeshExportResult(
            objPath: objURL,
            mtlPath: mtlURL,
            texturePath: textureURL,
            vertexCount: mesh.vertices.count,
            faceCount: exportableFaces.count,
            timestamp: timestamp
        )
    }

    private func mtlString(textureFileName: String) -> String {
        return [
            "newmtl material0",
            "Ka 1.000 1.000 1.000",
            "Kd 1.000 1.000 1.000",
            "Ks 0.000 0.000 0.000",
            "d 1.0",
            "illum 2",
            "map_Kd \(textureFileName)"
        ].joined(separator: "\n")
    }

    private func objString(mesh: ReconstructedMesh, faces: [SIMD3<UInt32>], mtlFileName: String) -> String {
        let uvs = TextureProjector.generatePlanarUVs(vertices: mesh.vertices)
        let normals: [SIMD3<Float>] = mesh.normals.count == mesh.vertices.count
            ? mesh.normals
            : Array(repeating: SIMD3<Float>(0, 1, 0), count: mesh.vertices.count)

        var lines: [String] = []
        lines.append("mtllib \(mtlFileName)")
        lines.append("o scan")

        for vertex in mesh.vertices {
            lines.append("v \(vertex.x) \(vertex.y) \(vertex.z)")
        }
        for uv in uvs {
            lines.append("vt \(uv.x) \(uv.y)")
        }
        for normal in normals {
            lines.append("vn \(normal.x) \(normal.y) \(normal.z)")
        }

        lines.append("usemtl material0")
        for face in faces {
            let a = Int(face.x) + 1
            let b = Int(face.y) + 1
            let c = Int(face.z) + 1
            lines.append("f \(a)/\(a)/\(a) \(b)/\(b)/\(b) \(c)/\(c)/\(c)")
        }

        return lines.joined(separator: "\n")
    }

    private func defaultScansRoot() -> URL {
        if let documents = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first {
            return documents.appendingPathComponent("Scans", isDirectory: true)
        }
        return FileManager.default.temporaryDirectory.appendingPathComponent("Scans", isDirectory: true)
    }

    private func isFaceExportable(_ face: SIMD3<UInt32>, vertices: [SIMD3<Float>]) -> Bool {
        let a = Int(face.x)
        let b = Int(face.y)
        let c = Int(face.z)
        if a == b || b == c || a == c {
            return false
        }
        guard vertices.indices.contains(a), vertices.indices.contains(b), vertices.indices.contains(c) else {
            return false
        }

        let p0 = vertices[a]
        let p1 = vertices[b]
        let p2 = vertices[c]
        let areaVector = simd_cross(p1 - p0, p2 - p0)
        let area2 = simd_length(areaVector)
        return area2 > 1e-8
    }
}
