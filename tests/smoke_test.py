"""Optional smoke tests. Requires Playwright and a Chromium installation.
Run: python3 tests/smoke_test.py --browser /path/to/chromium
Build the standalone edition first with tools/build_standalone.py.
"""
from __future__ import annotations
import argparse
from pathlib import Path
from playwright.sync_api import sync_playwright


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--browser', default=None, help='Optional installed Chromium executable')
    parser.add_argument('--html', type=Path, default=None)
    args = parser.parse_args()
    root = Path(__file__).resolve().parent.parent
    source = args.html or root / 'dist/Hien-Bien_Landing-Slideshow.html'
    if not source.is_file():
        raise SystemExit(f'Build the standalone edition first. Missing: {source}')
    with sync_playwright() as playwright:
        options = {'headless': True}
        if args.browser:
            options['executable_path'] = args.browser
        browser = playwright.chromium.launch(**options)
        page = browser.new_page(viewport={'width': 1440, 'height': 900}, reduced_motion='reduce')
        errors: list[str] = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.set_content(source.read_text(encoding='utf-8'))
        assert page.evaluate('window.HienBienPresentation.getState().total') == 26
        models = page.evaluate('Object.fromEntries(Object.entries(HienBienModel.scenarios).map(([k,v])=>[k,HienBienModel.calculateModel(v)]))')
        for name, target in [('low', -59.5), ('base', 15), ('high', 61.5)]:
            assert abs(models[name]['ebitda'] - target) < 1e-8
        assert models['base']['breakEven'] == 150
        rows = page.evaluate('HienBienModel.calculateRampUp()')
        assert abs(rows[-1]['cumulative'] + 471.1) < 1e-7
        assert abs(rows[-1]['cash'] - 628.9) < 1e-7
        assert sum(row['newMembers'] for row in rows) == 268
        assert page.evaluate('HIEN_BIEN_CONTENT.zones.reduce((s,z)=>s+z.area,0)') == 500
        page.keyboard.press('ArrowRight')
        assert page.evaluate('HienBienPresentation.getState().current') == 1
        page.keyboard.press('m')
        page.locator('#overview-search').fill('thay gia dinh')
        assert page.locator('.overview-item').count() == 1
        page.locator('.overview-item').click()
        assert page.evaluate('HienBienPresentation.getState().current') == 18
        page.locator('#sim-rent').evaluate('(e)=>{e.value=80;e.dispatchEvent(new Event("input"))}')
        assert '−5,0' in page.locator('#sim-ebitda').inner_text()
        page.locator('#sim-reset').click()
        assert '+15,0' in page.locator('#sim-ebitda').inner_text()
        assert not errors, errors
        browser.close()
    print('PASS: navigation, financial models, sensitivity, ramp-up, and space allocation.')


if __name__ == '__main__':
    main()
