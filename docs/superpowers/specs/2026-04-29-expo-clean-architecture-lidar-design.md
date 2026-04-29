# Expo Dev Client + Clean Architecture for LiDAR (In-Place) Design

Date: 2026-04-29

## Goal
Convert client/rn-arkit-replacement into an Expo Dev Client app in place, preserve native ARKit bridges, and restructure LiDAR into a clean architecture schema identical to the reference repo (feature-first with data/domain/presentation).

## Scope and Constraints
- Keep all work inside client/rn-arkit-replacement.
- Preserve ios/ native code and React Native bridges for ARKit.
- Do not break existing core LiDAR features and scan flow.
- Use the same feature-first schema: features/<feature>/{data,domain,presentation}.

## Architecture Overview
- Expo provides tooling and compatibility (dev client + prebuild), while native iOS code remains intact.
- Clean architecture enforces strict layer boundaries.
- Dependency injection lives in core/di and is consumed by presentation.

## Target Folder Structure

```
client/rn-arkit-replacement/
  app.json (or app.config.ts)
  index.tsx
  ios/
  src/
    core/
      di/
      local/
    theme/
    features/
      lidar/
        domain/
        data/
        presentation/
```

Notes:
- Existing LiDAR code moves into features/lidar and is split by layer.
- Native modules stay in ios/ and are referenced only by data layer.

## Dependency Rules (Clean Architecture)
- domain: pure types and interfaces, no React Native or Expo imports.
- data: implements domain interfaces, depends on domain only.
- presentation: UI, hooks, and navigation, depends on domain + DI tokens.
- core/di: creates container and binds data implementations to domain interfaces.

## Expo Integration (Dev Client + Prebuild)
- Add Expo SDK and expo-dev-client to package.json for the app.
- Add app.json or app.config.ts with name/slug, ios.bundleIdentifier, scheme, and infoPlist camera permissions.
- Use registerRootComponent in index.tsx for Expo entrypoint.
- Provide scripts:
  - expo start --dev-client
  - expo prebuild
  - expo run:ios
- Keep ios/ as source of truth; prebuild only when needed and review changes.

## LiDAR Feature Restructure (High-Level)
- domain: ScanPhase, ScanState, MeshOutput, and repository interfaces.
- data: NativeLiDAR bridge wrapper, mesh export and upload implementations.
- presentation: screens, hooks for UI state, and view components.
- DI container wires domain interfaces to data implementations.

## Testing and Validation
- JS: Jest smoke test for App, and scan flow test with bridge mocks.
- Architecture: contract tests to ensure presentation does not import data/bridge directly.
- Typecheck: tsc --noEmit.
- Runtime: expo start --dev-client for manual validation.
- Native iOS tests remain unchanged.

## Risks and Mitigations
- Expo prebuild may overwrite ios changes: run only when required and review diffs.
- Dependency version mismatches: use expo install where applicable.
- Bridging regressions: keep module names and native exports unchanged.
