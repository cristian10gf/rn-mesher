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
}
