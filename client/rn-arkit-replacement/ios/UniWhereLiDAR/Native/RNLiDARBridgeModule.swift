import Foundation
import React

@objc(RNLiDARBridgeModule)
final class RNLiDARBridgeModule: NSObject {

    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }

    @objc
    func startScan(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        // Placeholder: start native ARKit scanning
        resolve(nil)
    }

    @objc
    func stopScan(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        // Placeholder: stop scanning and prepare export
        resolve(nil)
    }

    @objc
    func exportMesh(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        // Placeholder: return empty paths
        let result: [String: String] = ["plyPath": "", "objPath": ""]
        resolve(result)
    }
}
