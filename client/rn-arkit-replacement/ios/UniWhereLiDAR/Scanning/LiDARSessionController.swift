import Foundation
import ARKit

enum LiDARSessionError: Error {
    case unsupportedDevice
}

final class LiDARSessionController {
    func makeConfiguration() throws -> ARWorldTrackingConfiguration {
        guard ARWorldTrackingConfiguration.supportsSceneReconstruction(.mesh) else {
            throw LiDARSessionError.unsupportedDevice
        }

        let config = ARWorldTrackingConfiguration()
        config.frameSemantics = .sceneDepth
        config.sceneReconstruction = .mesh
        config.planeDetection = [.horizontal, .vertical]
        return config
    }
}
