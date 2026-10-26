#!/usr/bin/env python3
"""Genera index.html (juego completo en un solo archivo) a partir de src/.

Uso:  python3 tools/build.py
- src/head.html  : cabecera PWA (manifest, iconos, tipografías locales)
- src/shell.html : estilos y estructura del juego
- src/app.css    : estilos propios de la app instalada
- src/*.js       : módulos del juego, en el orden de ORDEN
"""
import pathlib, re, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'src'
ORDEN = ['engine', 'assets', 'game', 'director', 'suerte', 'cartel', 'bous', 'ux', 'encierro', 'main']

def main():
    js = '\n'.join((SRC / f'{m}.js').read_text(encoding='utf-8') for m in ORDEN)
    tmp = ROOT / 'tools' / '.all.js'
    tmp.write_text(js, encoding='utf-8')
    try:
        subprocess.run(['node', '--check', str(tmp)], check=True)
    except FileNotFoundError:
        print('aviso: node no está instalado, no se comprueba la sintaxis', file=sys.stderr)
    finally:
        tmp.unlink(missing_ok=True)
    shell = (SRC / 'shell.html').read_text(encoding='utf-8')
    m = re.search(r'<style>(.*?)</style>(.*)', shell, re.S)
    css, body = m.group(1), m.group(2)
    css += '\n' + (SRC / 'app.css').read_text(encoding='utf-8')
    body = body.replace('<script>\n/*JS*/\n</script>', '').replace('/*JS*/', '').strip()
    body = re.sub(r'<script>\s*</script>\s*$', '', body).strip()
    head = (SRC / 'head.html').read_text(encoding='utf-8').rstrip()
    html = (f"{head}\n<style>{css}</style>\n</head>\n<body>\n{body}\n<script>\n{js}\n</script>\n"
            f"<script src=\"app.js\"></script>\n</body>\n</html>\n")
    (ROOT / 'index.html').write_text(html, encoding='utf-8')
    print(f'index.html: {len(html)//1024} KB')

if __name__ == '__main__':
    main()
