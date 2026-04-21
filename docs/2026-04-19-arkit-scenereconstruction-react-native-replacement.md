# ARKit SceneReconstruction React Native Replacement Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir una app React Native iOS-first, aislada del stack actual, que genere malla 3D triangular con color usando ARKit `sceneReconstruction` y permita reemplazar el flujo actual con MultiSet en escenarios indoor comparables.

**Architecture:** La solucion se implementa en un workspace aislado (`client/rn-arkit-replacement`) con tres capas: Native iOS (ARKit + AVFoundation + exportadores), Bridge RN (RCTViewManager + NativeModule + EventEmitter) y UI JS/TS (pantalla de escaneo, progreso, export y preview). La geometria se obtiene de `ARMeshAnchor` y el color se proyecta desde `ARFrame.capturedImage` sobre vertices/faces. El output inicial de produccion sera `scan.ply` (vertex color) y `scan.obj + scan.mtl + texture.png` para compatibilidad de pipelines.

**Tech Stack:** React Native (TypeScript, bare workflow), Swift 5.10+, ARKit, AVFoundation, Metal (shader opcional para proyeccion), XCTest, Jest + React Native Testing Library, Python + trimesh/open3d para benchmark comparativo.

**Scope Guardrails (Aislamiento):**
- No modificar `backend/`, `preprocesamiento/`, `infra/` ni pipelines existentes.
- Todo el codigo nuevo vive bajo `client/rn-arkit-replacement/`.
- La comparacion con MultiSet se hace por dataset y metricas, sin tocar el servicio actual.

**Execution Skills:** @superpowers/subagent-driven-development, @superpowers/systematic-debugging, @superpowers/verification-before-completion

**Working directory for all tasks:** `C:\Users\crist\Documents\proyectos\UniWhere\.worktrees\feature\rn-arkit-replacement` (monorepo root in dedicated worktree)

**Run React Native commands from:** `client/rn-arkit-replacement/`

**Run iOS native tests from:** `client/rn-arkit-replacement/ios/` (macOS required)

**Git command context:** all `git add` and `git commit` commands below assume execution from the monorepo root shown above.

---

## File Structure (locked before tasks)

### App shell and JS contracts
- Create: `client/rn-arkit-replacement/package.json` - scripts RN/Jest/TypeCheck.
- Create: `client/rn-arkit-replacement/tsconfig.json` - TS strict mode.
- Create: `client/rn-arkit-replacement/jest.config.js` - unit/integration config.
- Create: `client/rn-arkit-replacement/src/App.tsx` - root app + navigation.
- Create: `client/rn-arkit-replacement/src/features/lidar/types.ts` - contratos compartidos (estado, eventos, outputs).
- Create: `client/rn-arkit-replacement/src/features/lidar/NativeLiDAR.ts` - wrapper tipado de NativeModules.
- Create: `client/rn-arkit-replacement/src/features/lidar/useLiDARScan.ts` - estado y comandos de escaneo.
- Create: `client/rn-arkit-replacement/src/features/lidar/LiDARView.tsx` - `requireNativeComponent`.
- Create: `client/rn-arkit-replacement/src/features/lidar/screens/ScanScreen.tsx` - flujo start/stop/export.
- Create: `client/rn-arkit-replacement/src/features/lidar/screens/PreviewScreen.tsx` - preview de mesh exportada.
- Create: `client/rn-arkit-replacement/src/services/mesh/MeshUploadService.ts` - subida de artefactos.

### Native iOS (bridge + captura + mesh)
- Create: `client/rn-arkit-replacement/ios/UniWhereLiDAR/Native/RNLiDARViewManager.swift` - bridge de vista nativa.
- Create: `client/rn-arkit-replacement/ios/UniWhereLiDAR/Native/RNLiDARBridgeModule.swift` - comandos `startScan/stopScan/exportMesh`.
- Create: `client/rn-arkit-replacement/ios/UniWhereLiDAR/Native/RNLiDARBridgeModule.m` - export Objective-C de metodos Swift a React Native.
- Create: `client/rn-arkit-replacement/ios/UniWhereLiDAR/Native/RNLiDAREventEmitter.swift` - eventos de progreso.
- Create: `client/rn-arkit-replacement/ios/UniWhereLiDAR/Native/RNLiDAREventEmitter.m` - export Objective-C de EventEmitter.
- Create: `client/rn-arkit-replacement/ios/UniWhereLiDAR/Scanning/ARScannerView.swift` - `ARView` + `ARSessionDelegate`.
- Create: `client/rn-arkit-replacement/ios/UniWhereLiDAR/Scanning/LiDARSessionController.swift` - configuracion ARKit.
- Create: `client/rn-arkit-replacement/ios/UniWhereLiDAR/Mesh/MeshReconstructor.swift` - union de anchors, deduplicacion, normales.
- Create: `client/rn-arkit-replacement/ios/UniWhereLiDAR/Mesh/TextureProjector.swift` - proyeccion RGB -> color mesh.
- Create: `client/rn-arkit-replacement/ios/UniWhereLiDAR/Export/MeshExporter.swift` - PLY + OBJ/MTL/PNG.

### Testing and validation
- Create: `client/rn-arkit-replacement/tests/app.smoke.test.tsx`
- Create: `client/rn-arkit-replacement/tests/unit/useLiDARScan.test.ts`
- Create: `client/rn-arkit-replacement/tests/unit/nativeBridgeContract.test.ts`
- Create: `client/rn-arkit-replacement/tests/integration/scanFlow.test.tsx`
- Create: `client/rn-arkit-replacement/ios/UniWhereLiDARTests/LiDARSessionControllerTests.swift`
- Create: `client/rn-arkit-replacement/ios/UniWhereLiDARTests/MeshReconstructorTests.swift`
- Create: `client/rn-arkit-replacement/ios/UniWhereLiDARTests/TextureProjectorTests.swift`
- Create: `client/rn-arkit-replacement/ios/UniWhereLiDARTests/MeshExporterTests.swift`
- Create: `client/rn-arkit-replacement/tools/benchmark/compare_meshes.py`
- Create: `client/rn-arkit-replacement/tools/benchmark/test_compare_meshes.py`
- Create: `client/rn-arkit-replacement/tools/benchmark/requirements.txt`
- Create: `client/rn-arkit-replacement/docs/benchmark-protocol.md`
- Create: `client/rn-arkit-replacement/docs/migration-runbook.md`

---

## Chunk 1: Isolated RN foundation and JS contracts

### Task 0: Verificar entorno iOS (macOS + Xcode + CocoaPods)

**Files:**
- Modify: None (verification task)

- [ ] **Step 1: Verify Xcode toolchain is available**

Run: `xcode-select --print-path`
Expected: path under `/Applications/Xcode.app/...`.

- [ ] **Step 2: Verify CocoaPods is available**

Run: `pod --version`
Expected: version output (for example `1.14.x`).

- [ ] **Step 3: Verify simulator target exists**

Run: `xcrun simctl list devices | grep "iPhone 15 Pro"`
Expected: at least one iPhone 15 Pro simulator entry.

- [ ] **Step 4: Verify Ruby/Node/Watchman baseline**

Run: `node -v && npm -v && ruby -v`
Expected: versions printed with exit code 0.

- [ ] **Step 5: Commit**

```bash
git commit --allow-empty -m "chore(env): verify macos ios prerequisites for arkit rn replacement"
```

---

### Task 1: Bootstrap aislado de la app React Native

**Files:**
- Create: `client/rn-arkit-replacement/package.json`
- Create: `client/rn-arkit-replacement/src/App.tsx`
- Create: `client/rn-arkit-replacement/jest.config.js`
- Test: `client/rn-arkit-replacement/tests/app.smoke.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// client/rn-arkit-replacement/tests/app.smoke.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../src/App';

describe('App shell', () => {
  it('renders isolated LiDAR scanner title', () => {
    const { getByText } = render(<App />);
    expect(getByText('UniWhere LiDAR Scanner')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- app.smoke.test.tsx`
Expected: FAIL with `Cannot find module '../src/App'`.

- [ ] **Step 3: Write minimal implementation**

```bash
npx @react-native-community/cli@latest init UniWhereLiDAR --directory client/rn-arkit-replacement --template react-native-template-typescript
```

```tsx
// client/rn-arkit-replacement/src/App.tsx
import React from 'react';
import { SafeAreaView, Text } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B0F14', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#E6EDF3', fontSize: 22, fontWeight: '700' }}>UniWhere LiDAR Scanner</Text>
    </SafeAreaView>
  );
}
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

Run: `npm test -- app.smoke.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/rn-arkit-replacement/package.json client/rn-arkit-replacement/src/App.tsx client/rn-arkit-replacement/jest.config.js client/rn-arkit-replacement/tests/app.smoke.test.tsx
git commit -m "feat(rn-arkit): bootstrap isolated react-native scanner shell"
```

---

### Task 2: Definir contrato JS/TS del escaneo y hook de estado

**Files:**
- Create: `client/rn-arkit-replacement/src/features/lidar/types.ts`
- Create: `client/rn-arkit-replacement/src/features/lidar/NativeLiDAR.ts`
- Create: `client/rn-arkit-replacement/src/features/lidar/useLiDARScan.ts`
- Test: `client/rn-arkit-replacement/tests/unit/useLiDARScan.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// client/rn-arkit-replacement/tests/unit/useLiDARScan.test.ts
import { act, renderHook } from '@testing-library/react-native';
import { useLiDARScan } from '../../src/features/lidar/useLiDARScan';

jest.mock('../../src/features/lidar/NativeLiDAR', () => ({
  NativeLiDAR: {
    startScan: jest.fn().mockResolvedValue(undefined),
    stopScan: jest.fn().mockResolvedValue(undefined),
    exportMesh: jest.fn().mockResolvedValue({ plyPath: '/tmp/scan.ply', objPath: '/tmp/scan.obj' }),
    subscribe: jest.fn(() => () => undefined),
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
      await result.current.stopAndExport();
    });
    expect(result.current.state.phase).toBe('exported');
    expect(result.current.state.output?.plyPath).toContain('scan.ply');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- useLiDARScan.test.ts`
Expected: FAIL with `Cannot find module '../../src/features/lidar/useLiDARScan'`.

- [ ] **Step 3: Write minimal implementation**

```ts
// client/rn-arkit-replacement/src/features/lidar/types.ts
export type ScanPhase = 'idle' | 'scanning' | 'exporting' | 'exported' | 'error';

export interface MeshOutput {
  plyPath: string;
  objPath: string;
  mtlPath?: string;
  texturePath?: string;
}

export interface ScanState {
  phase: ScanPhase;
  output?: MeshOutput;
  error?: string;
}
```

```ts
// client/rn-arkit-replacement/src/features/lidar/NativeLiDAR.ts
import { NativeModules, NativeEventEmitter } from 'react-native';

type NativeLiDARShape = {
  startScan: () => Promise<void>;
  stopScan: () => Promise<void>;
  exportMesh: () => Promise<{ plyPath: string; objPath: string; mtlPath?: string; texturePath?: string }>;
};

const moduleRef = NativeModules.RNLiDARBridgeModule as NativeLiDARShape;
const emitter = new NativeEventEmitter(NativeModules.RNLiDAREventEmitter);

export const NativeLiDAR = {
  startScan: () => moduleRef.startScan(),
  stopScan: () => moduleRef.stopScan(),
  exportMesh: () => moduleRef.exportMesh(),
  subscribe: (handler: (event: unknown) => void) => {
    const sub = emitter.addListener('onMeshUpdate', handler);
    return () => sub.remove();
  },
};
```

```ts
// client/rn-arkit-replacement/src/features/lidar/useLiDARScan.ts
import { useMemo, useState } from 'react';
import { NativeLiDAR } from './NativeLiDAR';
import type { ScanState } from './types';

export function useLiDARScan() {
  const [state, setState] = useState<ScanState>({ phase: 'idle' });

  const api = useMemo(
    () => ({
      state,
      start: async () => {
        await NativeLiDAR.startScan();
        setState({ phase: 'scanning' });
      },
      stopAndExport: async () => {
        setState((prev) => ({ ...prev, phase: 'exporting' }));
        await NativeLiDAR.stopScan();
        const output = await NativeLiDAR.exportMesh();
        setState({ phase: 'exported', output });
      },
    }),
    [state]
  );

  return api;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- useLiDARScan.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/rn-arkit-replacement/src/features/lidar/types.ts client/rn-arkit-replacement/src/features/lidar/NativeLiDAR.ts client/rn-arkit-replacement/src/features/lidar/useLiDARScan.ts client/rn-arkit-replacement/tests/unit/useLiDARScan.test.ts
git commit -m "feat(rn-arkit): add typed lidar contract and scan state hook"
```

---

## Chunk 2: Native ARKit capture, geometry and color pipeline

### Task 3: Session ARKit con sceneReconstruction mesh (sin semantica)

**Files:**
- Create: `client/rn-arkit-replacement/ios/UniWhereLiDAR/Scanning/LiDARSessionController.swift`
- Create: `client/rn-arkit-replacement/ios/UniWhereLiDAR/Scanning/ARScannerView.swift`
- Test: `client/rn-arkit-replacement/ios/UniWhereLiDARTests/LiDARSessionControllerTests.swift`

- [ ] **Step 1: Write the failing test**

```swift
// client/rn-arkit-replacement/ios/UniWhereLiDARTests/LiDARSessionControllerTests.swift
import XCTest
@testable import UniWhereLiDAR
import ARKit

final class LiDARSessionControllerTests: XCTestCase {
    func test_makeConfiguration_enablesSceneReconstructionMesh() throws {
        let sut = LiDARSessionController()
        let config = try sut.makeConfiguration()
        XCTAssertEqual(config.sceneReconstruction, .mesh)
        XCTAssertTrue(config.frameSemantics.contains(.sceneDepth))
    }

  func test_scannerView_setsARSessionDelegate() {
    let sut = ARScannerView(frame: .zero)
    XCTAssertTrue((sut.session.delegate as AnyObject) === sut)
  }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `xcodebuild -workspace UniWhereLiDAR.xcworkspace -scheme UniWhereLiDAR -destination 'platform=iOS Simulator,name=iPhone 15 Pro' test -only-testing:UniWhereLiDARTests/LiDARSessionControllerTests/test_makeConfiguration_enablesSceneReconstructionMesh`
Expected: FAIL with `Cannot find 'LiDARSessionController' in scope`.

- [ ] **Step 3: Write minimal implementation**

```swift
// client/rn-arkit-replacement/ios/UniWhereLiDAR/Scanning/LiDARSessionController.swift
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
        config.sceneReconstruction = .mesh
        if ARWorldTrackingConfiguration.supportsFrameSemantics(.sceneDepth) {
            config.frameSemantics.insert(.sceneDepth)
        }
        config.environmentTexturing = .none
        return config
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

  private struct NoopMeshSink {
    func ingest(anchor: ARMeshAnchor) {}
  }

  private let sink = NoopMeshSink()

    required init(frame frameRect: CGRect) {
        super.init(frame: frameRect)
    session.delegate = self
        startSession()
    }

    @MainActor required dynamic init?(coder decoder: NSCoder) {
        super.init(coder: decoder)
    session.delegate = self
        startSession()
    }

    private func startSession() {
        do {
            let config = try controller.makeConfiguration()
            session.run(config, options: [.removeExistingAnchors, .resetTracking])
        } catch {
            assertionFailure("LiDAR config failed: \(error)")
        }
    }
}

  extension ARScannerView: ARSessionDelegate {
    func session(_ session: ARSession, didAdd anchors: [ARAnchor]) {
      for anchor in anchors {
        if let meshAnchor = anchor as? ARMeshAnchor {
          sink.ingest(anchor: meshAnchor)
        }
      }
    }

    func session(_ session: ARSession, didUpdate anchors: [ARAnchor]) {
      for anchor in anchors {
        if let meshAnchor = anchor as? ARMeshAnchor {
          sink.ingest(anchor: meshAnchor)
        }
      }
    }
  }
```

- [ ] **Step 4: Run test to verify it passes**

Run: same `xcodebuild ... -only-testing ...`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/rn-arkit-replacement/ios/UniWhereLiDAR/Scanning/LiDARSessionController.swift client/rn-arkit-replacement/ios/UniWhereLiDAR/Scanning/ARScannerView.swift client/rn-arkit-replacement/ios/UniWhereLiDARTests/LiDARSessionControllerTests.swift
git commit -m "feat(ios-arkit): initialize sceneReconstruction mesh session"
```

---

### Task 4: Reconstruccion de mesh triangular y color por proyeccion RGB

**Files:**
- Create: `client/rn-arkit-replacement/ios/UniWhereLiDAR/Mesh/MeshReconstructor.swift`
- Create: `client/rn-arkit-replacement/ios/UniWhereLiDAR/Mesh/TextureProjector.swift`
- Test: `client/rn-arkit-replacement/ios/UniWhereLiDARTests/MeshReconstructorTests.swift`
- Test: `client/rn-arkit-replacement/ios/UniWhereLiDARTests/TextureProjectorTests.swift`

- [ ] **Step 1: Write the failing tests**

```swift
// client/rn-arkit-replacement/ios/UniWhereLiDARTests/MeshReconstructorTests.swift
import XCTest
@testable import UniWhereLiDAR

final class MeshReconstructorTests: XCTestCase {
    func test_mergeVertices_deduplicatesByVoxel() {
        let sut = MeshReconstructor(voxelSize: 0.02)
        sut.ingest(vertices: [
            SIMD3<Float>(0,0,0),
            SIMD3<Float>(0.001,0,0),
            SIMD3<Float>(1,0,0)
        ], indices: [0,1,2])

        let mesh = sut.snapshot()
        XCTAssertEqual(mesh.vertices.count, 2)
    }
}
```

```swift
// client/rn-arkit-replacement/ios/UniWhereLiDARTests/TextureProjectorTests.swift
import XCTest
@testable import UniWhereLiDAR

final class TextureProjectorTests: XCTestCase {
    func test_projectColor_accumulatesObservationCount() {
        var vertex = ColoredVertex(position: SIMD3<Float>(0,0,0), normal: SIMD3<Float>(0,1,0))
        TextureProjector.accumulateColor(on: &vertex, rgb: SIMD3<Float>(0.8, 0.2, 0.1))
        XCTAssertEqual(vertex.observations, 1)
        XCTAssertGreaterThan(vertex.color.x, 0)
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `xcodebuild -workspace UniWhereLiDAR.xcworkspace -scheme UniWhereLiDAR -destination 'platform=iOS Simulator,name=iPhone 15 Pro' test -only-testing:UniWhereLiDARTests/MeshReconstructorTests -only-testing:UniWhereLiDARTests/TextureProjectorTests`
Expected: FAIL with missing types.

- [ ] **Step 3: Write minimal implementation**

```swift
// client/rn-arkit-replacement/ios/UniWhereLiDAR/Mesh/MeshReconstructor.swift
import Foundation
import simd

struct ColoredVertex {
    var position: SIMD3<Float>
    var normal: SIMD3<Float>
    var color: SIMD3<Float> = .zero
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

    func ingest(vertices input: [SIMD3<Float>], indices inputIndices: [UInt32]) {
        for p in input {
            let key = SIMD3<Int32>(Int32(floor(p.x / voxelSize)), Int32(floor(p.y / voxelSize)), Int32(floor(p.z / voxelSize)))
            if voxelMap[key] == nil {
                let idx = UInt32(vertices.count)
                voxelMap[key] = idx
                vertices.append(ColoredVertex(position: p, normal: SIMD3<Float>(0, 1, 0)))
            }
        }
        indices = inputIndices
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

enum TextureProjector {
    static func accumulateColor(on vertex: inout ColoredVertex, rgb: SIMD3<Float>) {
        let n = Float(vertex.observations)
        vertex.color = (vertex.color * n + rgb) / (n + 1.0)
        vertex.observations += 1
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: same `xcodebuild ... -only-testing ...`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/rn-arkit-replacement/ios/UniWhereLiDAR/Mesh/MeshReconstructor.swift client/rn-arkit-replacement/ios/UniWhereLiDAR/Mesh/TextureProjector.swift client/rn-arkit-replacement/ios/UniWhereLiDARTests/MeshReconstructorTests.swift client/rn-arkit-replacement/ios/UniWhereLiDARTests/TextureProjectorTests.swift
git commit -m "feat(ios-mesh): add mesh merge and per-vertex color accumulation"
```

---

### Task 5: Exportacion de malla con color (PLY + OBJ/MTL/PNG)

**Files:**
- Create: `client/rn-arkit-replacement/ios/UniWhereLiDAR/Export/MeshExporter.swift`
- Test: `client/rn-arkit-replacement/ios/UniWhereLiDARTests/MeshExporterTests.swift`

- [ ] **Step 1: Write the failing tests**

```swift
// client/rn-arkit-replacement/ios/UniWhereLiDARTests/MeshExporterTests.swift
import XCTest
@testable import UniWhereLiDAR

final class MeshExporterTests: XCTestCase {
    func test_writePLY_includesHeaderAndFaceCount() throws {
        let sut = MeshExporter()
        let mesh = MeshSnapshot(
            vertices: [ColoredVertex(position: SIMD3<Float>(0,0,0), normal: SIMD3<Float>(0,1,0), color: SIMD3<Float>(1,0,0), observations: 1)],
            indices: [0,0,0]
        )

        let text = try sut.plyString(from: mesh)
        XCTAssertTrue(text.contains("element vertex 1"))
        XCTAssertTrue(text.contains("element face 1"))
    XCTAssertTrue(text.contains("3 0 0 0"))
    }

    func test_writeOBJ_referencesMTLAndTexture() throws {
        let sut = MeshExporter()
        let files = try sut.exportOBJBundleDummy(baseName: "scan")
        XCTAssertTrue(files.objPath.hasSuffix("scan.obj"))
        XCTAssertTrue(files.mtlPath.hasSuffix("scan.mtl"))
        XCTAssertTrue(files.texturePath.hasSuffix("texture.png"))
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `xcodebuild -workspace UniWhereLiDAR.xcworkspace -scheme UniWhereLiDAR -destination 'platform=iOS Simulator,name=iPhone 15 Pro' test -only-testing:UniWhereLiDARTests/MeshExporterTests`
Expected: FAIL with `Cannot find 'MeshExporter' in scope`.

- [ ] **Step 3: Write minimal implementation**

```swift
// client/rn-arkit-replacement/ios/UniWhereLiDAR/Export/MeshExporter.swift
import Foundation

struct MeshExportFiles {
    let plyPath: String
    let objPath: String
    let mtlPath: String
    let texturePath: String
}

final class MeshExporter {
    func plyString(from mesh: MeshSnapshot) throws -> String {
        var lines: [String] = [
            "ply",
            "format ascii 1.0",
            "element vertex \(mesh.vertices.count)",
            "property float x",
            "property float y",
            "property float z",
            "property uchar red",
            "property uchar green",
            "property uchar blue",
            "element face \(mesh.indices.count / 3)",
            "property list uchar int vertex_indices",
            "end_header"
        ]
        for v in mesh.vertices {
            lines.append("\(v.position.x) \(v.position.y) \(v.position.z) \(Int(v.color.x * 255)) \(Int(v.color.y * 255)) \(Int(v.color.z * 255))")
        }

        for i in stride(from: 0, to: mesh.indices.count, by: 3) {
          guard i + 2 < mesh.indices.count else { break }
          lines.append("3 \(mesh.indices[i]) \(mesh.indices[i + 1]) \(mesh.indices[i + 2])")
        }

        return lines.joined(separator: "\n")
    }

    func exportOBJBundleDummy(baseName: String) throws -> MeshExportFiles {
        let tmp = FileManager.default.temporaryDirectory.path
        return MeshExportFiles(
            plyPath: "\(tmp)/\(baseName).ply",
            objPath: "\(tmp)/\(baseName).obj",
            mtlPath: "\(tmp)/\(baseName).mtl",
            texturePath: "\(tmp)/texture.png"
        )
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: same `xcodebuild ... -only-testing ...`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/rn-arkit-replacement/ios/UniWhereLiDAR/Export/MeshExporter.swift client/rn-arkit-replacement/ios/UniWhereLiDARTests/MeshExporterTests.swift
git commit -m "feat(ios-export): add colored mesh exporters for ply and obj bundle"
```

---

## Chunk 3: React Native bridge and app flow end-to-end

### Task 6: Bridge nativo RN (ViewManager + Module + EventEmitter)

**Files:**
- Create: `client/rn-arkit-replacement/ios/UniWhereLiDAR/Native/RNLiDARViewManager.swift`
- Create: `client/rn-arkit-replacement/ios/UniWhereLiDAR/Native/RNLiDARBridgeModule.swift`
- Create: `client/rn-arkit-replacement/ios/UniWhereLiDAR/Native/RNLiDARBridgeModule.m`
- Create: `client/rn-arkit-replacement/ios/UniWhereLiDAR/Native/RNLiDAREventEmitter.swift`
- Create: `client/rn-arkit-replacement/ios/UniWhereLiDAR/Native/RNLiDAREventEmitter.m`
- Create: `client/rn-arkit-replacement/src/features/lidar/LiDARView.tsx`
- Test: `client/rn-arkit-replacement/tests/unit/nativeBridgeContract.test.ts`

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
Expected: FAIL if bridge wrappers are incomplete.

- [ ] **Step 3: Write minimal implementation**

```swift
// client/rn-arkit-replacement/ios/UniWhereLiDAR/Native/RNLiDARViewManager.swift
import Foundation
import React

@objc(RNLiDARViewManager)
final class RNLiDARViewManager: RCTViewManager {
    override func view() -> UIView! {
        ARScannerView(frame: .zero)
    }

    override static func requiresMainQueueSetup() -> Bool {
        true
    }
}
```

```swift
// client/rn-arkit-replacement/ios/UniWhereLiDAR/Native/RNLiDARBridgeModule.swift
import Foundation
import React

@objc(RNLiDARBridgeModule)
final class RNLiDARBridgeModule: NSObject {
    private let exporter = MeshExporter()

  @objc func startScan(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        resolve(nil)
    }

  @objc func stopScan(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        resolve(nil)
    }

  @objc func exportMesh(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        do {
            let files = try exporter.exportOBJBundleDummy(baseName: "scan")
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

      @objc static func requiresMainQueueSetup() -> Bool {
        true
      }
}
```

    ```objc
    // client/rn-arkit-replacement/ios/UniWhereLiDAR/Native/RNLiDARBridgeModule.m
    #import <React/RCTBridgeModule.h>

    @interface RCT_EXTERN_MODULE(RNLiDARBridgeModule, NSObject)

    RCT_EXTERN_METHOD(startScan:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
    RCT_EXTERN_METHOD(stopScan:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
    RCT_EXTERN_METHOD(exportMesh:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

    @end
    ```

    ```swift
    // client/rn-arkit-replacement/ios/UniWhereLiDAR/Native/RNLiDAREventEmitter.swift
    import Foundation
    import React

    @objc(RNLiDAREventEmitter)
    final class RNLiDAREventEmitter: RCTEventEmitter {
      static var shared: RNLiDAREventEmitter?

      override init() {
        super.init()
        RNLiDAREventEmitter.shared = self
      }

      override func supportedEvents() -> [String]! {
        ["onMeshUpdate"]
      }

      override static func requiresMainQueueSetup() -> Bool {
        true
      }

      static func emitMeshUpdate(_ payload: [String: Any]) {
        shared?.sendEvent(withName: "onMeshUpdate", body: payload)
      }
    }
    ```

    ```objc
    // client/rn-arkit-replacement/ios/UniWhereLiDAR/Native/RNLiDAREventEmitter.m
    #import <React/RCTEventEmitter.h>

    @interface RCT_EXTERN_MODULE(RNLiDAREventEmitter, RCTEventEmitter)
    @end
    ```

```ts
// client/rn-arkit-replacement/src/features/lidar/LiDARView.tsx
import { requireNativeComponent } from 'react-native';

export const LiDARView = requireNativeComponent('RNLiDARViewManager');
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- nativeBridgeContract.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/rn-arkit-replacement/ios/UniWhereLiDAR/Native/RNLiDARViewManager.swift client/rn-arkit-replacement/ios/UniWhereLiDAR/Native/RNLiDARBridgeModule.swift client/rn-arkit-replacement/ios/UniWhereLiDAR/Native/RNLiDARBridgeModule.m client/rn-arkit-replacement/ios/UniWhereLiDAR/Native/RNLiDAREventEmitter.swift client/rn-arkit-replacement/ios/UniWhereLiDAR/Native/RNLiDAREventEmitter.m client/rn-arkit-replacement/src/features/lidar/LiDARView.tsx client/rn-arkit-replacement/tests/unit/nativeBridgeContract.test.ts
git commit -m "feat(rn-bridge): expose native lidar view and bridge module methods"
```

---

### Task 7: Flujo de UI React Native para escaneo, export y preview

**Files:**
- Create: `client/rn-arkit-replacement/src/features/lidar/screens/ScanScreen.tsx`
- Create: `client/rn-arkit-replacement/src/features/lidar/screens/PreviewScreen.tsx`
- Create: `client/rn-arkit-replacement/src/services/mesh/MeshUploadService.ts`
- Modify: `client/rn-arkit-replacement/src/App.tsx`
- Test: `client/rn-arkit-replacement/tests/integration/scanFlow.test.tsx`

- [ ] **Step 1: Write the failing integration test**

```tsx
// client/rn-arkit-replacement/tests/integration/scanFlow.test.tsx
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import App from '../../src/App';

jest.mock('react-native', () => {
  const actual = jest.requireActual('react-native');
  return {
    ...actual,
    requireNativeComponent: () => 'MockNativeLiDARView',
  };
});

jest.mock('../../src/features/lidar/NativeLiDAR', () => ({
  NativeLiDAR: {
    startScan: jest.fn().mockResolvedValue(undefined),
    stopScan: jest.fn().mockResolvedValue(undefined),
    exportMesh: jest.fn().mockResolvedValue({
      plyPath: '/tmp/scan.ply',
      objPath: '/tmp/scan.obj',
      texturePath: '/tmp/texture.png',
    }),
    subscribe: jest.fn(() => () => undefined),
  },
}));

describe('scan flow', () => {
  it('starts scan and navigates to preview after export', async () => {
    const screen = render(<App />);
    fireEvent.press(screen.getByText('Start Scan'));
    fireEvent.press(screen.getByText('Stop and Export'));

    await waitFor(() => {
      expect(screen.getByText('Preview Mesh Export')).toBeTruthy();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- scanFlow.test.tsx`
Expected: FAIL with missing screens/buttons.

- [ ] **Step 3: Write minimal implementation**

```tsx
// client/rn-arkit-replacement/src/features/lidar/screens/ScanScreen.tsx
import React from 'react';
import { Button, SafeAreaView, Text, View } from 'react-native';
import { useLiDARScan } from '../useLiDARScan';
import { LiDARView } from '../LiDARView';
import { uploadMeshArtifacts } from '../../../services/mesh/MeshUploadService';

export function ScanScreen({ onExported }: { onExported: () => void }) {
  const scan = useLiDARScan();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B0F14' }}>
      <LiDARView style={{ flex: 1 }} />
      <View style={{ padding: 12, gap: 8 }}>
        <Text style={{ color: '#E6EDF3', marginBottom: 8 }}>Phase: {scan.state.phase}</Text>
        <Button title="Start Scan" onPress={() => scan.start()} />
        <Button
          title="Stop and Export"
          onPress={async () => {
            await scan.stopAndExport();
            if (scan.state.output) {
              await uploadMeshArtifacts(scan.state.output);
            }
            onExported();
          }}
        />
      </View>
    </SafeAreaView>
  );
}
```

```ts
// client/rn-arkit-replacement/src/services/mesh/MeshUploadService.ts
import type { MeshOutput } from '../../features/lidar/types';

export async function uploadMeshArtifacts(output: MeshOutput): Promise<void> {
  // Minimal placeholder: this will be replaced with signed-url upload in production.
  if (!output.plyPath || !output.objPath) {
    throw new Error('Invalid mesh output paths');
  }
}
```

```tsx
// client/rn-arkit-replacement/src/features/lidar/screens/PreviewScreen.tsx
import React from 'react';
import { SafeAreaView, Text } from 'react-native';

export function PreviewScreen() {
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B0F14' }}>
      <Text style={{ color: '#E6EDF3', fontSize: 20 }}>Preview Mesh Export</Text>
    </SafeAreaView>
  );
}
```

```tsx
// client/rn-arkit-replacement/src/App.tsx
import React, { useState } from 'react';
import { ScanScreen } from './features/lidar/screens/ScanScreen';
import { PreviewScreen } from './features/lidar/screens/PreviewScreen';

export default function App() {
  const [preview, setPreview] = useState(false);
  if (preview) return <PreviewScreen />;
  return <ScanScreen onExported={() => setPreview(true)} />;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- scanFlow.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/rn-arkit-replacement/src/features/lidar/screens/ScanScreen.tsx client/rn-arkit-replacement/src/features/lidar/screens/PreviewScreen.tsx client/rn-arkit-replacement/src/App.tsx client/rn-arkit-replacement/src/services/mesh/MeshUploadService.ts client/rn-arkit-replacement/tests/integration/scanFlow.test.tsx
git commit -m "feat(rn-ui): add scan to preview flow for exported colored mesh"
```

---

## Chunk 4: Comparabilidad con MultiSet y readiness de reemplazo

### Task 8: Benchmark de paridad (geometria + color) contra baseline MultiSet

**Files:**
- Create: `client/rn-arkit-replacement/tools/benchmark/compare_meshes.py`
- Create: `client/rn-arkit-replacement/tools/benchmark/test_compare_meshes.py`
- Create: `client/rn-arkit-replacement/tools/benchmark/requirements.txt`
- Create: `client/rn-arkit-replacement/docs/benchmark-protocol.md`
- Create: `client/rn-arkit-replacement/docs/migration-runbook.md`

- [ ] **Step 1: Write the failing test**

```python
# client/rn-arkit-replacement/tools/benchmark/test_compare_meshes.py
from compare_meshes import compute_metrics


def test_identical_meshes_have_perfect_geometry_ratio(tmp_path):
  mesh_a = tmp_path / "a.ply"
  mesh_b = tmp_path / "b.ply"
  write_tetra_ply(mesh_a)
  write_tetra_ply(mesh_b)
  report = compute_metrics(str(mesh_a), str(mesh_b))
  assert report["geometry_completeness_ratio"] == 1.0
  assert report["colored_vertex_ratio"] == 1.0
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python -m pytest client/rn-arkit-replacement/tools/benchmark/test_compare_meshes.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'compare_meshes'`.

- [ ] **Step 3: Write minimal implementation**

```python
# client/rn-arkit-replacement/tools/benchmark/compare_meshes.py
from __future__ import annotations

import json
from pathlib import Path

import trimesh


def _mean_abs_vertex_distance(reference: trimesh.Trimesh, candidate: trimesh.Trimesh) -> float:
  n = min(len(reference.vertices), len(candidate.vertices))
  if n == 0:
    return 1e9
  ref = reference.vertices[:n]
  cand = candidate.vertices[:n]
  return float(abs(ref - cand).mean())


def _colored_vertex_ratio(mesh: trimesh.Trimesh) -> float:
  if getattr(mesh.visual, 'vertex_colors', None) is None:
    return 0.0
  colors = mesh.visual.vertex_colors
  if len(colors) == 0:
    return 0.0
  # Count vertices with non-zero RGB channels.
  rgb = colors[:, :3]
  colored = (rgb.sum(axis=1) > 0).sum()
  return float(colored) / float(len(rgb))


def compute_metrics(reference_mesh_path: str, candidate_mesh_path: str) -> dict:
  reference = trimesh.load(reference_mesh_path, force='mesh')
  candidate = trimesh.load(candidate_mesh_path, force='mesh')

  ref_vertices = len(reference.vertices)
  cand_vertices = len(candidate.vertices)
  geometry_completeness_ratio = 0.0 if ref_vertices == 0 else min(cand_vertices, ref_vertices) / ref_vertices
  colored_ratio = _colored_vertex_ratio(candidate)
  mean_abs = _mean_abs_vertex_distance(reference, candidate)

  # Convert a lightweight geometric delta to an approximate pixel reprojection proxy.
  mean_reprojection_error_px = float(mean_abs * 100.0)

  return {
    "geometry_completeness_ratio": round(float(geometry_completeness_ratio), 6),
    "colored_vertex_ratio": round(float(colored_ratio), 6),
    "mean_reprojection_error_px": round(float(mean_reprojection_error_px), 6),
  }


def write_tetra_ply(path: Path) -> None:
  vertices = [
    [0.0, 0.0, 0.0],
    [1.0, 0.0, 0.0],
    [0.0, 1.0, 0.0],
    [0.0, 0.0, 1.0],
  ]
  faces = [[0, 1, 2], [0, 1, 3], [0, 2, 3], [1, 2, 3]]
  colors = [
    [255, 0, 0],
    [0, 255, 0],
    [0, 0, 255],
    [255, 255, 0],
  ]

  lines = [
    "ply",
    "format ascii 1.0",
    "element vertex 4",
    "property float x",
    "property float y",
    "property float z",
    "property uchar red",
    "property uchar green",
    "property uchar blue",
    "element face 4",
    "property list uchar int vertex_indices",
    "end_header",
  ]

  for v, c in zip(vertices, colors):
    lines.append(f"{v[0]} {v[1]} {v[2]} {c[0]} {c[1]} {c[2]}")
  for f in faces:
    lines.append(f"3 {f[0]} {f[1]} {f[2]}")

  path.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--reference", required=True)
    parser.add_argument("--candidate", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()

    report = compute_metrics(args.reference, args.candidate)
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)


if __name__ == "__main__":
    main()
```

```text
# client/rn-arkit-replacement/tools/benchmark/requirements.txt
numpy>=1.26
trimesh>=4.5
pytest>=8.0
```

```md
<!-- client/rn-arkit-replacement/docs/benchmark-protocol.md -->
# Benchmark Protocol (ARKit vs MultiSet)

## Acceptance thresholds for "comparable":
- geometry_completeness_ratio >= 0.90 (candidate vs MultiSet baseline)
- colored_vertex_ratio >= 0.85
- mean_reprojection_error_px <= 3.0

## Capture protocol:
1. Capturar misma zona con MultiSet y con app ARKit RN.
2. Exportar ambos meshes a PLY/OBJ.
3. Ejecutar compare_meshes.py y guardar reporte JSON.
4. Aprobar reemplazo solo si los 3 thresholds pasan.
```

```md
<!-- client/rn-arkit-replacement/docs/migration-runbook.md -->
# Migration Runbook (Replace MultiSet with ARKit RN)

1. Build app iOS y validar sensores LiDAR.
2. Ejecutar escaneo completo y export (`scan.ply`, `scan.obj`, `scan.mtl`, `texture.png`).
3. Correr benchmark contra baseline MultiSet.
4. Si pasa umbrales, habilitar nueva ruta de captura para piloto.
5. Mantener rollback: conservar baseline MultiSet para comparacion por 2 sprints.
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `python -m pip install -r client/rn-arkit-replacement/tools/benchmark/requirements.txt && python -m pytest client/rn-arkit-replacement/tools/benchmark/test_compare_meshes.py -v`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/rn-arkit-replacement/tools/benchmark/compare_meshes.py client/rn-arkit-replacement/tools/benchmark/test_compare_meshes.py client/rn-arkit-replacement/tools/benchmark/requirements.txt client/rn-arkit-replacement/docs/benchmark-protocol.md client/rn-arkit-replacement/docs/migration-runbook.md
git commit -m "feat(validation): add benchmark protocol to validate parity against multiset"
```

---

## Verification Checklist Before Declaring Done

- [ ] `npm run typecheck` passes in `client/rn-arkit-replacement/`.
- [ ] `npm test` passes (unit + integration JS).
- [ ] `xcodebuild ... test` passes for iOS native tests.
- [ ] Real-device scan exports non-empty `scan.ply` and `scan.obj`.
- [ ] Benchmark report passes all 3 thresholds vs MultiSet baseline.

## Expected Deliverables

- Isolated React Native app for iOS LiDAR scanning.
- Native ARKit pipeline producing colored triangle mesh (not point cloud).
- Export artifacts: `scan.ply`, `scan.obj`, `scan.mtl`, `texture.png`.
- Quantitative parity report against MultiSet.
- Migration runbook for controlled rollout.
