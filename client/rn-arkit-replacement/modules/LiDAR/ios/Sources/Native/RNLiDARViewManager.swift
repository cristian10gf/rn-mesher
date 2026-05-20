import Foundation
import UIKit
import React

@objc(RNLiDARViewManager)
final class RNLiDARViewManager: RCTViewManager {
    override func view() -> UIView! {
        // Placeholder native view for LiDAR preview
        let v = UIView(frame: .zero)
        v.backgroundColor = .black
        return v
    }

    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
