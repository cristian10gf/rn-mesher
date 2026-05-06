import Foundation
import simd
#if canImport(ARKit)
import ARKit
#endif

struct ColoredVertex {
    var position: SIMD3<Float>
    var normal: SIMD3<Float>
    var color: SIMD3<Float> = SIMD3<Float>(0, 0, 0)
    var observations: Int = 0
}

struct MeshSnapshot {
    var vertices: [ColoredVertex]
    var indices: [UInt32]
}

struct ReconstructedMesh {
    var vertices: [SIMD3<Float>]
    var faces: [SIMD3<UInt32>]
    var normals: [SIMD3<Float>]
}

struct MeshChunk {
    var vertices: [SIMD3<Float>]
    var faces: [SIMD3<UInt32>]
    var normals: [SIMD3<Float>]
}

private struct StoredChunk {
    let vertices: [SIMD3<Float>]
    let faces: [SIMD3<UInt32>]
    let normals: [SIMD3<Float>]
}

final class MeshReconstructor {
    private var chunksByAnchor: [UUID: StoredChunk] = [:]
    private let lock = NSLock()

    func reset() {
        lock.lock()
        defer { lock.unlock() }
        chunksByAnchor.removeAll(keepingCapacity: true)
    }

    func remove(anchorID: UUID) {
        lock.lock()
        defer { lock.unlock() }
        chunksByAnchor.removeValue(forKey: anchorID)
    }

    func consume(chunk: MeshChunk, transform: simd_float4x4, anchorID: UUID = UUID()) {
        let worldVertices = chunk.vertices.map { transformPoint($0, transform: transform) }
        let worldNormals = chunk.normals.map { transformNormal($0, transform: transform) }
        lock.lock()
        defer { lock.unlock() }
        chunksByAnchor[anchorID] = StoredChunk(vertices: worldVertices, faces: chunk.faces, normals: worldNormals)
    }

    #if canImport(ARKit)
    func consume(anchor: ARMeshAnchor) {
        let chunk = extractChunk(from: anchor.geometry)
        consume(chunk: chunk, transform: anchor.transform, anchorID: anchor.identifier)
    }
    #endif

    func buildMesh() -> ReconstructedMesh {
        lock.lock()
        let snapshot = chunksByAnchor
        lock.unlock()
        let orderedKeys = snapshot.keys.sorted { $0.uuidString < $1.uuidString }

        var aggregateVertices: [SIMD3<Float>] = []
        var aggregateNormals: [SIMD3<Float>] = []
        var aggregateFaces: [SIMD3<UInt32>] = []
        var offset: UInt32 = 0

        for key in orderedKeys {
            guard let chunk = snapshot[key] else {
                continue
            }

            aggregateVertices.append(contentsOf: chunk.vertices)
            aggregateNormals.append(contentsOf: chunk.normals)

            let shiftedFaces = chunk.faces.map { face in
                SIMD3<UInt32>(face.x + offset, face.y + offset, face.z + offset)
            }
            aggregateFaces.append(contentsOf: shiftedFaces)
            offset += UInt32(chunk.vertices.count)
        }

        return ReconstructedMesh(vertices: aggregateVertices, faces: aggregateFaces, normals: aggregateNormals)
    }

    func snapshot() -> MeshSnapshot {
        let mesh = buildMesh()
        let colored = mesh.vertices.enumerated().map { index, vertex in
            let normal = index < mesh.normals.count ? mesh.normals[index] : SIMD3<Float>(0, 1, 0)
            return ColoredVertex(position: vertex, normal: normal)
        }
        let flatIndices = mesh.faces.flatMap { [$0.x, $0.y, $0.z] }
        return MeshSnapshot(vertices: colored, indices: flatIndices)
    }

    private func transformPoint(_ point: SIMD3<Float>, transform: simd_float4x4) -> SIMD3<Float> {
        let homogeneous = SIMD4<Float>(point.x, point.y, point.z, 1)
        let world = transform * homogeneous
        return SIMD3<Float>(world.x, world.y, world.z)
    }

    private func transformNormal(_ normal: SIMD3<Float>, transform: simd_float4x4) -> SIMD3<Float> {
        let upperLeft = simd_float3x3(transform)
        let transformed = upperLeft * normal
        return simd_normalize(transformed)
    }

    #if canImport(ARKit)
    private func extractChunk(from geometry: ARMeshGeometry) -> MeshChunk {
        let vertices = readVertices(from: geometry.vertices)
        let faces = readFaces(from: geometry.faces)
        let normals = readVertices(from: geometry.normals)
        return MeshChunk(vertices: vertices, faces: faces, normals: normals)
    }

    private func readVertices(from source: ARGeometrySource) -> [SIMD3<Float>] {
        let stride = source.stride
        let offset = source.offset
        let count = source.count
        let start = source.buffer.contents().advanced(by: offset)
        var result: [SIMD3<Float>] = []
        result.reserveCapacity(count)

        for index in 0..<count {
            let pointer = start.advanced(by: index * stride).assumingMemoryBound(to: SIMD3<Float>.self)
            result.append(pointer.pointee)
        }

        return result
    }

    private func readFaces(from source: ARGeometryElement) -> [SIMD3<UInt32>] {
        let count = source.count
        let bytesPerIndex = source.bytesPerIndex
        guard bytesPerIndex == 2 || bytesPerIndex == 4 else {
            assertionFailure("Unsupported bytesPerIndex: \(bytesPerIndex)")
            return []
        }
        let stride = source.indexCountPerPrimitive * bytesPerIndex
        let start = source.buffer.contents().advanced(by: source.offset)
        var result: [SIMD3<UInt32>] = []
        result.reserveCapacity(count)

        for index in 0..<count {
            let pointer = start.advanced(by: index * stride)
            let i0 = readIndex(pointer, bytesPerIndex: bytesPerIndex)
            let i1 = readIndex(pointer.advanced(by: bytesPerIndex), bytesPerIndex: bytesPerIndex)
            let i2 = readIndex(pointer.advanced(by: bytesPerIndex * 2), bytesPerIndex: bytesPerIndex)
            result.append(SIMD3<UInt32>(i0, i1, i2))
        }

        return result
    }

    private func readIndex(_ pointer: UnsafeMutableRawPointer, bytesPerIndex: Int) -> UInt32 {
        switch bytesPerIndex {
        case 2:
            return UInt32(pointer.assumingMemoryBound(to: UInt16.self).pointee)
        case 4:
            return pointer.assumingMemoryBound(to: UInt32.self).pointee
        default:
            return 0
        }
    }
    #endif
}
