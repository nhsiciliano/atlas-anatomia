"""Genera los GLB por sistema que consume la app a partir de las mallas OBJ de BodyParts3D.

Uso (desde cualquier carpeta):
    ./.venv/bin/python build_glb.py [--app-dir RUTA] [--only SISTEMA ...] [--skip-wrap] [--dry-run]

La tabla de mapeo (MAP, CONTEXT, WRAP) está en mapping.py. Ver README.md.
"""
import argparse
import json
import re
from pathlib import Path

import numpy as np
import trimesh
import fast_simplification as fs

from mapping import MAP, CONTEXT, WRAP, BUDGET, DEFAULT_BUDGET, CONTEXT_BUDGET

ROOT = Path(__file__).resolve().parent
OBJ_DIRS = [ROOT / 'objs' / 'partof_BP3D_4.0_obj_99', ROOT / 'objs' / 'isa_BP3D_4.0_obj_99']
ELEMENT_TABLES = [ROOT / 'partof_element_parts.txt', ROOT / 'isa_element_parts.txt']



def parse_args():
    ap = argparse.ArgumentParser(description='Genera public/models3d/<sistema>.glb y data/models3d-manifest.json.')
    ap.add_argument('--app-dir', type=Path, default=ROOT.parent / 'atlas_anatomia' / 'nextjs_space',
                    help='carpeta de la app Next.js (por defecto: ../atlas_anatomia/nextjs_space)')
    ap.add_argument('--only', action='append', metavar='SISTEMA',
                    help='generar solo este sistema (repetible); el manifest conserva los demás')
    ap.add_argument('--skip-wrap', action='store_true',
                    help='usar la malla cruda en vez del envoltorio por vóxeles (pulmones); más rápido para iterar')
    ap.add_argument('--dry-run', action='store_true',
                    help='solo resolver nombres de concepto → archivos FJ y reportar MISSING, sin exportar')
    return ap.parse_args()


def load_system_of(app_dir):
    """id de estructura -> systemId, leído de data/structures/*.ts."""
    files = sorted((app_dir / 'data' / 'structures').glob('*.ts'))
    if not files:
        raise SystemExit(f'No hay data/structures/*.ts en {app_dir}: revisá --app-dir')
    src = ''.join(f.read_text() for f in files)
    return {m.group(1): m.group(2) for m in re.finditer(r"id: '([^']+)', systemId: '([^']+)'", src)}


def load_elements():
    """nombre de concepto -> {FJxxxx} según las tablas *_element_parts.txt."""
    el = {}
    for table in ELEMENT_TABLES:
        for line in table.read_text().splitlines()[1:]:
            p = line.split('\t')
            if len(p) >= 3:
                el.setdefault(p[1].strip(), set()).add(p[2].strip())
    return el


def obj_path(fj):
    for d in OBJ_DIRS:
        p = d / f'{fj}.obj'
        if p.exists():
            return p
    return None


class Meshes:
    """Resuelve nombres de concepto a mallas, con caché, y registra los nombres sin malla."""

    def __init__(self, el):
        self.el = el
        self.cache = {}
        self.missing = set()  # nombres de concepto sin ningún .obj en disco

    def fjs_of(self, names):
        r = set()
        for n in names:
            fjs = self.el.get(n, set())
            if not any(obj_path(f) for f in fjs):
                self.missing.add(n)
            r |= fjs
        return r

    def load(self, fj):
        if fj not in self.cache:
            p = obj_path(fj)
            self.cache[fj] = trimesh.load(p, force='mesh', process=False) if p else None
        return self.cache[fj]

    def gather(self, names, exclude=()):
        return self.gather_fjs(self.fjs_of(names) - set(exclude))

    def gather_fjs(self, fjs):
        ms = [self.load(f) for f in sorted(fjs)]
        ms = [m for m in ms if m is not None and len(m.faces)]
        return trimesh.util.concatenate(ms) if ms else None


def wrap(m, pitch=3.0, close=4):
    """Envoltorio continuo por vóxeles: cierre morfológico + marching cubes + suavizado."""
    from scipy import ndimage
    from skimage import measure
    pts = np.vstack([m.vertices, trimesh.sample.sample_surface(m, 200000)[0]])
    lo = pts.min(0) - pitch * (close + 3)
    idx = np.floor((pts - lo) / pitch).astype(int)
    shape = idx.max(0) + close + 4
    g = np.zeros(shape, bool); g[tuple(idx.T)] = True
    st = ndimage.generate_binary_structure(3, 1)
    g = ndimage.binary_dilation(g, st, iterations=close)
    g = ndimage.binary_fill_holes(g)
    g = ndimage.binary_erosion(g, st, iterations=close - 1)
    g = ndimage.gaussian_filter(g.astype(np.float32), 1.0)
    v, f, _, _ = measure.marching_cubes(g, 0.5)
    w = trimesh.Trimesh(v * pitch + lo, f[:, ::-1], process=True)
    trimesh.smoothing.filter_taubin(w, iterations=10)
    return w


def simplify(m, target):
    m.merge_vertices()
    f = len(m.faces)
    if f <= target:
        return m.vertices, m.faces
    return fs.simplify(np.asarray(m.vertices, dtype=np.float32), np.asarray(m.faces, dtype=np.int64),
                       target_reduction=1 - target / f)


def make_xform(skin):
    """mm Z-up (frente = -Y) -> metros Y-up (frente = +Z), centrado en la piel."""
    b = skin.bounds
    cx, cy = (b[0][0] + b[1][0]) / 2, (b[0][1] + b[1][1]) / 2
    zmin = b[0][2]

    def xform(v):
        return np.stack([(v[:, 0] - cx), (v[:, 2] - zmin), -(v[:, 1] - cy)], 1) / 1000.0
    return xform


def assign_fjs(meshes, system_of):
    """Archivos FJ de cada estructura de MAP, sin duplicados dentro de un sistema.

    1. Si otra estructura del mismo sistema es un subconjunto estricto de esta, se le resta
       (p. ej. corazon pierde lo de auricula-derecha).
    2. Primero gana: un FJ que ya quedó asignado a una estructura anterior en MAP se quita de las
       siguientes del mismo sistema (p. ej. paredes compartidas entre cavidades del corazón).
    Las estructuras de WRAP no participan: usan un envoltorio, no sus mallas.
    Devuelve ({id: fjs}, {(sistema, ganador, perdedor): [fjs]}).
    """
    own = {sid: meshes.fjs_of(names) for sid, names in MAP.items()}
    assigned, owner, shared = {}, {}, {}
    for sid in MAP:
        sys_id = system_of.get(sid)
        if not sys_id:
            continue
        mine = set(own[sid])
        for o in MAP:
            if o != sid and system_of.get(o) == sys_id and own[o] and own[o] < own[sid]:
                mine -= own[o]
        if sid not in WRAP:
            for fj in sorted(mine):
                prev = owner.get((sys_id, fj))
                if prev:
                    shared.setdefault((sys_id, prev, sid), []).append(fj)
                    mine.discard(fj)
                else:
                    owner[(sys_id, fj)] = sid
        assigned[sid] = mine
    return assigned, shared


def dry_run(meshes, system_of, only):
    assigned, shared = assign_fjs(meshes, system_of)
    print(f'{"estructura":28} {"sistema":22} FJ   en disco')
    for sid in MAP:
        sys_id = system_of.get(sid, '¿?')
        if only and sys_id not in only:
            continue
        fjs = assigned.get(sid, set())
        print(f'{sid:28} {sys_id:22} {len(fjs):<4} {sum(1 for f in fjs if obj_path(f))}')
    for sys_id, names in CONTEXT.items():
        if not only or sys_id in only:
            meshes.fjs_of(names)
    return shared


def build(meshes, system_of, only, skip_wrap):
    skin = meshes.gather(['skin'])
    xform = make_xform(skin)
    assigned, shared = assign_fjs(meshes, system_of)
    scenes, faces = {}, {}

    def add(sys_id, sid, m, budget):
        v, f = simplify(m, budget)
        mm = trimesh.Trimesh(v, f, process=False)
        mm.vertices = xform(mm.vertices)
        scenes.setdefault(sys_id, []).append((sid, mm))
        faces[sys_id] = faces.get(sys_id, 0) + len(f)

    for sid, names in MAP.items():
        sys_id = system_of.get(sid)
        if not sys_id:
            print('SIN SISTEMA (id no está en data/structures):', sid)
            continue
        if only and sys_id not in only:
            continue
        if sid in WRAP and not skip_wrap:
            parts = [meshes.gather(n) for n in WRAP[sid]]
            m = trimesh.util.concatenate([wrap(p) for p in parts if p is not None])
        else:
            m = meshes.gather_fjs(assigned[sid])
        if m is None:
            print('SIN MALLA:', sid)
            continue
        add(sys_id, sid, m, BUDGET.get(sid, DEFAULT_BUDGET))

    for sys_id, names in CONTEXT.items():
        if only and sys_id not in only:
            continue
        # Lo que ya es una estructura seleccionable no se repite en el contexto.
        taken = set().union(*(f for s, f in assigned.items() if system_of.get(s) == sys_id))
        m = meshes.gather(names, taken)
        if m is not None:  # contexto vacío o sin mallas: no se crea ctx__<sistema>
            add(sys_id, 'ctx__' + sys_id, m, CONTEXT_BUDGET[sys_id])
    return scenes, faces, shared


def export(scenes, faces, app_dir, only):
    out = app_dir / 'public' / 'models3d'
    out.mkdir(parents=True, exist_ok=True)
    manifest_path = app_dir / 'data' / 'models3d-manifest.json'
    # Con --only se actualizan solo esos sistemas y se conservan los demás.
    manifest = json.loads(manifest_path.read_text()) if only and manifest_path.exists() else {}

    print(f'\n{"sistema":22} {"estructuras":>11} {"caras":>8} {"bytes":>10}')
    for sys_id, items in scenes.items():
        sc = trimesh.Scene()
        for sid, mm in items:
            sc.add_geometry(mm, node_name=sid, geom_name=sid)
        data = sc.export(file_type='glb')
        fn = f'{sys_id}.glb'
        (out / fn).write_bytes(data)
        structures = [s for s, _ in items if not s.startswith('ctx__')]
        manifest[sys_id] = {'file': fn, 'structures': structures, 'bytes': len(data)}
        print(f'{sys_id:22} {len(structures):>11} {faces[sys_id]:>8} {len(data):>10}')

    manifest_path.write_text(json.dumps(manifest, indent=1) + '\n')
    print(f'\nManifest: {manifest_path}')


def main():
    args = parse_args()
    app_dir = args.app_dir.resolve()
    only = set(args.only or [])
    system_of = load_system_of(app_dir)
    unknown = only - set(system_of.values())
    if unknown:
        raise SystemExit(f'Sistema desconocido en --only: {", ".join(sorted(unknown))}')
    meshes = Meshes(load_elements())

    if args.dry_run:
        shared = dry_run(meshes, system_of, only)
    else:
        scenes, faces, shared = build(meshes, system_of, only, args.skip_wrap)
        export(scenes, faces, app_dir, only)

    shared = {k: v for k, v in shared.items() if not only or k[0] in only}
    if shared:
        print('\nMallas compartidas (primero gana, según el orden de MAP):')
        for (_, winner, loser), fjs in shared.items():
            listed = ', '.join(fjs) if len(fjs) <= 4 else f'{fjs[0]} … {fjs[-1]}'
            print(f'   {len(fjs)} FJ compartido(s): asignado(s) a {winner}, quitado(s) de {loser} ({listed})')

    if meshes.missing:
        print('\nMISSING (nombres de concepto sin malla en disco):')
        for n in sorted(meshes.missing):
            print('  ', n)
    else:
        print('\nSin MISSING: todos los nombres de concepto tienen malla.')
    if not args.dry_run:
        print('\nRecordatorio: subir MODEL_VERSION en lib/models3d.ts para invalidar la caché del navegador.')


if __name__ == '__main__':
    main()
