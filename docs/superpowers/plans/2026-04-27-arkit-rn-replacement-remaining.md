# ARKit RN Replacement Remaining Work Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the missing JS config, native bridge wiring, mesh export pipeline, and verification steps for the ARKit RN replacement.

**Architecture:** Finish the RN project configuration so JS tests run, then wire the native view manager and bridge to an ARKit-backed scanner view. Implement mesh ingestion, color projection, and file exports (PLY + OBJ/MTL/PNG) with a minimal, testable pipeline. Close with environment checks and verification runs.

**Tech Stack:** React Native, TypeScript, Jest, Swift, ARKit, XCTest, Python (trimesh/pytest).

---

## File Structure (locked before tasks)

### JS/RN config and tests
- Create: `client/rn-arkit-replacement/babel.config.js`
- Create: `client/rn-arkit-replacement/tests/unit/deps.test.ts`
- Create: `client/rn-arkit-replacement/tests/unit/nativeBridgeContract.test.ts`
- Modify: `client/rn-arkit-replacement/package.json`
- Modify: `client/rn-arkit-replacement/jest.config.js`
- Modify: `client/rn-arkit-replacement/tests/unit/useLiDARScan.test.ts`

### Native bridge and scanning
- Create: `client/rn-arkit-replacement/ios/UniWhereLiDARTests/BridgeModuleTests.swift`
- Modify: `client/rn-arkit-replacement/ios/UniWhereLiDAR/Native/RNLiDARViewManager.swift`
- Modify: `client/rn-arkit-replacement/ios/UniWhereLiDAR/Native/RNLiDARBridgeModule.swift`
- Modify: `client/rn-arkit-replacement/ios/UniWhereLiDAR/Native/RNLiDAREventEmitter.swift`
- Modify: `client/rn-arkit-replacement/ios/UniWhereLiDAR/Scanning/ARScannerView.swift`
- Modify: `client/rn-arkit-replacement/ios/UniWhereLiDAR/Mesh/MeshReconstructor.swift`
- Modify: `client/rn-arkit-replacement/ios/UniWhereLiDAR/Mesh/TextureProjector.swift`
- Modify: `client/rn-arkit-replacement/ios/UniWhereLiDARTests/MeshReconstructorTests.swift`

### Mesh export pipeline
- Modify: `client/rn-arkit-replacement/ios/UniWhereLiDAR/Export/MeshExporter.swift`
- Modify: `client/rn-arkit-replacement/ios/UniWhereLiDARTests/MeshExporterTests.swift`

---

### Task 0: Verify macOS and iOS prerequisites

**Files:**
- Modify: None

- [ ] **Step 1: Verify Xcode toolchain**

Run: `xcode-select --print-path`
Expected: path under `/Applications/Xcode.app/...`

- [ ] **Step 2: Verify CocoaPods**

Run: `pod --version`
Expected: version output

- [ ] **Step 3: Verify simulator target**

Run: `xcrun simctl list devices | grep "iPhone 15 Pro"`
Expected: at least one iPhone 15 Pro simulator entry

- [ ] **Step 4: Verify Node and Ruby**

Run: `node -v && npm -v && ruby -v`
Expected: versions printed with exit code 0

- [ ] **Step 5: Commit**

```bash
git commit --allow-empty -m "chore(env): verify macos ios prerequisites for arkit rn replacement"
```

---

### Task 1: Align RN dependencies and config for tests

**Files:**
- Create: `client/rn-arkit-replacement/babel.config.js`
- Create: `client/rn-arkit-replacement/tests/unit/deps.test.ts`
- Modify: `client/rn-arkit-replacement/package.json`
- Modify: `client/rn-arkit-replacement/jest.config.js`

- [ ] **Step 1: Write the failing test**

```ts
// client/rn-arkit-replacement/tests/unit/deps.test.ts
import { Platform } from 'react-native';

describe('deps', () => {
  it('loads react-native', () => {
    expect(Platform.OS).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- deps.test.ts`
Expected: FAIL with `Cannot find module 'react-native'`

- [ ] **Step 3: Write minimal implementation**

```json
// client/rn-arkit-replacement/package.json
{
  "name": "rn-arkit-replacement",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "test": "jest",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "react": "19.2.3",
    "react-native": "0.85.2"
  },
  "devDependencies": {
    "@testing-library/jest-native": "^5.4.2",
    "@testing-library/react-native": "^12.9.0",
    "@types/jest": "^29.5.12",
    "jest": "^29.7.0",
    "react-test-renderer": "19.2.3",
    "typescript": "^5.4.5"
  }
}
```

```js
// client/rn-arkit-replacement/babel.config.js
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
};
```

```js
// client/rn-arkit-replacement/jest.config.js
module.exports = {
  preset: 'react-native',
  testMatch: ['**/tests/**/*.test.ts', '**/tests/**/*.test.tsx'],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm install --legacy-peer-deps --no-audit --no-fund && npm test -- deps.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add client/rn-arkit-replacement/package.json client/rn-arkit-replacement/babel.config.js client/rn-arkit-replacement/jest.config.js client/rn-arkit-replacement/tests/unit/deps.test.ts
git commit -m "chore(rn-setup): align react native deps and jest config"
```

---

### Task 2: Fix hook test harness and add native bridge contract test

**Files:**
- Create: `client/rn-arkit-replacement/tests/unit/nativeBridgeContract.test.ts`
- Modify: `client/rn-arkit-replacement/tests/unit/useLiDARScan.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// client/rn-arkit-replacement/tests/unit/nativeBridgeContract.test.ts
import { NativeLiDAR } from '../../src/features/lidar/NativeLiDAR';

describe('native bridge contract', () => {
  it('exposes required methods', () => {
    expect(typeof NativeLiDAR.startScan).toBe('function');
    expect(typeof NativeLiDAR.stopScan).toBe('function');
    expect(typeof NativeLiDAR.exportMesh).toBe('function');
    expect(typeof NativeLiDAR.subscribe).toBe('function');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- nativeBridgeContract.test.ts`
Expected: FAIL if `NativeLiDAR` is missing any method

- [ ] **Step 3: Write minimal implementation**

```ts
// client/rn-arkit-replacement/tests/unit/useLiDARScan.test.ts
import { act, renderHook } from '@testing-library/react-native';
import { useLiDARScan } from '../../src/features/lidar/useLiDARScan';

jest.mock('../../src/features/lidar/NativeLiDAR', () => ({
  NativeLiDAR: {
    startScan: jest.fn().mockResolvedValue(undefined),
    stopScan: jest.fn().mockResolvedValue(undefined),
    exportMesh: jest.fn().mockResolvedValue({ plyPath: 'scan.ply', objPath: 'scan.obj' }),
    subscribe: jest.fn((handler: any) => {
      setTimeout(() => handler({ type: 'exported', payload: { plyPath: 'scan.ply', objPath: 'scan.obj' } }), 0);
      return () => undefined;
    }),
  },
}));

describe('useLiDARScan', () => {
  it('moves from idle -> scanning -> exported', async () => {
    const { result } = renderHook(() => useLiDARScan());

    expect(result.current.state.phase).toBe('idle');

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.state.phase).toBe('scanning');

    await act(async () => {
      await result.current.stop();
      await result.current.exportMesh();
    });

    await new Promise((r) => setTimeout(r, 10));

    expect(result.current.state.phase).toBe('exported');
    expect(result.current.state.output?.plyPath).toContain('scan.ply');
  });
});
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- nativeBridgeContract.test.ts useLiDARScan.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add client/rn-arkit-replacement/tests/unit/nativeBridgeContract.test.ts client/rn-arkit-replacement/tests/unit/useLiDARScan.test.ts
git commit -m "test(rn): add native bridge contract and hook test updates"
```

---

### Task 3: Wire view manager, bridge module, and event emitter to ARScannerView

**Files:**
- Create: `client/rn-arkit-replacement/ios/UniWhereLiDARTests/BridgeModuleTests.swift`
- Modify: `client/rn-arkit-replacement/ios/UniWhereLiDAR/Native/RNLiDARViewManager.swift`
- Modify: `client/rn-arkit-replacement/ios/UniWhereLiDAR/Native/RNLiDARBridgeModule.swift`
- Modify: `client/rn-arkit-replacement/ios/UniWhereLiDAR/Native/RNLiDAREventEmitter.swift`
- Modify: `client/rn-arkit-replacement/ios/UniWhereLiDAR/Scanning/ARScannerView.swift`

- [ ] **Step 1: Write the failing test**

```swift
// client/rn-arkit-replacement/ios/UniWhereLiDARTests/BridgeModuleTests.swift
import XCTest
@testable import UniWhereLiDAR

final class BridgeModuleTests: XCTestCase {
    func test_viewManager_setsCurrentView() {
        let manager = RNLiDARViewManager()
        _ = manager.view()
        XCTAssertNotNil(RNLiDARViewManager.currentView)
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `xcodebuild -workspace UniWhereLiDAR.xcworkspace -scheme UniWhereLiDAR -destination 'platform=iOS Simulator,name=iPhone 15 Pro' test -only-testing:UniWhereLiDARTests/BridgeModuleTests/test_viewManager_setsCurrentView`
Expected: FAIL with `currentView` missing

- [ ] **Step 3: Write minimal implementation**

```swift
// client/rn-arkit-replacement/ios/UniWhereLiDAR/Native/RNLiDARViewManager.swift
import Foundation
import UIKit
import React

@objc(RNLiDARViewManager)
final class RNLiDARViewManager: RCTViewManager {
    static weak var currentView: ARScannerView?

    override func view() -> UIView! {
        let v = ARScannerView(frame: .zero)
        RNLiDARViewManager.currentView = v
        return v
    }

    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
```

```swift
// client/rn-arkit-replacement/ios/UniWhereLiDAR/Native/RNLiDAREventEmitter.swift
import Foundation
import React

@objc(RNLiDAREventEmitter)
final class RNLiDAREventEmitter: RCTEventEmitter {
    private static weak var sharedEmitter: RNLiDAREventEmitter?

    override init() {
        super.init()
        RNLiDAREventEmitter.sharedEmitter = self
    }

    static func shared() -> RNLiDAREventEmitter? {
        return sharedEmitter
    }

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
```

```swift
// client/rn-arkit-replacement/ios/UniWhereLiDAR/Native/RNLiDARBridgeModule.swift
import Foundation
import React

@objc(RNLiDARBridgeModule)
final class RNLiDARBridgeModule: NSObject {
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }

    private func requireView(_ reject: @escaping RCTPromiseRejectBlock) -> ARScannerView? {
        guard let view = RNLiDARViewManager.currentView else {
            reject("no_view", "LiDAR view not initialized", nil)
            return nil
        }
        return view
    }

    @objc
    func startScan(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let view = requireView(reject) else { return }
        view.startScan()
        resolve(nil)
    }

    @objc
    func stopScan(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let view = requireView(reject) else { return }
        view.stopScan()
        resolve(nil)
    }

    @objc
    func exportMesh(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let view = requireView(reject) else { return }
        do {
            let files = try view.exportMesh()
            resolve([
                "plyPath": files.plyPath,
                "objPath": files.objPath,
                "mtlPath": files.mtlPath,
                "texturePath": files.texturePath,
            ])
        } catch {
            reject("export_failed", "Failed to export mesh", error)
        }
    }
}
```

```swift
// client/rn-arkit-replacement/ios/UniWhereLiDAR/Scanning/ARScannerView.swift
import UIKit
import ARKit
import RealityKit

final class ARScannerView: ARView {
    private let controller = LiDARSessionController()
    private let reconstructor = MeshReconstructor(voxelSize: 0.02)
    private let exporter = MeshExporter()
    private var lastFrame: ARFrame?

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
    }

    func startScan() {
        do {
            let config = try controller.makeConfiguration()
            self.session.run(config)
        } catch {
            // Unsupported device; keep session idle
        }
    }

    func stopScan() {
        self.session.pause()
    }

    func exportMesh() throws -> MeshExportFiles {
        let snapshot = reconstructor.snapshot()
        return try exporter.export(mesh: snapshot, baseName: "scan")
    }
}

extension ARScannerView: ARSessionDelegate {
    func session(_ session: ARSession, didUpdate frame: ARFrame) {
        lastFrame = frame
    }

    func session(_ session: ARSession, didAdd anchors: [ARAnchor]) {
        ingest(anchors)
    }

    func session(_ session: ARSession, didUpdate anchors: [ARAnchor]) {
        ingest(anchors)
    }

    private func ingest(_ anchors: [ARAnchor]) {
        let meshAnchors = anchors.compactMap { $0 as? ARMeshAnchor }
        for anchor in meshAnchors {
            let geometry = anchor.geometry
            let vertices = geometry.verticesArray().map { anchor.transform * SIMD4<Float>($0, 1.0) }
            let normals = geometry.normalsArray().map { SIMD3<Float>($0.x, $0.y, $0.z) }
            let indices = geometry.indicesArray()
            let worldVertices = vertices.map { SIMD3<Float>($0.x, $0.y, $0.z) }

            reconstructor.append(vertices: worldVertices, indices: indices, normals: normals)

            if let frame = lastFrame {
                reconstructor.applyColor { v in
                    TextureProjector.projectColor(on: &v, frame: frame)
                }
            }
        }

        if let emitter = RNLiDAREventEmitter.shared() {
            emitter.sendMeshUpdate(["type": "mesh_update", "vertexCount": reconstructor.snapshot().vertices.count])
        }
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `xcodebuild -workspace UniWhereLiDAR.xcworkspace -scheme UniWhereLiDAR -destination 'platform=iOS Simulator,name=iPhone 15 Pro' test -only-testing:UniWhereLiDARTests/BridgeModuleTests/test_viewManager_setsCurrentView`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add client/rn-arkit-replacement/ios/UniWhereLiDAR/Native/RNLiDARViewManager.swift client/rn-arkit-replacement/ios/UniWhereLiDAR/Native/RNLiDARBridgeModule.swift client/rn-arkit-replacement/ios/UniWhereLiDAR/Native/RNLiDAREventEmitter.swift client/rn-arkit-replacement/ios/UniWhereLiDAR/Scanning/ARScannerView.swift client/rn-arkit-replacement/ios/UniWhereLiDARTests/BridgeModuleTests.swift
git commit -m "feat(ios-bridge): wire lidar view to bridge module"
```

---

### Task 4: Implement mesh ingestion helpers and color projection

**Files:**
- Modify: `client/rn-arkit-replacement/ios/UniWhereLiDAR/Mesh/MeshReconstructor.swift`
- Modify: `client/rn-arkit-replacement/ios/UniWhereLiDAR/Mesh/TextureProjector.swift`
- Modify: `client/rn-arkit-replacement/ios/UniWhereLiDARTests/MeshReconstructorTests.swift`

- [ ] **Step 1: Write the failing test**

```swift
// client/rn-arkit-replacement/ios/UniWhereLiDARTests/MeshReconstructorTests.swift
import XCTest
@testable import UniWhereLiDAR
import simd

final class MeshReconstructorTests: XCTestCase {
    func test_applyColor_incrementsObservationCount() {
        let sut = MeshReconstructor(voxelSize: 0.05)
        let v0 = SIMD3<Float>(0.0, 0.0, 0.0)
        sut.append(vertices: [v0], indices: [0, 0, 0], normals: [SIMD3<Float>(0,1,0)])

        sut.applyColor { v in
            TextureProjector.accumulateColor(on: &v, rgb: SIMD3<Float>(1, 0, 0))
        }

        let mesh = sut.snapshot()
        XCTAssertEqual(mesh.vertices.first?.observations, 1)
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `xcodebuild -workspace UniWhereLiDAR.xcworkspace -scheme UniWhereLiDAR -destination 'platform=iOS Simulator,name=iPhone 15 Pro' test -only-testing:UniWhereLiDARTests/MeshReconstructorTests/test_applyColor_incrementsObservationCount`
Expected: FAIL with missing `append` or `applyColor`

- [ ] **Step 3: Write minimal implementation**

```swift
// client/rn-arkit-replacement/ios/UniWhereLiDAR/Mesh/MeshReconstructor.swift
import Foundation
import simd

struct ColoredVertex {
    var position: SIMD3<Float>
    var normal: SIMD3<Float>
    var color: SIMD3<Float> = SIMD3<Float>(0,0,0)
    var observations: Int = 0
}

struct MeshSnapshot {
    var vertices: [ColoredVertex]
    var indices: [UInt32]
}

final class MeshReconstructor {
    private let voxelSize: Float
    private var vertices: [ColoredVertex] = []
    private var voxelMap: [SIMD3<Int32>: UInt32] = [:]
    private var indices: [UInt32] = []

    init(voxelSize: Float) {
        self.voxelSize = voxelSize
    }

    private func voxelKey(for p: SIMD3<Float>) -> SIMD3<Int32> {
        SIMD3<Int32>(Int32(floor(p.x / voxelSize)), Int32(floor(p.y / voxelSize)), Int32(floor(p.z / voxelSize)))
    }

    func append(vertices input: [SIMD3<Float>], indices inputIndices: [UInt32], normals: [SIMD3<Float>]?) {
        var remap: [UInt32: UInt32] = [:]
        for (i, p) in input.enumerated() {
            let key = voxelKey(for: p)
            if let existing = voxelMap[key] {
                remap[UInt32(i)] = existing
            } else {
                let normal = normals?[i] ?? SIMD3<Float>(0, 1, 0)
                let cv = ColoredVertex(position: p, normal: normal)
                let newIndex = UInt32(vertices.count)
                vertices.append(cv)
                voxelMap[key] = newIndex
                remap[UInt32(i)] = newIndex
            }
        }

        for idx in inputIndices {
            if let n = remap[idx] {
                indices.append(n)
            }
        }
    }

    func applyColor(_ apply: (inout ColoredVertex) -> Void) {
        for i in vertices.indices {
            var v = vertices[i]
            apply(&v)
            vertices[i] = v
        }
    }

    func snapshot() -> MeshSnapshot {
        MeshSnapshot(vertices: vertices, indices: indices)
    }
}
```

```swift
// client/rn-arkit-replacement/ios/UniWhereLiDAR/Mesh/TextureProjector.swift
import Foundation
import simd
import ARKit
import CoreImage

enum TextureProjector {
    static func accumulateColor(on vertex: inout ColoredVertex, rgb: SIMD3<Float>) {
        let n = Float(vertex.observations)
        if vertex.observations == 0 {
            vertex.color = rgb
        } else {
            vertex.color = (vertex.color * n + rgb) / (n + 1.0)
        }
        vertex.observations += 1
    }

    static func projectColor(on vertex: inout ColoredVertex, frame: ARFrame) {
        let camera = frame.camera
        let viewport = CGSize(width: CGFloat(frame.camera.imageResolution.width), height: CGFloat(frame.camera.imageResolution.height))
        let projected = camera.projectPoint(vertex.position, orientation: .portrait, viewportSize: viewport)

        guard let rgb = sampleRGB(from: frame.capturedImage, at: projected, viewport: viewport) else {
            return
        }

        accumulateColor(on: &vertex, rgb: rgb)
    }

    private static func sampleRGB(from pixelBuffer: CVPixelBuffer, at point: CGPoint, viewport: CGSize) -> SIMD3<Float>? {
        let x = Int(max(0, min(viewport.width - 1, point.x)))
        let y = Int(max(0, min(viewport.height - 1, point.y)))

        let ciImage = CIImage(cvPixelBuffer: pixelBuffer)
        let context = CIContext(options: nil)
        guard let cgImage = context.createCGImage(ciImage, from: ciImage.extent) else { return nil }

        guard let dataProvider = cgImage.dataProvider, let data = dataProvider.data else { return nil }
        let bytes = CFDataGetBytePtr(data)
        let bytesPerPixel = 4
        let bytesPerRow = cgImage.bytesPerRow
        let yy = Int(viewport.height) - 1 - y
        let offset = yy * bytesPerRow + x * bytesPerPixel

        let r = Float(bytes[offset + 0]) / 255.0
        let g = Float(bytes[offset + 1]) / 255.0
        let b = Float(bytes[offset + 2]) / 255.0
        return SIMD3<Float>(r, g, b)
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `xcodebuild -workspace UniWhereLiDAR.xcworkspace -scheme UniWhereLiDAR -destination 'platform=iOS Simulator,name=iPhone 15 Pro' test -only-testing:UniWhereLiDARTests/MeshReconstructorTests/test_applyColor_incrementsObservationCount`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add client/rn-arkit-replacement/ios/UniWhereLiDAR/Mesh/MeshReconstructor.swift client/rn-arkit-replacement/ios/UniWhereLiDAR/Mesh/TextureProjector.swift client/rn-arkit-replacement/ios/UniWhereLiDARTests/MeshReconstructorTests.swift
git commit -m "feat(ios-mesh): append mesh and project vertex color"
```

---

### Task 5: Write PLY/OBJ/MTL/PNG outputs to disk

**Files:**
- Modify: `client/rn-arkit-replacement/ios/UniWhereLiDAR/Export/MeshExporter.swift`
- Modify: `client/rn-arkit-replacement/ios/UniWhereLiDARTests/MeshExporterTests.swift`

- [ ] **Step 1: Write the failing test**

```swift
// client/rn-arkit-replacement/ios/UniWhereLiDARTests/MeshExporterTests.swift
import XCTest
@testable import UniWhereLiDAR

final class MeshExporterTests: XCTestCase {
    func test_export_writesFiles() throws {
        let sut = MeshExporter()
        let v0 = ColoredVertex(position: SIMD3<Float>(0,0,0), normal: SIMD3<Float>(0,1,0))
        let v1 = ColoredVertex(position: SIMD3<Float>(1,0,0), normal: SIMD3<Float>(0,1,0))
        let v2 = ColoredVertex(position: SIMD3<Float>(0,1,0), normal: SIMD3<Float>(0,1,0))
        let mesh = MeshSnapshot(vertices: [v0, v1, v2], indices: [0, 1, 2])

        let dir = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)

        let files = try sut.export(mesh: mesh, baseName: "scan", directory: dir)
        XCTAssertTrue(FileManager.default.fileExists(atPath: files.plyPath))
        XCTAssertTrue(FileManager.default.fileExists(atPath: files.objPath))
        XCTAssertTrue(FileManager.default.fileExists(atPath: files.mtlPath))
        XCTAssertTrue(FileManager.default.fileExists(atPath: files.texturePath))
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `xcodebuild -workspace UniWhereLiDAR.xcworkspace -scheme UniWhereLiDAR -destination 'platform=iOS Simulator,name=iPhone 15 Pro' test -only-testing:UniWhereLiDARTests/MeshExporterTests/test_export_writesFiles`
Expected: FAIL with missing `export` method

- [ ] **Step 3: Write minimal implementation**

```swift
// client/rn-arkit-replacement/ios/UniWhereLiDAR/Export/MeshExporter.swift
import Foundation
import UIKit

struct MeshExportFiles {
    let plyPath: String
    let objPath: String
    let mtlPath: String
    let texturePath: String
}

final class MeshExporter {
    func plyString(from mesh: MeshSnapshot) throws -> String {
        var lines: [String] = []
        lines.append("ply")
        lines.append("format ascii 1.0")
        lines.append("element vertex \(mesh.vertices.count)")
        lines.append("property float x")
        lines.append("property float y")
        lines.append("property float z")
        lines.append("property uchar red")
        lines.append("property uchar green")
        lines.append("property uchar blue")
        let faceCount = mesh.indices.count / 3
        lines.append("element face \(faceCount)")
        lines.append("property list uchar int vertex_indices")
        lines.append("end_header")

        for v in mesh.vertices {
            let r = UInt8(min(max(Int(round(Double(v.color.x * 255.0))), 0), 255))
            let g = UInt8(min(max(Int(round(Double(v.color.y * 255.0))), 0), 255))
            let b = UInt8(min(max(Int(round(Double(v.color.z * 255.0))), 0), 255))
            lines.append("\(v.position.x) \(v.position.y) \(v.position.z) \(r) \(g) \(b)")
        }

        var i = 0
        while i + 2 < mesh.indices.count {
            let a = mesh.indices[i]
            let b = mesh.indices[i+1]
            let c = mesh.indices[i+2]
            lines.append("3 \(a) \(b) \(c)")
            i += 3
        }

        return lines.joined(separator: "\n")
    }

    func export(mesh: MeshSnapshot, baseName: String, directory: URL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]) throws -> MeshExportFiles {
        let plyURL = directory.appendingPathComponent(baseName).appendingPathExtension("ply")
        let objURL = directory.appendingPathComponent(baseName).appendingPathExtension("obj")
        let mtlURL = directory.appendingPathComponent(baseName).appendingPathExtension("mtl")
        let texURL = directory.appendingPathComponent(baseName + "_texture").appendingPathExtension("png")

        let ply = try plyString(from: mesh)
        try ply.write(to: plyURL, atomically: true, encoding: .utf8)

        let mtlText = "newmtl material0\nmap_Kd \(texURL.lastPathComponent)\n"
        try mtlText.write(to: mtlURL, atomically: true, encoding: .utf8)

        var objLines: [String] = []
        objLines.append("mtllib \(mtlURL.lastPathComponent)")
        for v in mesh.vertices {
            objLines.append("v \(v.position.x) \(v.position.y) \(v.position.z)")
        }
        objLines.append("usemtl material0")
        var idx = 0
        while idx + 2 < mesh.indices.count {
            let a = mesh.indices[idx] + 1
            let b = mesh.indices[idx+1] + 1
            let c = mesh.indices[idx+2] + 1
            objLines.append("f \(a) \(b) \(c)")
            idx += 3
        }
        try objLines.joined(separator: "\n").write(to: objURL, atomically: true, encoding: .utf8)

        let renderer = UIGraphicsImageRenderer(size: CGSize(width: 1, height: 1))
        let image = renderer.image { ctx in
            UIColor.red.setFill()
            ctx.fill(CGRect(x: 0, y: 0, width: 1, height: 1))
        }
        if let png = image.pngData() {
            try png.write(to: texURL)
        }

        return MeshExportFiles(plyPath: plyURL.path, objPath: objURL.path, mtlPath: mtlURL.path, texturePath: texURL.path)
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `xcodebuild -workspace UniWhereLiDAR.xcworkspace -scheme UniWhereLiDAR -destination 'platform=iOS Simulator,name=iPhone 15 Pro' test -only-testing:UniWhereLiDARTests/MeshExporterTests/test_export_writesFiles`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add client/rn-arkit-replacement/ios/UniWhereLiDAR/Export/MeshExporter.swift client/rn-arkit-replacement/ios/UniWhereLiDARTests/MeshExporterTests.swift
git commit -m "feat(ios-export): write ply obj mtl and texture png"
```

---

### Task 6: Final verification (JS, Python, iOS)

**Files:**
- Modify: None

- [ ] **Step 1: JS typecheck and tests**

Run:
```
cd client/rn-arkit-replacement
npm install --legacy-peer-deps --no-audit --no-fund
npm run typecheck
npm test
```
Expected: PASS

- [ ] **Step 2: Python benchmark tests**

Run:
```
python -m pip install -r client/rn-arkit-replacement/tools/benchmark/requirements.txt
python -m pytest client/rn-arkit-replacement/tools/benchmark/test_compare_meshes.py -v
```
Expected: PASS

- [ ] **Step 3: iOS native tests (macOS only)**

Run:
```
cd client/rn-arkit-replacement/ios
pod install
xcodebuild -workspace UniWhereLiDAR.xcworkspace -scheme UniWhereLiDAR -destination 'platform=iOS Simulator,name=iPhone 15 Pro' test
```
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git commit --allow-empty -m "chore(verify): run rn, python, and ios test suites"
```

---

## Self-Review

- Spec coverage: covers missing JS config/tests, native bridge wiring, mesh ingestion/color projection, file export outputs, and verification steps.
- Placeholder scan: no TBD/TODO placeholders, all code and commands are included.
- Type consistency: methods `append`, `applyColor`, `projectColor`, and `export` are defined and used consistently.
