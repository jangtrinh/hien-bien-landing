"""Build a portable, single-file edition. Python 3.10+, standard library only."""
from __future__ import annotations
import argparse
import base64
import json
from pathlib import Path


def build(root: Path, output: Path) -> Path:
    required = [root / 'index.html', root / 'assets/styles.css', root / 'assets/app.js',
                root / 'data/content.json', root / 'data/Mo_hinh_CLB_nguoi_cao_tuoi_Da_Nang.xlsx']
    for path in required:
        if not path.is_file():
            raise FileNotFoundError(f'Missing input: {path}')
    content = json.loads((root / 'data/content.json').read_text(encoding='utf-8'))
    content_js = 'window.HIEN_BIEN_CONTENT = ' + json.dumps(content, ensure_ascii=False) + ';\n'
    (root / 'assets/content.js').write_text(content_js, encoding='utf-8')
    document = (root / 'index.html').read_text(encoding='utf-8')
    document = document.replace('<link rel="stylesheet" href="assets/styles.css">',
                                '<style>\n' + (root / 'assets/styles.css').read_text(encoding='utf-8') + '\n</style>')
    document = document.replace('<script src="assets/content.js"></script>', '<script>\n' + content_js + '\n</script>')
    document = document.replace('<script src="assets/app.js"></script>',
                                '<script>\n' + (root / 'assets/app.js').read_text(encoding='utf-8') + '\n</script>')
    encoded = base64.b64encode(required[-1].read_bytes()).decode('ascii')
    document = document.replace('</body>', '<script id="embedded-workbook" type="application/octet-stream">' + encoded + '</script></body>')
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(document, encoding='utf-8')
    return output


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=None)
    args = parser.parse_args()
    root = Path(__file__).resolve().parent.parent
    output = args.output or root / 'dist/Hien-Bien_Landing-Slideshow.html'
    result = build(root, output)
    print(f'Created {result} ({result.stat().st_size:,} bytes)')
