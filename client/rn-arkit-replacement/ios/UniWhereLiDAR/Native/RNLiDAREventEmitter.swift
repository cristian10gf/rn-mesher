import Foundation
import React

@objc(RNLiDAREventEmitter)
final class RNLiDAREventEmitter: RCTEventEmitter {

    override func supportedEvents() -> [String]! {
        return ["onMeshUpdate"]
    }

    @objc
    func sendMeshUpdate(_ data: [String: Any]) {
        sendEvent(withName: "onMeshUpdate", body: data)
    }

    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
