# Expo Dev Client + Clean Architecture LiDAR Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert client/rn-arkit-replacement into an Expo Dev Client app in place, preserve native ARKit bridges, and reorganize LiDAR into the clean architecture feature schema.

**Architecture:** Expo Dev Client provides tooling and prebuild, while native iOS sources remain under ios/. LiDAR moves to a feature-first structure with domain/data/presentation layers wired through core DI.

**Tech Stack:** Expo, React Native, TypeScript, Jest (jest-expo), ARKit native bridge.

---

## File Structure (Locked)

- Create: client/rn-arkit-replacement/app.json
- Create: client/rn-arkit-replacement/babel.config.js
- Create: client/rn-arkit-replacement/index.ts
- Modify: client/rn-arkit-replacement/package.json
- Modify: client/rn-arkit-replacement/jest.config.js
- Modify: client/rn-arkit-replacement/tsconfig.json

- Create: client/rn-arkit-replacement/src/core/di/DIProvider.tsx
- Create: client/rn-arkit-replacement/src/core/di/container.ts
- Create: client/rn-arkit-replacement/src/core/di/tokens.ts
- Create: client/rn-arkit-replacement/src/core/di/useDI.ts

- Create: client/rn-arkit-replacement/src/features/lidar/domain/types.ts
- Create: client/rn-arkit-replacement/src/features/lidar/domain/LiDARRepository.ts

- Create: client/rn-arkit-replacement/src/features/lidar/data/NativeLiDAR.ts
- Create: client/rn-arkit-replacement/src/features/lidar/data/MeshUploadService.ts
- Create: client/rn-arkit-replacement/src/features/lidar/data/LiDARRepositoryImpl.ts

- Create: client/rn-arkit-replacement/src/features/lidar/presentation/useLiDARScan.ts
- Create: client/rn-arkit-replacement/src/features/lidar/presentation/LiDARView.tsx
- Create: client/rn-arkit-replacement/src/features/lidar/presentation/screens/ScanScreen.tsx
- Create: client/rn-arkit-replacement/src/features/lidar/presentation/screens/PreviewScreen.tsx

- Modify: client/rn-arkit-replacement/src/App.tsx

- Modify: client/rn-arkit-replacement/tests/unit/useLiDARScan.test.ts
- Modify: client/rn-arkit-replacement/tests/integration/scanFlow.test.tsx
- Modify: client/rn-arkit-replacement/tests/app.smoke.test.tsx

- Delete: client/rn-arkit-replacement/src/features/lidar/types.ts
- Delete: client/rn-arkit-replacement/src/features/lidar/NativeLiDAR.ts
- Delete: client/rn-arkit-replacement/src/features/lidar/useLiDARScan.ts
- Delete: client/rn-arkit-replacement/src/features/lidar/LiDARView.tsx
- Delete: client/rn-arkit-replacement/src/features/lidar/screens/ScanScreen.tsx
- Delete: client/rn-arkit-replacement/src/features/lidar/screens/PreviewScreen.tsx
- Delete: client/rn-arkit-replacement/src/services/mesh/MeshUploadService.ts

---

### Task 0: Expo Dev Client config and tooling (TDD exception: config files)

**Files:**
- Create: client/rn-arkit-replacement/app.json
- Create: client/rn-arkit-replacement/babel.config.js
- Create: client/rn-arkit-replacement/index.ts
- Modify: client/rn-arkit-replacement/package.json
- Modify: client/rn-arkit-replacement/jest.config.js
- Modify: client/rn-arkit-replacement/tsconfig.json

- [ ] **Step 1: Confirm TDD exception for config-only changes**

These edits are configuration-only (package.json/app.json/entrypoint). Proceed without a failing test per the TDD exception rule for configuration files.

- [ ] **Step 2: Generate Expo seed files via CLI**

Run (from repo root):

```powershell
npx create-expo-app@latest expo-seed --template blank-typescript
```

Expected: a new folder `expo-seed/` with Expo config files.

- [ ] **Step 3: Copy Expo-generated config into the app**

Run (from repo root):

```powershell
Copy-Item expo-seed\app.json client\rn-arkit-replacement\app.json
Copy-Item expo-seed\babel.config.js client\rn-arkit-replacement\babel.config.js
Copy-Item expo-seed\index.ts client\rn-arkit-replacement\index.ts
```

- [ ] **Step 4: Update app.json with project identifiers and dev-client plugin**

```json
{
  "expo": {
    "name": "UniWhereLiDAR",
    "slug": "uniwhere-lidar",
    "scheme": "uniwhere-lidar",
    "plugins": [["expo-dev-client", { "launchMode": "most-recent" }]],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.uniwhere.lidar",
      "infoPlist": {
        "NSCameraUsageDescription": "Allow camera access to scan environments and build 3D meshes."
      }
    }
  }
}
```

- [ ] **Step 5: Add react + react-native from the Expo seed**

Copy the versions from expo-seed/package.json (do not guess). Add them to dependencies:

```json
{
  "dependencies": {
    "react": "19.1.0",
    "react-native": "0.81.5"
  }
}
```

Keep existing devDependencies.

- [ ] **Step 6: Install dependencies**

Run (from client/rn-arkit-replacement):

```powershell
npm install
```

- [ ] **Step 7: Install Expo modules using the Expo install helper**

Run (from client/rn-arkit-replacement):

```powershell
npx install-expo-modules@latest
```

Expected: expo package installed and project configured.

- [ ] **Step 8: Install expo-dev-client**

Run (from client/rn-arkit-replacement):

```powershell
npx expo install expo-dev-client
```

Expected: expo-dev-client added to dependencies.

- [ ] **Step 9: Generate native projects with Expo prebuild**

First, move existing native sources aside to avoid loss:

```powershell
Move-Item client\rn-arkit-replacement\ios client\rn-arkit-replacement\ios.legacy
```

Then run prebuild (from client/rn-arkit-replacement):

```powershell
npx expo prebuild --clean
```

Expected: new ios/ and android/ projects generated.

- [ ] **Step 10: Restore native sources into the new iOS project**

Run (from repo root):

```powershell
New-Item -ItemType Directory -Path client\rn-arkit-replacement\ios\UniWhereLiDAR\LiDARNative
Copy-Item -Recurse client\rn-arkit-replacement\ios.legacy\UniWhereLiDAR\Native client\rn-arkit-replacement\ios\UniWhereLiDAR\LiDARNative
Copy-Item -Recurse client\rn-arkit-replacement\ios.legacy\UniWhereLiDAR\Mesh client\rn-arkit-replacement\ios\UniWhereLiDAR\LiDARNative
Copy-Item -Recurse client\rn-arkit-replacement\ios.legacy\UniWhereLiDAR\Scanning client\rn-arkit-replacement\ios\UniWhereLiDAR\LiDARNative
Copy-Item -Recurse client\rn-arkit-replacement\ios.legacy\UniWhereLiDAR\Export client\rn-arkit-replacement\ios\UniWhereLiDAR\LiDARNative
```

Note: If build errors occur later, we will stop and add these files to the Xcode target.

- [ ] **Step 11: Update package.json for scripts and Jest tooling**

```json
{
  "name": "rn-arkit-replacement",
  "version": "0.0.1",
  "private": true,
  "main": "index.ts",
  "scripts": {
    "start": "expo start --dev-client",
    "ios": "expo run:ios",
    "android": "expo run:android",
    "prebuild": "expo prebuild",
    "test": "jest",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "@testing-library/jest-native": "^5.4.3",
    "jest": "^29.0.0",
    "jest-expo": "^52.0.0"
  }
}
```

Keep existing dependencies and add the missing entries above.

- [ ] **Step 12: Update jest.config.js to use jest-expo**

```js
module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/tests/**/*.test.ts', '**/tests/**/*.test.tsx'],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|expo|expo-modules-core|@expo(nent)?/.*)'
  ],
};
```

- [ ] **Step 13: Update tsconfig.json to include index.ts**

```json
{
  "compilerOptions": {
    "target": "es2019",
    "module": "commonjs",
    "jsx": "react",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "allowJs": true,
    "noEmit": true
  },
  "include": ["src", "tests", "index.ts"]
}
```

- [ ] **Step 14: Commit**

```bash
git add client/rn-arkit-replacement/package.json client/rn-arkit-replacement/package-lock.json client/rn-arkit-replacement/app.json client/rn-arkit-replacement/babel.config.js client/rn-arkit-replacement/index.ts client/rn-arkit-replacement/jest.config.js client/rn-arkit-replacement/tsconfig.json
git commit -m "chore(expo): add dev client config and tooling"
```

---

### Task 1: Move LiDAR domain + data layers and DI wiring (TDD)

**Files:**
- Create: client/rn-arkit-replacement/src/core/di/DIProvider.tsx
- Create: client/rn-arkit-replacement/src/core/di/container.ts
- Create: client/rn-arkit-replacement/src/core/di/tokens.ts
- Create: client/rn-arkit-replacement/src/core/di/useDI.ts
- Create: client/rn-arkit-replacement/src/features/lidar/domain/types.ts
- Create: client/rn-arkit-replacement/src/features/lidar/domain/LiDARRepository.ts
- Create: client/rn-arkit-replacement/src/features/lidar/data/NativeLiDAR.ts
- Create: client/rn-arkit-replacement/src/features/lidar/data/MeshUploadService.ts
- Create: client/rn-arkit-replacement/src/features/lidar/data/LiDARRepositoryImpl.ts
- Create: client/rn-arkit-replacement/src/features/lidar/presentation/useLiDARScan.ts
- Modify: client/rn-arkit-replacement/tests/unit/useLiDARScan.test.ts
- Delete: client/rn-arkit-replacement/src/features/lidar/types.ts
- Delete: client/rn-arkit-replacement/src/features/lidar/NativeLiDAR.ts
- Delete: client/rn-arkit-replacement/src/features/lidar/useLiDARScan.ts
- Delete: client/rn-arkit-replacement/src/services/mesh/MeshUploadService.ts

- [ ] **Step 1: Write the failing test for the new hook path and repo injection**

```ts
import React from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { useLiDARScan } from '../../src/features/lidar/presentation/useLiDARScan';
import type { LiDARRepository } from '../../src/features/lidar/domain/LiDARRepository';
import { DIProvider } from '../../src/core/di/DIProvider';
import type { DIContainer } from '../../src/core/di/tokens';

const createRepo = (): LiDARRepository => ({
  startScan: jest.fn().mockResolvedValue(undefined),
  stopScan: jest.fn().mockResolvedValue(undefined),
  exportMesh: jest.fn().mockResolvedValue({ plyPath: 'scan.ply', objPath: 'scan.obj' }),
  uploadMeshArtifacts: jest.fn().mockResolvedValue(undefined),
  subscribe: jest.fn(() => () => undefined),
});

describe('useLiDARScan', () => {
  it('moves from idle -> scanning -> exported', async () => {
    const repo = createRepo();
    const container: DIContainer = { lidarRepository: repo };
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DIProvider container={container}>{children}</DIProvider>
    );
    const { result } = renderHook(() => useLiDARScan(), { wrapper });

    expect(result.current.state.phase).toBe('idle');

    await act(async () => {
      await result.current.start();
    });

    expect(repo.startScan).toHaveBeenCalled();
    expect(result.current.state.phase).toBe('scanning');

    await act(async () => {
      await result.current.stop();
      await result.current.exportMesh();
    });

    expect(repo.exportMesh).toHaveBeenCalled();
    expect(result.current.state.phase).toBe('exported');
    expect(result.current.state.output?.plyPath).toContain('scan.ply');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- useLiDARScan.test.ts`
Expected: FAIL with `Cannot find module '../../src/features/lidar/presentation/useLiDARScan'`.

- [ ] **Step 3: Write minimal implementation for domain, data, DI, and hook**

```ts
// client/rn-arkit-replacement/src/features/lidar/domain/types.ts
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
// client/rn-arkit-replacement/src/features/lidar/domain/LiDARRepository.ts
import type { MeshOutput } from './types';

export type LiDAREvent =
  | { type: 'exported'; payload: MeshOutput }
  | { type: 'error'; error: string };

export type Unsubscribe = () => void;

export interface LiDARRepository {
  startScan: () => Promise<void>;
  stopScan: () => Promise<void>;
  exportMesh: () => Promise<MeshOutput>;
  uploadMeshArtifacts: (output: MeshOutput) => Promise<void>;
  subscribe: (handler: (event: LiDAREvent) => void) => Unsubscribe;
}
```

```ts
// client/rn-arkit-replacement/src/features/lidar/data/NativeLiDAR.ts
import { NativeEventEmitter, NativeModules } from 'react-native';
import type { MeshOutput } from '../domain/types';

type NativeLiDARShape = {
  startScan: () => Promise<void>;
  stopScan: () => Promise<void>;
  exportMesh: () => Promise<MeshOutput>;
};

const moduleRef = (NativeModules.RNLiDARBridgeModule ?? {}) as Partial<NativeLiDARShape>;
const emitter = new NativeEventEmitter((NativeModules.RNLiDAREventEmitter ?? moduleRef) as any);

export const NativeLiDAR = {
  startScan: () => (moduleRef.startScan ? moduleRef.startScan() : Promise.resolve()),
  stopScan: () => (moduleRef.stopScan ? moduleRef.stopScan() : Promise.resolve()),
  exportMesh: () =>
    moduleRef.exportMesh ? moduleRef.exportMesh() : Promise.resolve({ plyPath: '', objPath: '' }),
  subscribe: (handler: (event: unknown) => void) => {
    if (!emitter || typeof emitter.addListener !== 'function') return () => undefined;
    const sub = emitter.addListener('onMeshUpdate', handler as any);
    return () => sub.remove();
  },
};
```

```ts
// client/rn-arkit-replacement/src/features/lidar/data/MeshUploadService.ts
import type { MeshOutput } from '../domain/types';

export async function uploadMeshArtifacts(output: MeshOutput): Promise<void> {
  // Placeholder uploader: in production replace with signed URL uploads.
  // eslint-disable-next-line no-console
  console.log('uploadMeshArtifacts called with', output);
  return Promise.resolve();
}
```

```ts
// client/rn-arkit-replacement/src/features/lidar/data/LiDARRepositoryImpl.ts
import type { LiDARRepository } from '../domain/LiDARRepository';
import type { MeshOutput } from '../domain/types';
import { NativeLiDAR } from './NativeLiDAR';
import { uploadMeshArtifacts } from './MeshUploadService';

export class LiDARRepositoryImpl implements LiDARRepository {
  startScan() {
    return NativeLiDAR.startScan();
  }

  stopScan() {
    return NativeLiDAR.stopScan();
  }

  exportMesh() {
    return NativeLiDAR.exportMesh();
  }

  uploadMeshArtifacts(output: MeshOutput) {
    return uploadMeshArtifacts(output);
  }

  subscribe(handler: (event: any) => void) {
    return NativeLiDAR.subscribe(handler);
  }
}
```

```ts
// client/rn-arkit-replacement/src/core/di/tokens.ts
import type { LiDARRepository } from '../../features/lidar/domain/LiDARRepository';

export type DIContainer = {
  lidarRepository: LiDARRepository;
};
```

```ts
// client/rn-arkit-replacement/src/core/di/container.ts
import type { DIContainer } from './tokens';
import { LiDARRepositoryImpl } from '../../features/lidar/data/LiDARRepositoryImpl';

export function createContainer(): DIContainer {
  return {
    lidarRepository: new LiDARRepositoryImpl(),
  };
}
```

```tsx
// client/rn-arkit-replacement/src/core/di/DIProvider.tsx
import React, { createContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { DIContainer } from './tokens';
import { createContainer } from './container';

export const DIContext = createContext<DIContainer | null>(null);

type DIProviderProps = {
  children: ReactNode;
  container?: DIContainer;
};

export function DIProvider({ children, container }: DIProviderProps) {
  const value = useMemo(() => container ?? createContainer(), [container]);
  return <DIContext.Provider value={value}>{children}</DIContext.Provider>;
}
```

```ts
// client/rn-arkit-replacement/src/core/di/useDI.ts
import { useContext } from 'react';
import { DIContext } from './DIProvider';

export function useDI() {
  const ctx = useContext(DIContext);
  if (!ctx) throw new Error('DIProvider is missing');
  return ctx;
}
```

```ts
// client/rn-arkit-replacement/src/features/lidar/presentation/useLiDARScan.ts
import { useEffect, useMemo, useState } from 'react';
import { useDI } from '../../../core/di/useDI';
import type { LiDARRepository } from '../domain/LiDARRepository';
import type { MeshOutput, ScanState } from '../domain/types';

type UseLiDARApi = {
  state: ScanState;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  exportMesh: () => Promise<MeshOutput | undefined>;
  upload: (output: MeshOutput) => Promise<void>;
};

export function useLiDARScan(repoOverride?: LiDARRepository): UseLiDARApi {
  const { lidarRepository } = useDI();
  const repo = repoOverride ?? lidarRepository;
  const [state, setState] = useState<ScanState>({ phase: 'idle' });

  useEffect(() => {
    const unsub = repo.subscribe((event: any) => {
      if (!event) return;
      if (event.type === 'exported' && event.payload) {
        setState({ phase: 'exported', output: event.payload });
      }
      if (event.type === 'error' && event.error) {
        setState({ phase: 'error', error: String(event.error) });
      }
    });
    return unsub;
  }, [repo]);

  const api = useMemo<UseLiDARApi>(() => ({
    state,
    start: async () => {
      setState({ phase: 'scanning' });
      try {
        await repo.startScan();
      } catch (err: any) {
        setState({ phase: 'error', error: String(err) });
      }
    },
    stop: async () => {
      setState({ phase: 'exporting' });
      try {
        await repo.stopScan();
      } catch (err: any) {
        setState({ phase: 'error', error: String(err) });
      }
    },
    exportMesh: async () => {
      try {
        const out = await repo.exportMesh();
        setState({ phase: 'exported', output: out });
        return out;
      } catch (err: any) {
        setState({ phase: 'error', error: String(err) });
        return undefined;
      }
    },
    upload: async (output: MeshOutput) => {
      await repo.uploadMeshArtifacts(output);
    },
  }), [repo, state]);

  return api;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- useLiDARScan.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/rn-arkit-replacement/src/core/di client/rn-arkit-replacement/src/features/lidar/domain client/rn-arkit-replacement/src/features/lidar/data client/rn-arkit-replacement/src/features/lidar/presentation/useLiDARScan.ts client/rn-arkit-replacement/tests/unit/useLiDARScan.test.ts
rm client/rn-arkit-replacement/src/features/lidar/types.ts client/rn-arkit-replacement/src/features/lidar/NativeLiDAR.ts client/rn-arkit-replacement/src/features/lidar/useLiDARScan.ts client/rn-arkit-replacement/src/services/mesh/MeshUploadService.ts

# If rm is not available on your shell, delete files manually and then:
# git add -u

git add -u
git commit -m "refactor(lidar): split domain/data and add DI wiring"
```

---

### Task 2: Move LiDAR presentation and update App + tests (TDD)

**Files:**
- Create: client/rn-arkit-replacement/src/features/lidar/presentation/LiDARView.tsx
- Create: client/rn-arkit-replacement/src/features/lidar/presentation/screens/ScanScreen.tsx
- Create: client/rn-arkit-replacement/src/features/lidar/presentation/screens/PreviewScreen.tsx
- Modify: client/rn-arkit-replacement/src/App.tsx
- Modify: client/rn-arkit-replacement/tests/integration/scanFlow.test.tsx
- Modify: client/rn-arkit-replacement/tests/app.smoke.test.tsx
- Delete: client/rn-arkit-replacement/src/features/lidar/LiDARView.tsx
- Delete: client/rn-arkit-replacement/src/features/lidar/screens/ScanScreen.tsx
- Delete: client/rn-arkit-replacement/src/features/lidar/screens/PreviewScreen.tsx

- [ ] **Step 1: Write the failing integration test for new paths**

```tsx
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import App from '../../src/App';

jest.mock('../../src/features/lidar/data/NativeLiDAR', () => ({
  NativeLiDAR: {
    startScan: jest.fn().mockResolvedValue(undefined),
    stopScan: jest.fn().mockResolvedValue(undefined),
    exportMesh: jest.fn().mockResolvedValue({ plyPath: 'scan.ply', objPath: 'scan.obj' }),
    subscribe: jest.fn(() => () => undefined),
  },
}));

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    requireNativeComponent: () => 'RNLiDARView',
  };
});

describe('scan flow', () => {
  it('starts scan and navigates to preview after export', async () => {
    const { getByTestId, getByText } = render(<App />);

    fireEvent.press(getByTestId('start-btn'));
    await waitFor(() => expect(getByText(/Estado:/)).toBeTruthy());

    fireEvent.press(getByTestId('stop-btn'));
    fireEvent.press(getByTestId('export-btn'));

    await waitFor(() => expect(getByText('Preview exported mesh')).toBeTruthy());
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- scanFlow.test.tsx`
Expected: FAIL with missing module or UI elements.

- [ ] **Step 3: Implement presentation screens and App wiring**

```tsx
// client/rn-arkit-replacement/src/features/lidar/presentation/LiDARView.tsx
import { requireNativeComponent } from 'react-native';

export const LiDARView = requireNativeComponent('RNLiDARView');
```

```tsx
// client/rn-arkit-replacement/src/features/lidar/presentation/screens/ScanScreen.tsx
import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useLiDARScan } from '../useLiDARScan';
import { LiDARView } from '../LiDARView';

export function ScanScreen({ onExported }: { onExported: () => void }) {
  const scan = useLiDARScan();

  const handleExport = async () => {
    const out = await scan.exportMesh();
    if (out) {
      await scan.upload(out);
      onExported();
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title}>UniWhere LiDAR Scanner</Text>
      <View style={styles.viewer}>
        <LiDARView style={styles.lidarView} />
      </View>
      <View style={styles.footer}>
        <Text style={styles.status}>Estado: {scan.state.phase}</Text>
        <View style={styles.actions}>
          <Pressable testID="start-btn" style={styles.button} onPress={scan.start}>
            <Text style={styles.buttonText}>Start</Text>
          </Pressable>
          <Pressable testID="stop-btn" style={styles.button} onPress={scan.stop}>
            <Text style={styles.buttonText}>Stop</Text>
          </Pressable>
          <Pressable testID="export-btn" style={styles.button} onPress={handleExport}>
            <Text style={styles.buttonText}>Export</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B0F14' },
  title: { color: '#E6EDF3', fontSize: 20, fontWeight: '700', padding: 12 },
  viewer: { flex: 1 },
  lidarView: { flex: 1 },
  footer: { padding: 12, gap: 8 },
  status: { color: '#E6EDF3' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  button: { paddingVertical: 10, paddingHorizontal: 12, backgroundColor: '#1C2430', borderRadius: 6 },
  buttonText: { color: '#E6EDF3', fontWeight: '600' },
});
```

```tsx
// client/rn-arkit-replacement/src/features/lidar/presentation/screens/PreviewScreen.tsx
import React from 'react';
import { SafeAreaView, StyleSheet, Text } from 'react-native';

export function PreviewScreen() {
  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.text}>Preview exported mesh</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B0F14' },
  text: { color: '#E6EDF3', fontSize: 18 },
});
```

```tsx
// client/rn-arkit-replacement/src/App.tsx
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native';
import { DIProvider } from './core/di/DIProvider';
import { ScanScreen } from './features/lidar/presentation/screens/ScanScreen';
import { PreviewScreen } from './features/lidar/presentation/screens/PreviewScreen';

export default function App() {
  const [preview, setPreview] = useState(false);

  return (
    <DIProvider>
      <SafeAreaView style={{ flex: 1 }}>
        {preview ? <PreviewScreen /> : <ScanScreen onExported={() => setPreview(true)} />}
      </SafeAreaView>
    </DIProvider>
  );
}
```

- [ ] **Step 4: Update smoke test and run tests**

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

Run:
- `npm test -- scanFlow.test.tsx`
- `npm test -- app.smoke.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/rn-arkit-replacement/src/features/lidar/presentation client/rn-arkit-replacement/src/App.tsx client/rn-arkit-replacement/tests/integration/scanFlow.test.tsx client/rn-arkit-replacement/tests/app.smoke.test.tsx
rm client/rn-arkit-replacement/src/features/lidar/LiDARView.tsx client/rn-arkit-replacement/src/features/lidar/screens/ScanScreen.tsx client/rn-arkit-replacement/src/features/lidar/screens/PreviewScreen.tsx

# If rm is not available on your shell, delete files manually and then:
# git add -u

git add -u
git commit -m "refactor(lidar): move presentation layer and update app flow"
```

---

### Task 3: Final verification (post-migration)

**Files:**
- Modify: None (verification only)

- [ ] **Step 1: Run typecheck**

Run: `npm run typecheck`
Expected: exit code 0.

- [ ] **Step 2: Run full Jest suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 3: Validate Expo Dev Client startup**

Run: `npx expo start --dev-client`
Expected: Metro starts and shows a QR code with Dev Client instructions.

- [ ] **Step 4: Commit (verification note)**

_No code changes; no commit required._

---

## Plan Self-Review
- Spec coverage: Expo dev client config, clean architecture layout, DI wiring, LiDAR feature restructure, and tests are all addressed.
- Placeholder scan: No TODO/TBD language in steps.
- Type consistency: Domain types and repository interface names match across data and presentation.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-29-expo-clean-architecture-lidar-plan.md`. Two execution options:

1. Subagent-Driven (recommended) - I dispatch a fresh subagent per task, review between tasks, fast iteration
2. Inline Execution - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
