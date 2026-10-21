#!/usr/bin/env python3
"""Bizskoop asset pipeline: raw sources -> optimised web assets in both concept folders.

Run from the project root:  python -P -E tools/assets.py [section ...]
Sections (default: all): brand photos logos flags icons credits

Inputs (git-ignored): Logo.png (the client's logo), source-assets/stock (Unsplash originals, see credits.json),
source-assets/website/logos (regulator logos from bizskoop.com), source-assets/flags (flag-icons, MIT),
source-assets/icons (Lucide, ISC; Simple Icons, CC0).
Outputs: <site>/assets/img/... in both sites, src/shared/partials/icons.html (SVG sprite), <site>/CREDITS.md.
"""
import json
import re
import shutil
import site
import sys
from pathlib import Path

site.addsitedir(site.getusersitepackages())  # Pillow lives in the user site-packages
from PIL import Image  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'source-assets'
SITES = [ROOT / 'site-a-clear-path', ROOT / 'site-b-gateway']

PHOTOS = {  # output name: (source in source-assets/stock, max width)
    'hero-team': ('team-08', 2200), 'team-meeting': ('team-10', 1600), 'team-standing': ('team-03', 1400),
    'team-suits': ('consultant-12', 1600), 'team-classic': ('team-01', 1400),
    'consult-desk': ('consultant-08', 1600), 'consult-laptop': ('consultant-10', 1400), 'consult-pair': ('consultant-06', 1400),
    'p-asian-suit': ('consultant-13', 1000),
    'p-hijab-glasses': ('mal4-04', 1000), 'p-hijab-laptop': ('mal4-02', 1200), 'p-hijab-standing': ('mal4-15', 1000),
    'p-hijab-office': ('malay-04', 1000), 'p-hijab-pink': ('malay-00', 1000),
    'p-indian-woman-sofa': ('indianw-03', 1200), 'p-indian-woman-navy': ('indianw-05', 1200), 'p-indian-woman-desk': ('indianw-15', 1200),
    'p-indian-man-desk': ('indianm-06', 1400),
    'p-pakistani-suit': ('pak1-15', 1200), 'p-pakistani-shirt': ('pak1-08', 1200), 'p-bearded-suit': ('pak2-08', 1200),
    'p-caucasian-woman': ('caucasian-07', 1200), 'p-caucasian-phone': ('caucasian-10', 1200), 'p-caucasian-glasses': ('caucasian-14', 1000),
    'p-asian-woman-glasses': ('caucasian-03', 1200), 'p-asian-woman-seated': ('caucasian-09', 1200), 'p-asian-woman-blazer': ('accountant-08', 1000),
    'p-chinese-man-window': ('chi1-07', 1200), 'p-chinese-man-desk': ('chi1-06', 1000),
    'kl-towers-aerial': ('kl-01', 2000), 'kl-towers-sky': ('kl-10', 1400), 'kl-skyline': ('kl-12', 2000),
    'kl-skyline-wide': ('mal2-04', 2000), 'kl-founder': ('mal2-05', 1600), 'kl-towers-blue': ('mal2-08', 1400),
    'docs-signing': ('signing-00', 1400), 'docs-team-signing': ('signing-11', 1400), 'docs-handover': ('signing-03', 1400),
    'passport-stamps': ('passport-01', 1400), 'passport-airport': ('passport-12', 1400), 'passport-tickets': ('passport-14', 1400),
    'accounts-laptop': ('accountant-07', 1400),
    'handshake-office': ('handshake-00', 1400), 'handshake-docs': ('handshake-07', 1400), 'handshake-clipboard': ('handshake-15', 1400),
    'interview-blazer': ('interview-11', 1400), 'interview-cafe': ('interview-07', 1400),
    'airport-couple': ('family-07', 1600), 'airport-mother': ('family-14', 1200),
    'plan-board': ('whiteboard-04', 1400), 'plan-team': ('whiteboard-12', 1400),
    'support-call': ('phone-05', 1400), 'support-call-asian': ('phone-14', 1400),
    'sme-owner': ('store-02', 1400), 'sme-barista': ('store-01', 1400), 'sme-tablet': ('shop-00', 1400), 'sme-warehouse': ('shop-06', 1200),
}

LOGOS = {  # authority id: file prefix in source-assets/website/logos (bizskoop.com uploads)
    'ssm': 'SSM', 'lhdn': 'LHDN', 'mida': 'MIDA', 'miti': 'MITI', 'mdec': 'Mdec', 'matrade': 'MATRADE',
    'immigration': 'Immigration', 'esd': 'ESD', 'xpats': 'Xpats-Gateway', 'myfuturejobs': 'Myfuturejobs', 'irda': 'IRDA',
    'epf': 'EPF', 'socso': 'socso', 'hrdcorp': 'HRDcorp', 'bnm': 'BNM', 'sc': 'SC', 'kpdn': 'KPDNHEP', 'dbkl': 'DBKL',
    'cidb': 'CIBD', 'motac': 'Mohtac', 'customs': 'Customs', 'bomba': 'Bomba', 'doe': 'DOE', 'dosh': 'DOSH',
    'sirim': 'SIRIM', 'hdc': 'HDC',
}

ICON_ALIASES = {  # sprite id: Lucide file name
    'building': 'building-2', 'badge': 'badge-check', 'compass': 'compass', 'passport': 'id-card', 'globe': 'globe',
    'calculator': 'calculator', 'handshake': 'handshake', 'cpu': 'cpu', 'landmark': 'landmark', 'heart': 'heart-pulse',
    'factory': 'factory', 'cart': 'shopping-cart', 'graduation': 'graduation-cap', 'plane': 'plane', 'bolt': 'zap',
    'briefcase': 'briefcase', 'truck': 'truck', 'layers': 'layers', 'zap': 'zap', 'shield': 'shield-check',
    'message': 'message-circle', 'trend': 'trending-up', 'receipt': 'receipt', 'arrow-right': 'arrow-right',
    'arrow-up-right': 'arrow-up-right', 'arrow-left': 'arrow-left', 'check': 'check', 'x': 'x', 'plus': 'plus',
    'minus': 'minus', 'phone': 'phone', 'mail': 'mail', 'pin': 'map-pin', 'clock': 'clock', 'star': 'star',
    'search': 'search', 'send': 'send', 'chevron-down': 'chevron-down', 'chevron-left': 'chevron-left',
    'chevron-right': 'chevron-right', 'chevron-up': 'chevron-up', 'menu': 'menu', 'chat': 'message-square-text',
    'sparkles': 'sparkles', 'file': 'file-text', 'users': 'users', 'user-check': 'user-check', 'calendar': 'calendar-check',
    'external': 'external-link', 'quote': 'quote', 'circle-check': 'circle-check', 'file-badge': 'file-badge',
    'scale': 'scale', 'bot': 'bot', 'award': 'award', 'info': 'info', 'lock': 'lock', 'map': 'map',
    'clipboard': 'clipboard-check', 'file-check': 'file-check', 'wallet': 'wallet', 'rocket': 'rocket', 'target': 'target',
    'help': 'circle-help', 'list': 'list-checks', 'route': 'route', 'stamp': 'stamp', 'percent': 'badge-percent',
    'coins': 'hand-coins', 'book': 'book-open-check', 'plane-takeoff': 'plane-takeoff',
    'facebook': 'facebook', 'instagram': 'instagram', 'linkedin': 'linkedin',
}
BRANDS = ['tiktok', 'whatsapp']  # filled marks from Simple Icons
GOOGLE_G = ('<symbol id="i-google" viewBox="0 0 24 24">'
            '<path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81z"/>'
            '<path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3a7.2 7.2 0 0 1-10.73-3.78H1.32v3.1A12 12 0 0 0 12 24z"/>'
            '<path fill="#FBBC05" d="M5.33 14.31a7.2 7.2 0 0 1 0-4.62v-3.1H1.32a12 12 0 0 0 0 10.82l4.01-3.1z"/>'
            '<path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.59 1.8l3.44-3.44A11.53 11.53 0 0 0 12 0 12 12 0 0 0 1.32 6.59l4.01 3.1A7.15 7.15 0 0 1 12 4.77z"/>'
            '</symbol>')


def out(rel):
    return [s / 'assets' / 'img' / rel for s in SITES]


def save(img, rel, **kw):
    for p in out(rel):
        p.parent.mkdir(parents=True, exist_ok=True)
        if rel.endswith('.webp'):
            img.save(p, 'WEBP', **({'quality': 80, 'method': 6} | kw))
        else:
            img.save(p, **kw)
    print('  ', rel, img.size)


def brand():
    logo = Image.open(ROOT / 'Logo.png').convert('RGBA')
    save(logo, 'logo.png', optimize=True)
    # Favicon: the logo's own "B" and dot, centred on a white rounded-square tile.
    mark = logo.crop((0, 0, 212, logo.height))
    mark = mark.crop(mark.getbbox())
    size = 256
    tile = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    scale = 0.74 * size / max(mark.size)
    m = mark.resize((round(mark.width * scale), round(mark.height * scale)), Image.LANCZOS)
    bg = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    from PIL import ImageDraw
    ImageDraw.Draw(bg).rounded_rectangle((0, 0, size - 1, size - 1), radius=56, fill=(255, 255, 255, 255))
    tile = Image.alpha_composite(tile, bg)
    tile.alpha_composite(m, ((size - m.width) // 2, (size - m.height) // 2))
    save(tile.resize((64, 64), Image.LANCZOS), 'favicon.png', optimize=True)
    save(tile.resize((180, 180), Image.LANCZOS), 'apple-touch-icon.png', optimize=True)


def photos():
    for name, (src, width) in PHOTOS.items():
        im = Image.open(SRC / 'stock' / f'{src}.jpg').convert('RGB')
        if im.width > width:
            im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
        save(im, f'photos/{name}.webp', quality=78)


def logos():
    folder = SRC / 'website' / 'logos'
    for aid, prefix in LOGOS.items():
        f = next(folder.glob(f'{prefix}-Bizskoop-*.png'))
        im = Image.open(f).convert('RGBA')
        im = im.crop(im.getbbox())
        h = 160
        if im.height > h:
            im = im.resize((round(im.width * h / im.height), h), Image.LANCZOS)
        pad = Image.new('RGBA', (im.width + 8, im.height + 8), (255, 255, 255, 0))
        pad.alpha_composite(im, (4, 4))
        save(pad, f'logos/{aid}.webp', quality=90)


def flags():
    for f in sorted((SRC / 'flags').glob('*.svg')):
        svg = f.read_text(encoding='utf-8')
        if re.search(r'<script|\son\w+=|href="(?!#)', svg, re.I):  # only in-file #fragment references allowed
            raise SystemExit(f'unexpected content in {f.name}')
        for p in out(f'flags/{f.name}'):
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text(svg, encoding='utf-8', newline='\n')
        print('  ', f'flags/{f.name}')


SHAPES = re.compile(r'<(path|circle|rect|line|polyline|polygon|ellipse)\b[^>]*?/?>', re.I)


def icons():
    symbols = []
    for sid, name in ICON_ALIASES.items():
        svg = (SRC / 'icons' / 'lucide' / f'{name}.svg').read_text(encoding='utf-8')
        shapes = ''.join(m.group(0).replace('/>', '/>') for m in SHAPES.finditer(svg))
        symbols.append(f'<symbol id="i-{sid}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" '
                       f'stroke-linecap="round" stroke-linejoin="round">{shapes}</symbol>')
    for name in BRANDS:
        svg = (SRC / 'icons' / 'brands' / f'{name}.svg').read_text(encoding='utf-8')
        path = re.search(r'<path d="([^"]+)"', svg).group(1)
        symbols.append(f'<symbol id="i-{name}" viewBox="0 0 24 24"><path fill="currentColor" d="{path}"/></symbol>')
    symbols.append(GOOGLE_G)
    dest = ROOT / 'src' / 'shared' / 'partials' / 'icons.html'
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text('<!-- Icon sprite. Lucide (ISC), Simple Icons (CC0), Google G. Generated by tools/assets.py -->\n'
                    '<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden">'
                    + ''.join(symbols) + '</svg>\n', encoding='utf-8', newline='\n')
    print('   icons.html', len(symbols), 'symbols')


def credits():
    stock = json.loads((SRC / 'stock' / 'credits.json').read_text(encoding='utf-8'))
    lines = ['# Image and asset credits', '',
             'Every photo of people or places is a free-licence stock photo from Unsplash (Unsplash Licence: free for commercial use, no permission needed). '
             'None of them shows Bizskoop staff or clients; reviews on the site use initials, never these faces.', '',
             '| File | Photographer | Source |', '|---|---|---|']
    for name, (src, _) in PHOTOS.items():
        c = stock[src]
        lines.append(f"| `assets/img/photos/{name}.webp` | {c['author'] or 'Unsplash'} | {c['page']} |")
    lines += ['', '## Other assets', '',
              '- `assets/img/logo.png`, favicon: Bizskoop\'s own logo (supplied `Logo.png`). The favicon is the logo\'s B and dot on a white tile.',
              '- `assets/img/logos/*`: regulator logos as published on bizskoop.com ("Government Authorities We Navigate"), trimmed. '
              'They are the property of each authority and are shown only to name the agencies Bizskoop works with.',
              '- `assets/img/flags/*`: flag-icons by Panayiotis Lipiridis (MIT).',
              '- Icons: Lucide (ISC), Simple Icons (CC0) for TikTok and WhatsApp; the Google "G" mark identifies Google reviews.',
              '- Fonts: see `assets/css/fonts.css` (SIL Open Font License).', '']
    for s in SITES:
        (s / 'CREDITS.md').write_text('\n'.join(lines), encoding='utf-8', newline='\n')
    print('   CREDITS.md x2')


SECTIONS = {'brand': brand, 'photos': photos, 'logos': logos, 'flags': flags, 'icons': icons, 'credits': credits}

if __name__ == '__main__':
    for name in (sys.argv[1:] or list(SECTIONS)):
        print(name)
        SECTIONS[name]()
