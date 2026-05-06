import Foundation
import simd

enum TextureProjector {
    static func accumulateColor(on vertex: inout ColoredVertex, rgb: SIMD3<Float>) {
        // Simple running average by observation count
        let n = Float(vertex.observations)
        if vertex.observations == 0 {
            vertex.color = rgb
        } else {
            vertex.color = (vertex.color * n + rgb) / (n + 1.0)
        }
        vertex.observations += 1
    }

    static func generatePlanarUVs(vertices: [SIMD3<Float>]) -> [SIMD2<Float>] {
        guard !vertices.isEmpty else {
            return []
        }

        var minX = vertices[0].x
        var maxX = vertices[0].x
        var minY = vertices[0].y
        var maxY = vertices[0].y
        var minZ = vertices[0].z
        var maxZ = vertices[0].z

        for vertex in vertices {
            minX = Swift.min(minX, vertex.x)
            maxX = Swift.max(maxX, vertex.x)
            minY = Swift.min(minY, vertex.y)
            maxY = Swift.max(maxY, vertex.y)
            minZ = Swift.min(minZ, vertex.z)
            maxZ = Swift.max(maxZ, vertex.z)
        }

        let extentX = maxX - minX
        let extentY = maxY - minY
        let extentZ = maxZ - minZ

        // Pick the dominant plane based on bounding-box extents.
        // This yields less stretched UVs than forcing XZ for all scenes.
        enum ProjectionPlane {
            case xy
            case xz
            case yz
        }

        let plane: ProjectionPlane
        if extentX <= extentY && extentX <= extentZ {
            plane = .yz
        } else if extentY <= extentX && extentY <= extentZ {
            plane = .xz
        } else {
            plane = .xy
        }

        let eps: Float = 0.0001
        let width: Float
        let height: Float

        switch plane {
        case .xy:
            width = max(extentX, eps)
            height = max(extentY, eps)
            return vertices.map { vertex in
                let u = (vertex.x - minX) / width
                let v = (vertex.y - minY) / height
                return SIMD2<Float>(clamp01(u), clamp01(v))
            }
        case .xz:
            width = max(extentX, eps)
            height = max(extentZ, eps)
            return vertices.map { vertex in
                let u = (vertex.x - minX) / width
                let v = (vertex.z - minZ) / height
                return SIMD2<Float>(clamp01(u), clamp01(v))
            }
        case .yz:
            width = max(extentY, eps)
            height = max(extentZ, eps)
            return vertices.map { vertex in
                let u = (vertex.y - minY) / width
                let v = (vertex.z - minZ) / height
                return SIMD2<Float>(clamp01(u), clamp01(v))
            }
        }
    }

    static func defaultTexturePNGData() -> Data {
        // 1x1 PNG (white pixel) for deterministic MVP exports.
        let base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO5Xf2sAAAAASUVORK5CYII="
        return Data(base64Encoded: base64) ?? Data()
    }

    private static func clamp01(_ value: Float) -> Float {
        return min(max(value, 0.0), 1.0)
    }
}
