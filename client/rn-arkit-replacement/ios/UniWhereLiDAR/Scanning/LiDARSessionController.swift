import Foundation
import ARKit

enum LiDARSessionError: Error, Equatable {
    case unsupportedDevice
    case emptyMesh
}

final class LiDARSessionController: NSObject {
    private let session: ARSession
    private let reconstructor: MeshReconstructor
    private let exporter: MeshExporter
    private let meshQueue = DispatchQueue(label: "com.uniwhere.lidar.mesh", qos: .userInitiated)

    init(
        session: ARSession = ARSession(),
        reconstructor: MeshReconstructor = MeshReconstructor(),
        exporter: MeshExporter = MeshExporter()
    ) {
        self.session = session
        self.reconstructor = reconstructor
        self.exporter = exporter
        super.init()
        self.session.delegate = self
    }

    func makeConfiguration() throws -> ARWorldTrackingConfiguration {
        guard ARWorldTrackingConfiguration.supportsSceneReconstruction(.mesh) else {
            throw LiDARSessionError.unsupportedDevice
        }

        let config = ARWorldTrackingConfiguration()
        if ARWorldTrackingConfiguration.supportsSceneReconstruction(.meshWithClassification) {
            config.sceneReconstruction = .meshWithClassification
        } else {
            config.sceneReconstruction = .mesh
        }
        if ARWorldTrackingConfiguration.supportsFrameSemantics(.sceneDepth) {
            config.frameSemantics.insert(.sceneDepth)
        }
        config.environmentTexturing = .automatic
        config.planeDetection = [.horizontal, .vertical]
        return config
    }

    func startScan(config: [String: Any] = [:], completion: @escaping (Result<Void, Error>) -> Void) {
        do {
            let configuration = try makeConfiguration()
            meshQueue.sync {
                reconstructor.reset()
            }
            session.run(configuration, options: [.resetTracking, .removeExistingAnchors])
            completion(.success(()))
        } catch {
            completion(.failure(error))
        }
    }

    func stopScan(completion: @escaping (Result<Void, Error>) -> Void) {
        session.pause()
        completion(.success(()))
    }

    func exportCurrentMesh(folderName: String? = nil) throws -> MeshExportResult {
        let mesh = meshQueue.sync {
            reconstructor.buildMesh()
        }
        guard !mesh.vertices.isEmpty, !mesh.faces.isEmpty else {
            throw LiDARSessionError.emptyMesh
        }
        return try exporter.export(mesh: mesh, folderName: folderName)
    }
}

extension LiDARSessionController: ARSessionDelegate {
    func session(_ session: ARSession, didAdd anchors: [ARAnchor]) {
        consumeMeshAnchors(anchors)
    }

    func session(_ session: ARSession, didUpdate anchors: [ARAnchor]) {
        consumeMeshAnchors(anchors)
    }

    func session(_ session: ARSession, didRemove anchors: [ARAnchor]) {
        meshQueue.async { [weak self] in
            guard let self else { return }
            for anchor in anchors {
                self.reconstructor.remove(anchorID: anchor.identifier)
            }
        }
    }

    private func consumeMeshAnchors(_ anchors: [ARAnchor]) {
        meshQueue.async { [weak self] in
            guard let self else { return }
            for anchor in anchors {
                guard let meshAnchor = anchor as? ARMeshAnchor else {
                    continue
                }
                self.reconstructor.consume(anchor: meshAnchor)
            }
        }
    }
}
