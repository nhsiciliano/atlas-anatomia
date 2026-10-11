'use client';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { CameraControls, ContactShadows, Environment, Html, Lightformer, useGLTF, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import { SYSTEMS, SYSTEM_MAP, type SystemId, type ViewId } from '@/data/systems';
import { STRUCTURE_MAP } from '@/data/anatomy-data';
import { useAtlasStore } from '@/lib/store';
import { useLocale } from '@/lib/i18n';
import { hasModel3D, modelUrl } from '@/lib/models3d';

const TARGET = new THREE.Vector3(0, 0.82, 0);
const DIST = 4.3;
const AMBER = new THREE.Color('#E8B66B');
const BLACK = new THREE.Color('#000000');

const VIEW_POS: Record<ViewId, [number, number, number]> = {
  anterior: [0, 0.95, DIST],
  posterior: [0, 0.95, -DIST],
  lateral: [-DIST, 0.95, 0], // patient's right side (BodyParts3D: right = -X)
};

// Per-system material character: bone is matte, organs are wet and glossy, skin is glass.
const MATERIAL: Partial<Record<SystemId, { roughness: number; clearcoat: number; sheen?: number }>> = {
  esqueletico: { roughness: 0.62, clearcoat: 0.15 },
  muscular: { roughness: 0.48, clearcoat: 0.35, sheen: 0.4 },
  nervioso: { roughness: 0.45, clearcoat: 0.4 },
  cardiovascular: { roughness: 0.32, clearcoat: 0.7 },
  respiratorio: { roughness: 0.55, clearcoat: 0.3, sheen: 0.6 },
  digestivo: { roughness: 0.38, clearcoat: 0.6 },
};

type MeshEntry = { id: string; geometry: THREE.BufferGeometry; context: boolean };

function useSystemMeshes(url: string): MeshEntry[] {
  const gltf = useGLTF(url);
  return useMemo(() => {
    const out: MeshEntry[] = [];
    gltf.scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const g = mesh.geometry as THREE.BufferGeometry;
      if (!g.attributes.normal) g.computeVertexNormals();
      if (!g.boundingSphere) g.computeBoundingSphere();
      const id = (mesh.name || g.name || '').replace(/_\d+$/, '');
      out.push({ id, geometry: g, context: id.startsWith('ctx__') });
    });
    return out;
  }, [gltf]);
}

function StructureMesh({ entry, sysId, opacity, interactive, skinVisibleOnly }: {
  entry: MeshEntry; sysId: SystemId; opacity: number; interactive: boolean; skinVisibleOnly: boolean;
}) {
  const selectedId = useAtlasStore((s) => s.selectedStructureId);
  const hoveredId = useAtlasStore((s) => s.hoveredStructureId);
  const setSelected = useAtlasStore((s) => s.setSelectedStructure);
  const setHovered = useAtlasStore((s) => s.setHoveredStructure);
  const sys = SYSTEM_MAP[sysId];
  const isSkin = entry.id === 'piel';
  const selected = !entry.context && selectedId === entry.id;
  const hovered = !entry.context && hoveredId === entry.id;
  const somethingSelected = !!selectedId && hasModel3D(selectedId);

  const baseColor = useMemo(() => {
    const c = new THREE.Color(sys.color);
    if (entry.context) c.offsetHSL(0, -0.08, -0.06);
    return c;
  }, [sys.color, entry.context]);

  // Skin is always rendered as a glass shell; selection dims everything else a little.
  let alpha = isSkin ? 0.2 * opacity : opacity;
  if (somethingSelected && !selected && !isSkin) alpha *= 0.55;
  const transparent = alpha < 0.999;
  const mat = MATERIAL[sysId] ?? { roughness: 0.45, clearcoat: 0.4 };
  const pickable = interactive && (isSkin ? skinVisibleOnly : opacity >= 0.35);

  return (
    <mesh
      geometry={entry.geometry}
      userData={{ structureId: entry.context ? undefined : entry.id }}
      castShadow={!isSkin && !transparent}
      receiveShadow={!isSkin}
      renderOrder={isSkin ? 10 : transparent ? 5 : 0}
      raycast={pickable ? THREE.Mesh.prototype.raycast : () => null}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        if (entry.context) return;
        setHovered(entry.id);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        if (!entry.context) setHovered(null);
        document.body.style.cursor = '';
      }}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        if (e.delta > 5 || entry.context) return; // a drag, or a context mesh
        setSelected(entry.id);
      }}
    >
      <meshPhysicalMaterial
        key={transparent ? 't' : 'o'}
        color={baseColor}
        roughness={isSkin ? 0.25 : mat.roughness}
        metalness={0}
        clearcoat={isSkin ? 1 : mat.clearcoat}
        clearcoatRoughness={0.35}
        sheen={mat.sheen ?? 0}
        sheenColor={baseColor}
        transparent={transparent}
        opacity={alpha}
        depthWrite={!transparent || alpha > 0.6}
        side={isSkin ? THREE.FrontSide : THREE.DoubleSide}
        emissive={selected || hovered ? AMBER : BLACK}
        emissiveIntensity={selected ? 0.42 : hovered ? 0.18 : 0}
      />
    </mesh>
  );
}

function SystemModel({ sysId, url }: { sysId: SystemId; url: string }) {
  const meshes = useSystemMeshes(url);
  const opacity = useAtlasStore((s) => s.systemOpacity[sysId] ?? 1);
  const visibleSystems = useAtlasStore((s) => s.visibleSystems);
  const skinOnly = Object.entries(visibleSystems).every(([k, v]) => (k === 'tegumentario' ? v : !v));
  return (
    <group>
      {meshes.map((m, i) => (
        <StructureMesh key={`${m.id}-${i}`} entry={m} sysId={sysId} opacity={opacity} interactive skinVisibleOnly={skinOnly} />
      ))}
    </group>
  );
}

/** Finds the world-space bounding sphere of a structure across loaded models. */
function findSphere(scene: THREE.Object3D, id: string): THREE.Sphere | null {
  const box = new THREE.Box3();
  let found = false;
  scene.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
    const gid = (mesh.geometry as THREE.BufferGeometry).name?.replace(/_\d+$/, '');
    if (mesh.userData.structureId === id || gid === id) {
      mesh.geometry.computeBoundingBox();
      const b = mesh.geometry.boundingBox!.clone().applyMatrix4(mesh.matrixWorld);
      box.union(b);
      found = true;
    }
  });
  if (!found) return null;
  return box.getBoundingSphere(new THREE.Sphere());
}

function CameraRig() {
  const ref = useRef<CameraControls>(null);
  const currentView = useAtlasStore((s) => s.currentView);
  const nonce = useAtlasStore((s) => s.cameraNonce);
  const autoRotate = useAtlasStore((s) => s.autoRotate);
  const selectedId = useAtlasStore((s) => s.selectedStructureId);
  const scene = useThree((s) => s.scene);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const [x, y, z] = VIEW_POS[currentView];
    c.setLookAt(x, y, z, TARGET.x, TARGET.y, TARGET.z, true);
  }, [currentView, nonce]);

  // Glide towards the selected structure, keeping the current viewing direction.
  useEffect(() => {
    const c = ref.current;
    if (!c || !selectedId || !hasModel3D(selectedId)) return;
    let tries = 0;
    const run = () => {
      const sphere = findSphere(scene, selectedId);
      if (!sphere) {
        if (tries++ < 20) timer = window.setTimeout(run, 150);
        return;
      }
      const pos = c.getPosition(new THREE.Vector3());
      const tgt = c.getTarget(new THREE.Vector3());
      const dir = pos.sub(tgt).normalize();
      const dist = THREE.MathUtils.clamp(sphere.radius * 5.5, 0.9, DIST);
      const p = sphere.center.clone().addScaledVector(dir, dist);
      c.setLookAt(p.x, p.y, p.z, sphere.center.x, sphere.center.y, sphere.center.z, true);
    };
    let timer = window.setTimeout(run, 0);
    return () => window.clearTimeout(timer);
  }, [selectedId, scene]);

  useFrame((_, dt) => {
    if (autoRotate && ref.current) ref.current.rotate(dt * 0.35, 0, false);
  });

  return (
    <CameraControls
      ref={ref}
      makeDefault
      minDistance={0.35}
      maxDistance={7}
      smoothTime={0.45}
      draggingSmoothTime={0.08}
    />
  );
}

function SelectedLabel() {
  const locale = useLocale();
  const selectedId = useAtlasStore((s) => s.selectedStructureId);
  const hoveredId = useAtlasStore((s) => s.hoveredStructureId);
  const showLabels = useAtlasStore((s) => s.showLabels);
  const [pos, setPos] = useState<[number, number, number] | null>(null);
  const scene = useThree((s) => s.scene);
  const id = selectedId && hasModel3D(selectedId) ? selectedId : showLabels && hoveredId ? hoveredId : null;

  useEffect(() => {
    if (!id) { setPos(null); return; }
    let tries = 0;
    let timer = 0;
    const run = () => {
      const s = findSphere(scene, id);
      if (s) setPos([s.center.x, s.center.y, s.center.z]);
      else if (tries++ < 20) timer = window.setTimeout(run, 150);
      else setPos(null);
    };
    run();
    return () => window.clearTimeout(timer);
  }, [id, scene]);

  const st = id ? STRUCTURE_MAP[id] : null;
  return (
    <group>
      {pos && st && (
        <Html position={pos} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <div className="flex -translate-x-2 -translate-y-1/2 items-center gap-2 whitespace-nowrap">
            <span className="block h-4 w-4 rounded-full border-[1.5px] border-primary shadow-[0_0_0_6px_hsl(var(--primary)/0.15)]" />
            <span className="h-px w-10 bg-gradient-to-r from-primary to-primary/20" />
            <span className="rounded-full bg-card/85 px-3 py-1 text-xs font-medium text-foreground backdrop-blur">
              {locale === 'es' ? st.nombre_es : st.nombre_en}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}

function Loader() {
  const { active, progress } = useProgress();
  if (!active) return null;
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px w-40 overflow-hidden bg-border">
          <div className="h-full bg-primary transition-[width]" style={{ width: `${progress}%` }} />
        </div>
        Preparando el modelo… {Math.round(progress)}%
      </div>
    </Html>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.18} />
      <hemisphereLight args={['#fff1dc', '#1a1512', 0.35]} />
      <directionalLight
        position={[1.6, 3.2, 2.6]}
        intensity={2.4}
        color="#ffe3bd"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-1.2}
        shadow-camera-right={1.2}
        shadow-camera-top={2}
        shadow-camera-bottom={-0.2}
        shadow-camera-near={0.5}
        shadow-camera-far={8}
      />
      <directionalLight position={[-2.2, 1.8, -2.4]} intensity={1.4} color="#9db4ff" />
      <spotLight position={[0, 4.2, 0.6]} angle={0.5} penumbra={1} intensity={6} color="#ffd9a8" distance={9} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#ffe8c8" position={[0, 4, 2]} scale={[4, 1.2, 1]} rotation-x={Math.PI / 2.4} />
        <Lightformer form="rect" intensity={0.9} color="#c9d6ff" position={[-4, 1.5, -2]} scale={[2, 3, 1]} rotation-y={Math.PI / 3} />
        <Lightformer form="ring" intensity={0.8} color="#ffcf8f" position={[3, 1, 3]} scale={1.5} />
      </Environment>
    </>
  );
}

export default function Atlas3D() {
  const visibleSystems = useAtlasStore((s) => s.visibleSystems);
  const reproSex = useAtlasStore((s) => s.reproSex);
  const setSelected = useAtlasStore((s) => s.setSelectedStructure);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', h);
    return () => { window.removeEventListener('keydown', h); document.body.style.cursor = ''; };
  }, [setSelected]);

  const systems = SYSTEMS.filter((s) => {
    if (!visibleSystems[s.id]) return false;
    if (s.id === 'reproductor' && reproSex !== 'masculino') return false; // model is male only
    return !!modelUrl(s.id);
  });

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      camera={{ fov: 28, near: 0.05, far: 40, position: VIEW_POS.anterior }}
      style={{ touchAction: 'none' }}
      aria-label="Modelo 3D interactivo del cuerpo humano"
    >
      <Lights />
      {systems.map((s) => (
        <Suspense key={s.id} fallback={null}>
          <SystemModel sysId={s.id} url={modelUrl(s.id)!} />
        </Suspense>
      ))}
      <ContactShadows position={[0, 0.001, 0]} opacity={0.55} scale={3} blur={2.6} far={1.2} resolution={512} color="#000000" />
      <SelectedLabel />
      <CameraRig />
      <Loader />
    </Canvas>
  );
}
