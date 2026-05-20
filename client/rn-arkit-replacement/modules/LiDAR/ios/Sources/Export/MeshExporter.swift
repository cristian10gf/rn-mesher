import Foundation

struct MeshExportFiles {
    let plyPath: String
    let objPath: String
    let mtlPath: String
    let texturePath: String
}

final class MeshExporter {
    func plyString(from mesh: MeshSnapshot) throws -> String {
        var lines: [String] = []
        lines.append("ply")
        lines.append("format ascii 1.0")
        lines.append("element vertex \(mesh.vertices.count)")
        lines.append("property float x")
        lines.append("property float y")
        lines.append("property float z")
        lines.append("property uchar red")
        lines.append("property uchar green")
        lines.append("property uchar blue")
        let faceCount = mesh.indices.count / 3
        lines.append("element face \(faceCount)")
        lines.append("property list uchar int vertex_indices")
        lines.append("end_header")

        for v in mesh.vertices {
            let x = v.position.x
            let y = v.position.y
            let z = v.position.z
            // convert color float [0,1] to 0-255
            let r = UInt8(min(max(Int(round(Double(v.color.x * 255.0))), 0), 255))
            let g = UInt8(min(max(Int(round(Double(v.color.y * 255.0))), 0), 255))
            let b = UInt8(min(max(Int(round(Double(v.color.z * 255.0))), 0), 255))
            lines.append("\(x) \(y) \(z) \(r) \(g) \(b)")
        }

        // write faces as "3 i j k"
        var i = 0
        while i + 2 < mesh.indices.count {
            let a = mesh.indices[i]
            let b = mesh.indices[i+1]
            let c = mesh.indices[i+2]
            lines.append("3 \(a) \(b) \(c)")
            i += 3
        }

        return lines.joined(separator: "\n")
    }

    func exportBundlePaths(baseName: String) -> MeshExportFiles {
        let ply = baseName + ".ply"
        let obj = baseName + ".obj"
        let mtl = baseName + ".mtl"
        let tex = baseName + "_texture.png"
        return MeshExportFiles(plyPath: ply, objPath: obj, mtlPath: mtl, texturePath: tex)
    }
}
