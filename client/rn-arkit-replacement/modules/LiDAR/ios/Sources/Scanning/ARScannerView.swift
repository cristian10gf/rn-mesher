import UIKit
import ARKit
import RealityKit

final class ARScannerView: ARView {
    private let controller = LiDARSessionController()

    override init(frame frameRect: CGRect) {
        super.init(frame: frameRect)
        commonInit()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        commonInit()
    }

    private func commonInit() {
        self.session.delegate = self
        do {
            let config = try controller.makeConfiguration()
            self.session.run(config)
        } catch {
            // Placeholder: device may not support scene reconstruction in simulator
        }
    }
}

extension ARScannerView: ARSessionDelegate {
    func session(_ session: ARSession, didAdd anchors: [ARAnchor]) {
        // Placeholder: handle ARMeshAnchor events and forward to mesh sink
    }
}
