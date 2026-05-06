import XCTest
@testable import UniWhereLiDAR
import ARKit

final class LiDARSessionControllerTests: XCTestCase {
    func test_makeConfiguration_enablesSceneReconstructionMesh() throws {
        let sut = LiDARSessionController()
        let config = try sut.makeConfiguration()
        XCTAssertTrue(config.sceneReconstruction == .mesh || config.sceneReconstruction == .meshWithClassification)
        if ARWorldTrackingConfiguration.supportsFrameSemantics(.sceneDepth) {
            XCTAssertTrue(config.frameSemantics.contains(.sceneDepth))
        }
    }

    func test_scannerView_setsARSessionDelegate() {
        let sut = ARScannerView(frame: .zero)
        XCTAssertTrue((sut.session.delegate as AnyObject) === sut)
    }
}
