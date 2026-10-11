import os, sys, json, numpy as np, trimesh
import fast_simplification as fs
exec(open('mapping.py').read())

D = ['objs/partof_BP3D_4.0_obj_99', 'objs/isa_BP3D_4.0_obj_99']
OUT = '/home/ubuntu/atlas_anatomia/nextjs_space/public/models3d'
os.makedirs(OUT, exist_ok=True)

# extra mappings / overrides
MAP.update({
  'arterias-coronarias': ['coronary artery'],
  'nervio-trigemino': ['branch of trigeminal nerve'],
  'retina': ['optic part of right retina', 'optic part of left retina'],
  'faringe': ['muscle of pharynx'],
  'higado': ['hepatovenous segment ii', 'hepatovenous segment iii', 'hepatovenous segment iv', 'hepatovenous segment v',
             'hepatovenous segment vi', 'hepatovenous segment vii', 'hepatovenous segment viii', 'caudate lobe of liver'],
})
WRAP = {'pulmones': [['right lung'], ['left lung']]}

def wrap(m, pitch=3.0, close=4):
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
CONTEXT['esqueletico'] += ['phalanx of finger', 'phalanx of toe']
CONTEXT['muscular'] += ['vastus intermedius', 'long head of biceps femoris', 'gracilis', 'semimembranosus', 'rhomboid major',
  'infraspinatus', 'teres major', 'psoas major', 'pectoralis minor', 'medial head of triceps brachii', 'brachialis',
  'flexor carpi radialis', 'extensor digitorum', 'extensor carpi radialis longus', 'flexor digitorum superficialis',
  'tibialis posterior', 'extensor digitorum longus', 'iliacus', 'supraspinatus']
CONTEXT['cardiovascular'] += ['pulmonary artery', 'popliteal artery', 'anterior tibial artery', 'posterior tibial artery',
  'radial artery', 'ulnar artery', 'axillary artery', 'subclavian vein', 'axillary vein', 'great saphenous vein',
  'popliteal vein', 'hepatic portal vein', 'pulmonary vein', 'renal artery', 'internal carotid artery', 'external carotid artery',
  'common iliac vein', 'external iliac vein']

SYSTEM_OF = {}
import re
import glob
src = ''.join(open(f).read() for f in sorted(glob.glob('/home/ubuntu/atlas_anatomia/nextjs_space/data/structures/*.ts')))
for m in re.finditer(r"id: '([^']+)', systemId: '([^']+)'", src):
    SYSTEM_OF[m.group(1)] = m.group(2)

el = {}
for f in ['partof_element_parts.txt', 'isa_element_parts.txt']:
    for line in open(f).read().splitlines()[1:]:
        p = line.split('\t')
        if len(p) >= 3:
            el.setdefault(p[1].strip(), set()).add(p[2].strip())

def path(fj):
    for d in D:
        p = f'{d}/{fj}.obj'
        if os.path.exists(p): return p
    return None

cache = {}
def load(fj):
    if fj in cache: return cache[fj]
    p = path(fj)
    if not p: cache[fj] = None; return None
    m = trimesh.load(p, force='mesh', process=False)
    cache[fj] = m
    return m

EXCLUDE = {}
def fjs_of(names):
    r = set()
    for n in names: r |= el.get(n, set())
    return r
def gather(names, exclude=()):
    fjs = fjs_of(names) - set(exclude)
    ms = [load(f) for f in sorted(fjs)]
    ms = [m for m in ms if m is not None and len(m.faces)]
    if not ms: return None
    return trimesh.util.concatenate(ms)

# global transform: mm Z-up (front = -Y) -> metres Y-up (front = +Z), centred on skin
skin = gather(['skin'])
b = skin.bounds
cx, cy = (b[0][0] + b[1][0]) / 2, (b[0][1] + b[1][1]) / 2
zmin = b[0][2]
print('skin bounds', b)

def xform(m):
    v = m.vertices.copy()
    out = np.stack([(v[:, 0] - cx), (v[:, 2] - zmin), -(v[:, 1] - cy)], 1) / 1000.0
    return out

def simplify(m, target):
    m.merge_vertices()
    f = len(m.faces)
    if f <= target: return m.vertices, m.faces
    v2, f2 = fs.simplify(np.asarray(m.vertices, dtype=np.float32), np.asarray(m.faces, dtype=np.int64), target_reduction=1 - target / f)
    return v2, f2

BUDGET = {'piel': 60000, 'pulmones': 14000, 'higado': 9000, 'corazon': 12000, 'intestino-delgado': 14000, 'intestino-grueso': 9000,
          'cerebro': 16000, 'columna-vertebral': 16000, 'craneo': 16000, 'costillas': 10000}
report = {}
scenes = {}
for sid, names in MAP.items():
    sys_id = SYSTEM_OF.get(sid)
    if not sys_id: print('NO SYSTEM', sid); continue
    mine = fjs_of(names)
    excl = set()
    for o, on in MAP.items():
        if o != sid and SYSTEM_OF.get(o) == sys_id:
            of = fjs_of(on)
            if of and of < mine: excl |= of
    if sid in WRAP:
        parts = [gather(n) for n in WRAP[sid]]
        m = trimesh.util.concatenate([wrap(p) for p in parts if p is not None])
    else:
        m = gather(names, excl)
    if m is None: print('MISSING', sid); continue
    raw = len(m.faces)
    v, f = simplify(m, BUDGET.get(sid, 6000))
    mm = trimesh.Trimesh(v, f, process=False)
    mm.vertices = xform(mm)
    mm.fix_normals() if False else None
    scenes.setdefault(sys_id, []).append((sid, mm))
    report[sid] = (sys_id, raw, len(f))

for sys_id, names in CONTEXT.items():
    m = gather(names)
    if m is None: continue
    raw = len(m.faces)
    v, f = simplify(m, {'esqueletico': 30000, 'muscular': 70000, 'cardiovascular': 14000}[sys_id])
    mm = trimesh.Trimesh(v, f, process=False)
    mm.vertices = xform(mm)
    scenes.setdefault(sys_id, []).append(('ctx__' + sys_id, mm))
    report['ctx__' + sys_id] = (sys_id, raw, len(f))

manifest = {}
for sys_id, items in scenes.items():
    sc = trimesh.Scene()
    for sid, mm in items:
        sc.add_geometry(mm, node_name=sid, geom_name=sid)
    data = sc.export(file_type='glb')
    fn = f'{sys_id}.glb'
    open(f'{OUT}/{fn}', 'wb').write(data)
    manifest[sys_id] = {'file': fn, 'structures': [s for s, _ in items if not s.startswith('ctx__')], 'bytes': len(data)}
    print(sys_id, len(data) // 1024, 'KB', [s for s, _ in items])

json.dump(manifest, open('/home/ubuntu/bp3d/manifest.json', 'w'), indent=1)
for k, v in report.items(): print(k, v)
