#!/usr/bin/env python3
"""Descarga las mallas femeninas del Human Reference Atlas (HRA) que usa build_glb.py.

Fuente: HuBMAP Human Reference Atlas, 3D Reference Object Library v1.2 (junio 2022),
licencia CC BY 4.0. Los archivos van a bp3d/extra/hra/ (ignorada por git) o a --out.

Solo usa la biblioteca estándar (Python 3.9+):

    python3 fetch_hra.py [--out RUTA] [--force]
"""
import argparse
import hashlib
import sys
import urllib.error
import urllib.request
from datetime import date
from pathlib import Path

BASE_URL = 'https://raw.githubusercontent.com/hubmapconsortium/ccf-releases/main/v1.2/models/'
REPO_URL = 'https://github.com/hubmapconsortium/ccf-releases/tree/main/v1.2/models'
LICENSE_URL = 'https://hubmapconsortium.github.io/ccf/pages/ccf-3d-reference-library.html'
TOLERANCE = 0.01  # ±1 % sobre el tamaño esperado

# nombre -> tamaño esperado en bytes
FILES = {
    'VH_F_Uterus.glb': 909772,
    'VH_F_Ovary_L.glb': 8984,
    'VH_F_Ovary_R.glb': 8744,
    'VH_F_Fallopian_Tube_L.glb': 336676,
    'VH_F_Fallopian_Tube_R.glb': 327448,
    'VH_F_Pelvis.glb': 1593336,
}


def size_ok(size, expected):
    return abs(size - expected) <= expected * TOLERANCE


def check(path, expected):
    """Devuelve None si el archivo es válido, o el motivo del rechazo."""
    size = path.stat().st_size
    if not size_ok(size, expected):
        return 'tamaño %d B (esperado %d B ±1 %%)' % (size, expected)
    with open(path, 'rb') as f:
        if f.read(4) != b'glTF':
            return 'no empieza con los bytes "glTF"'
    return None


def sha256(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()


def download(name, dest):
    tmp = dest.with_name(dest.name + '.part')
    req = urllib.request.Request(BASE_URL + name, headers={'User-Agent': 'atlas-anatomia-fetch-hra'})
    with urllib.request.urlopen(req, timeout=60) as resp, open(tmp, 'wb') as out:
        while True:
            chunk = resp.read(1 << 16)
            if not chunk:
                break
            out.write(chunk)
    tmp.replace(dest)


def write_source(out_dir, rows):
    lines = [
        '# Mallas del Human Reference Atlas (HRA)',
        '',
        '- **Fuente**: HuBMAP Human Reference Atlas, 3D Reference Object Library v1.2 (junio 2022).',
        '- **Repositorio**: <%s>' % REPO_URL,
        '- **Licencia**: Creative Commons Atribución 4.0 (CC BY 4.0), según <%s>.' % LICENSE_URL,
        '- **Fecha de descarga**: %s' % date.today().isoformat(),
        '',
        'Generado por `bp3d/fetch_hra.py`. No editar a mano.',
        '',
        '| Archivo | Tamaño (B) | sha256 |',
        '|---|---:|---|',
    ]
    for name, size, digest in rows:
        lines.append('| `%s` | %d | `%s` |' % (name, size, digest))
    (out_dir / 'SOURCE.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--out', type=Path, default=Path(__file__).resolve().parent / 'extra' / 'hra',
                    help='carpeta de destino (por defecto: extra/hra junto a este script)')
    ap.add_argument('--force', action='store_true', help='volver a descargar aunque el archivo ya sea válido')
    args = ap.parse_args()

    out_dir = args.out
    out_dir.mkdir(parents=True, exist_ok=True)

    rows, table, failed = [], [], 0
    for name, expected in FILES.items():
        dest = out_dir / name
        estado = ''
        if dest.exists() and not args.force and check(dest, expected) is None:
            estado = 'ya existía'
        else:
            try:
                download(name, dest)
                problem = check(dest, expected)
                if problem:
                    dest.unlink()
                    estado = 'ERROR: ' + problem
                else:
                    estado = 'descargado'
            except (urllib.error.URLError, OSError) as exc:
                estado = 'ERROR: %s' % exc
        if estado.startswith('ERROR'):
            failed += 1
            table.append((name, expected, '-', estado))
            continue
        size = dest.stat().st_size
        digest = sha256(dest)
        rows.append((name, size, digest))
        table.append((name, expected, size, estado))

    width = max(len(n) for n in FILES)
    print('%-*s  %10s  %10s  %s' % (width, 'archivo', 'esperado', 'real', 'estado'))
    for name, expected, size, estado in table:
        print('%-*s  %10s  %10s  %s' % (width, name, expected, size, estado))

    if failed:
        print('\n%d archivo(s) con error; SOURCE.md no se escribió.' % failed, file=sys.stderr)
        return 1
    write_source(out_dir, rows)
    print('\nOK: %d archivos en %s (SOURCE.md escrito)' % (len(rows), out_dir))
    return 0


if __name__ == '__main__':
    sys.exit(main())
