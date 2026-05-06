import Foundation
import React

@objc(RNLiDARBridgeModule)
final class RNLiDARBridgeModule: NSObject {
    @objc weak var bridge: RCTBridge?
    private let sessionController = LiDARSessionController()

    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }

    @objc
    func startScan(_ config: Any?, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        let options = config as? [String: Any] ?? [:]
        sessionController.startScan(config: options) { [weak self] result in
            switch result {
            case .success:
                self?.emitEvent([
                    "type": "scan_started"
                ])
                resolve(nil)
            case .failure(let error):
                let code: String
                if case .some(.unsupportedDevice) = (error as? LiDARSessionError) {
                    code = "lidar_not_supported"
                } else {
                    code = "start_scan_failed"
                }
                self?.emitEvent([
                    "type": "error",
                    "payload": [
                        "code": code,
                        "message": error.localizedDescription
                    ]
                ])
                reject(code, error.localizedDescription, error)
            }
        }
    }

    @objc
    func stopScan(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        sessionController.stopScan { [weak self] result in
            switch result {
            case .success:
                self?.emitEvent([
                    "type": "scan_stopped"
                ])
                resolve(nil)
            case .failure(let error):
                self?.emitEvent([
                    "type": "error",
                    "payload": [
                        "code": "stop_scan_failed",
                        "message": error.localizedDescription
                    ]
                ])
                reject("stop_scan_failed", error.localizedDescription, error)
            }
        }
    }

    @objc
    func exportMesh(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        do {
            let result = try sessionController.exportCurrentMesh()
            let payload: [String: Any] = [
                "objPath": result.objPath.path,
                "mtlPath": result.mtlPath.path,
                "texturePath": result.texturePath.path,
                "vertexCount": result.vertexCount,
                "faceCount": result.faceCount,
                "timestamp": result.timestamp
            ]
            emitEvent([
                "type": "export_completed",
                "payload": payload
            ])
            resolve(payload)
        } catch {
            emitEvent([
                "type": "error",
                "payload": [
                    "code": "export_failed",
                    "message": error.localizedDescription
                ]
            ])
            reject("export_failed", error.localizedDescription, error)
        }
    }

    private func emitEvent(_ payload: [String: Any]) {
        guard let emitter = bridge?.module(for: RNLiDAREventEmitter.self) as? RNLiDAREventEmitter else {
            return
        }
        emitter.sendMeshUpdate(payload)
    }
}
