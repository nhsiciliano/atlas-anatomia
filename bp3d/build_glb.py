"""Genera los GLB por sistema que consume la app a partir de las mallas OBJ de BodyParts3D.

Uso (desde cualquier carpeta):
    ./.venv/bin/python build_glb.py [--app-dir RUTA] [--objs-dir RUTA] [--extra-dir RUTA]
                                    [--only SISTEMA ...] [--skip-wrap] [--dry-run]

Las tablas (MAP, CONTEXT, WRAP, EXTRA, EXTRA_ALIGN) están en mapping.py. Ver README.md.
"""
import argparse
import json
import re
from pathlib import Path

import numpy as np
import trimesh
import fast_simplification as fs

from mapping import MAP, CONTEXT, WRAP, BUDGET, DEFAULT_BUDGET, CONTEXT_BUDGET, EXTRA, EXTRA_ALIGN, BASE_VARIANT

ROOT = Path(__file__).resolve().parent
ELEMENT_TABLES = [ROOT / 'partof_element_parts.txt', ROOT / 'isa_element_parts.txt']
OBJ_DIRS = []  # lo fija set_objs_dir() según --objs-dir


def set_objs_dir(objs_dir):
    global OBJ_DIRS
    OBJ_DIRS = [objs_dir / 'partof_BP3D_4.0_obj_99', objs_dir / 'isa_BP3D_4.0_obj_99']



def parse_args():
    ap = argparse.ArgumentParser(description='Genera public/models3d/<sistema>.glb y data/models3d-manifest.json.')
    ap.add_argument('--app-dir', type=Path, default=ROOT.parent / 'web',
                    help='carpeta de la app Next.js (por defecto: ../web)')
    ap.add_argument('--objs-dir', type=Path, default=ROOT / 'objs',
                    help='carpeta con los OBJ de BodyParts3D (por defecto: objs/ junto al script)')
    ap.add_argument('--extra-dir', type=Path, default=ROOT / 'extra',
                    help='carpeta con las mallas externas de EXTRA (por defecto: extra/ junto al script)')
    ap.add_argument('--only', action='append', metavar='SISTEMA',
                    help='generar solo este sistema (repetible); el manifest conserva los demás')
    ap.add_argument('--skip-wrap', action='store_true',
                    help='usar la malla cruda en vez del envoltorio por vóxeles (pulmones); más rápido para iterar')
    ap.add_argument('--dry-run', action='store_true',
                    help='solo resolver nombres → FJ, alinear las mallas externas y reportar, sin exportar')
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


# Orientaciones candidatas de una malla glTF (Y arriba) al espacio BP3D (Z arriba, frente = -Y).
# Son rotaciones propias (det = +1): solo cambia hacia dónde mira el frente. Se elige la que deja
# la malla de referencia más cerca de la pelvis BP3D.
ORIENTATIONS = {
    'frente +Z': np.array([[1, 0, 0], [0, 0, -1], [0, 1, 0]]),   # (x, y, z) -> (x, -z, y)
    'frente -Z': np.array([[-1, 0, 0], [0, 0, 1], [0, 1, 0]]),   # la misma, girada 180° sobre la vertical
}


def load_scene_mesh(path):
    """Una malla con las transformaciones de nodo del archivo aplicadas (GLB, OBJ, etc.)."""
    obj = trimesh.load(path, force='scene')
    parts = []
    for node in obj.graph.nodes_geometry:
        transform, geom = obj.graph[node]
        g = obj.geometry[geom].copy()
        g.apply_transform(transform)
        parts.append(g)
    return trimesh.util.concatenate(parts)


class ExternalAligner:
    """Lleva mallas externas al espacio BP3D con la alineación de EXTRA_ALIGN (una por fuente)."""

    def __init__(self, meshes, extra_dir):
        self.meshes = meshes
        self.extra_dir = extra_dir
        self.fits = {}

    def fit(self, source):
        if source in self.fits:
            return self.fits[source]
        cfg = EXTRA_ALIGN[source]
        ref = load_scene_mesh(self.extra_dir / cfg['ref'])
        # Unidades: una pelvis adulta mide ~250-300 mm; si la caja mide menos de 5, está en metros.
        unit = 1000.0 if ref.extents.max() < 5 else 1.0
        target = self.meshes.gather(cfg['target'])
        tb = target.bounds
        from scipy.spatial import cKDTree
        tree = cKDTree(target.vertices)
        samples = trimesh.sample.sample_surface(ref, 4000, seed=0)[0]
        scores = {}
        for name, rot in ORIENTATIONS.items():
            v = (ref.vertices * unit) @ rot.T
            rb = np.array([v.min(0), v.max(0)])
            scale = cfg['scale'] or (tb[1, 0] - tb[0, 0]) / (rb[1, 0] - rb[0, 0])
            shift = tb.mean(0) - rb.mean(0) * scale + np.asarray(cfg['offset_mm'], float)
            moved = ((samples * unit) @ rot.T) * scale + shift
            scores[name] = (float(tree.query(moved)[0].mean()), rot, scale, shift)
        best = min(scores, key=lambda k: scores[k][0])
        _, rot, scale, shift = scores[best]
        self.fits[source] = {
            'unit': unit, 'orientation': best, 'rot': rot, 'scale': float(scale), 'shift': shift,
            'scores': {k: round(v[0], 1) for k, v in scores.items()}, 'target_box': tb,
        }
        return self.fits[source]

    def load(self, rel):
        """Malla externa en mm BP3D (Z arriba, frente = -Y)."""
        fit = self.fit(rel.split('/')[0])
        m = load_scene_mesh(self.extra_dir / rel)
        m.vertices = ((m.vertices * fit['unit']) @ fit['rot'].T) * fit['scale'] + fit['shift']
        return m


def extra_items(system_of, only):
    """(sistema, variante, id, [archivos]) de EXTRA, filtrado por --only."""
    for sys_id, variants in EXTRA.items():
        if only and sys_id not in only:
            continue
        for variant, structures in variants.items():
            for sid, files in structures.items():
                if system_of.get(sid) != sys_id:
                    raise SystemExit(f'EXTRA: {sid} no es una estructura de {sys_id} en data/structures')
                yield sys_id, variant, sid, files


def report_extra(aligner, system_of, only):
    """Imprime la alineación y la caja de cada malla externa, con chequeos de plausibilidad."""
    items = list(extra_items(system_of, only))
    if not items:
        return
    boxes = {}
    print('\nMallas externas (cajas en mm BP3D: X izquierda+, Y frente-, Z arriba)')
    for source in sorted({f.split('/')[0] for *_, files in items for f in files}):
        fit = aligner.fit(source)
        print(f'  {source}: unidades ×{fit["unit"]:g} · orientación {fit["orientation"]} '
              f'(distancia media a {", ".join(EXTRA_ALIGN[source]["target"])}: {fit["scores"]}) · '
              f'escala {fit["scale"]:.4f} · traslación {np.round(fit["shift"], 1).tolist()} mm')
    for sys_id, variant, sid, files in items:
        for rel in files:
            m = aligner.load(rel)
            boxes[(sid, rel)] = m.bounds
            print(f'  {sys_id}/{variant} {sid:15} {rel:32} caras={len(m.faces):6} '
                  f'min={np.round(m.bounds[0], 1).tolist()} max={np.round(m.bounds[1], 1).tolist()}')
    # Chequeos de la pelvis femenina (si están esas estructuras).
    utero = [b for (sid, _), b in boxes.items() if sid == 'utero']
    if not utero:
        return
    ub = utero[0]
    pelvis = aligner.fit('hra')['target_box']
    bladder = aligner.meshes.gather(['urinary bladder']).bounds
    sacrum = aligner.meshes.gather(['sacrum']).bounds
    checks = [
        ('útero dentro de la caja de la pelvis', bool((ub[0] >= pelvis[0]).all() and (ub[1] <= pelvis[1]).all())),
        ('centro del útero por encima del centro de la vejiga', ub.mean(0)[2] > bladder.mean(0)[2]),
        ('útero por debajo del borde superior del sacro', ub[1][2] < sacrum[1][2]),
    ]
    mid = ub.mean(0)[0]
    for side, sign in (('izquierd', 1), ('derech', -1)):
        ov = [b for (sid, rel), b in boxes.items() if sid == 'ovario' and sign * (b.mean(0)[0] - mid) > 0]
        tu = [b for (sid, rel), b in boxes.items() if sid == 'trompa-uterina' and sign * (b.mean(0)[0] - mid) > 0]
        if ov:
            checks.append((f'ovario {side}o a un lado del útero', sign * (ov[0].mean(0)[0] - mid) > (ub[1][0] - ub[0][0]) / 4))
        if ov and tu:
            x_t, x_o = sign * (tu[0].mean(0)[0] - mid), sign * (ov[0].mean(0)[0] - mid)
            checks.append((f'trompa {side}a entre útero y ovario', 0 < x_t <= x_o * 1.15))
    for label, ok in checks:
        print(f'  {"OK  " if ok else "FALLA"} {label}')


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


def dry_run(meshes, system_of, only, aligner):
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
    report_extra(aligner, system_of, only)
    return shared


def build(meshes, system_of, only, skip_wrap, aligner):
    skin = meshes.gather(['skin'])
    xform = make_xform(skin)
    assigned, shared = assign_fjs(meshes, system_of)
    scenes, faces = {}, {}

    def add(key, sid, m, budget):
        # key = sistema, o (sistema, variante) para las variantes de EXTRA
        v, f = simplify(m, budget)
        mm = trimesh.Trimesh(v, f, process=False)
        mm.vertices = xform(mm.vertices)
        scenes.setdefault(key, []).append((sid, mm))
        faces[key] = faces.get(key, 0) + len(f)

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

    # Variantes con mallas externas (sin contexto): las piezas de cada id (L + R) se unen.
    for sys_id, variant, sid, files in extra_items(system_of, only):
        m = trimesh.util.concatenate([aligner.load(rel) for rel in files])
        add((sys_id, variant), sid, m, BUDGET.get(sid, DEFAULT_BUDGET))
    report_extra(aligner, system_of, only)
    return scenes, faces, shared


def export(scenes, faces, app_dir, only):
    out = app_dir / 'public' / 'models3d'
    out.mkdir(parents=True, exist_ok=True)
    manifest_path = app_dir / 'data' / 'models3d-manifest.json'
    # Con --only se actualizan solo esos sistemas y se conservan los demás.
    manifest = json.loads(manifest_path.read_text()) if only and manifest_path.exists() else {}

    print(f'\n{"sistema":30} {"estructuras":>11} {"caras":>8} {"bytes":>10}')
    entries = {}
    # Primero los GLB base (claves str) y después las variantes (claves (sistema, variante)).
    for key in sorted(scenes, key=lambda k: (isinstance(k, tuple), str(k))):
        items = scenes[key]
        sc = trimesh.Scene()
        for sid, mm in items:
            sc.add_geometry(mm, node_name=sid, geom_name=sid)
        data = sc.export(file_type='glb')
        fn = f'{key[0]}_{key[1]}.glb' if isinstance(key, tuple) else f'{key}.glb'
        (out / fn).write_bytes(data)
        structures = [s for s, _ in items if not s.startswith('ctx__')]
        entries[key] = {'file': fn, 'structures': structures, 'bytes': len(data)}
        label = '/'.join(key) if isinstance(key, tuple) else key
        print(f'{label:30} {len(structures):>11} {faces[key]:>8} {len(data):>10}')

    for key, entry in entries.items():
        if isinstance(key, str):
            manifest[key] = dict(entry)
    # Sistemas con variantes: el nivel superior describe la variante base (compatibilidad) y
    # `structures` es la unión, para que hasModel3D/validate/SRS vean todas las mallas.
    for (sys_id, variant), entry in ((k, e) for k, e in entries.items() if isinstance(k, tuple)):
        top = manifest[sys_id]
        variants = top.setdefault('variantes', {BASE_VARIANT: {k: top[k] for k in ('file', 'structures', 'bytes')}})
        variants[variant] = entry
        top['structures'] = list(dict.fromkeys(s for v in variants.values() for s in v['structures']))

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
    set_objs_dir(args.objs_dir.resolve())
    meshes = Meshes(load_elements())
    aligner = ExternalAligner(meshes, args.extra_dir.resolve())

    if args.dry_run:
        shared = dry_run(meshes, system_of, only, aligner)
    else:
        scenes, faces, shared = build(meshes, system_of, only, args.skip_wrap, aligner)
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
