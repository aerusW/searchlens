PY = r'C:\Users\Francesco\AppData\Local\Programs\Python\Python314\python.exe'

def rect(x, y, w, h, fill, rx=0, stroke=None, sw=1):
    s = f'stroke="{stroke}" stroke-width="{sw}"' if stroke else ''
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" {s}/>'

def txt(x, y, content, fill, size=13, weight='normal', anchor='start', ls=''):
    ls_attr = f'letter-spacing="{ls}"' if ls else ''
    return f'<text x="{x}" y="{y}" fill="{fill}" font-size="{size}" font-weight="{weight}" text-anchor="{anchor}" {ls_attr} font-family="system-ui,-apple-system,sans-serif">{content}</text>'

def toggle(x, y, on=True):
    bg = '#00838f' if on else '#2a2a3e'
    cx = x + 29   if on else x + 9
    cc = '#00e5ff' if on else '#555'
    return (f'<rect x="{x}" y="{y}" width="38" height="20" rx="10" fill="{bg}"/>'
            f'<circle cx="{cx}" cy="{y+10}" r="7" fill="{cc}"/>')

def chip(x, y, label, active=False):
    bg = '#003d44' if active else '#1e1e30'
    bc = '#00bcd4' if active else '#2a2a3e'
    tc = '#00e5ff' if active else '#aaa'
    w  = len(label) * 7 + 20
    return (f'<rect x="{x}" y="{y}" width="{w}" height="22" rx="11" fill="{bg}" stroke="{bc}" stroke-width="1"/>'
            f'<text x="{x+w//2}" y="{y+15}" fill="{tc}" font-size="11" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif">{label}</text>'), w

# ── panel.svg ────────────────────────────────────────────────────────────────
W, BG = 300, '#12121e'
L = [f'<svg width="{W}" height="576" xmlns="http://www.w3.org/2000/svg">',
     f'<rect width="{W}" height="576" rx="10" fill="{BG}"/>']

y = 0
# Header
L += [rect(0,y,W,48,'#1a1a2e',rx=10), rect(0,y+38,W,10,'#1a1a2e'), rect(0,y+47,W,1,'#2a2a3e'),
      '<circle cx="24" cy="24" r="8" fill="none" stroke="#00bcd4" stroke-width="2.2"/>',
      '<line x1="30" y1="30" x2="38" y2="38" stroke="#00bcd4" stroke-width="2.8" stroke-linecap="round"/>',
      txt(46,29,'SearchLens','#00bcd4',size=15,weight='600')]
y += 48

def glabel(y, label, sub=''):
    out = [rect(0,y,W,26,'#0e0e1a'), rect(0,y+25,W,1,'#1c1c2e'),
           txt(14,y+17,label,'#555',size=10,weight='600',ls='1')]
    if sub:
        out.append(txt(W-14,y+17,sub,'#3a3a5a',size=10,anchor='end'))
    return out, 26

def stoggle(y, label, on):
    h = 42
    return [rect(0,y,W,h,BG), rect(0,y+h-1,W,1,'#1c1c2e'),
            txt(14,y+25,label,'#e0e0e0',size=13), toggle(W-52,y+11,on=on)], h

gl,gh = glabel(y,'PAGE FILTERS'); L+=gl; y+=gh
for label,on in [('Hide sponsored',True),('Hide products',False),('Show images',True)]:
    sl,sh = stoggle(y,label,on); L+=sl; y+=sh

# Domain
L += [rect(0,y,W,86,BG), rect(0,y+85,W,1,'#1c1c2e'),
      txt(14,y+16,'DOMAIN','#555',size=10,weight='600',ls='1'),
      txt(76,y+16,'(show only)','#3a3a5a',size=10)]
cx = 14
for d,a in [('.com',True),('.it',True),('.be',False)]:
    c,cw = chip(cx,y+24,d,a); L.append(c); cx+=cw+6
L += [rect(14,y+54,210,24,'#1e1e30',rx=5,stroke='#2a2a3e',sw=1),
      txt(22,y+70,'Add domain…','#444',size=11),
      rect(232,y+54,28,24,'#1e1e30',rx=5,stroke='#2a2a3e',sw=1),
      txt(246,y+70,'+','#00bcd4',size=15,anchor='middle')]
y += 86

gl2,gh2 = glabel(y,'SEARCH FILTERS',sub='requires Apply'); L+=gl2; y+=gh2

# Filetype
L += [rect(0,y,W,72,BG), rect(0,y+71,W,1,'#1c1c2e'),
      txt(14,y+16,'FILE TYPE','#555',size=10,weight='600',ls='1'),
      txt(82,y+16,'(show only)','#3a3a5a',size=10)]
cx = 14
for ft in ['PDF','DOC','XLS','PPT','TXT','CSV']:
    c,cw = chip(cx,y+24,ft,False); L.append(c); cx+=cw+5
y += 72

# Language
L += [rect(0,y,W,50,BG), rect(0,y+49,W,1,'#1c1c2e'),
      txt(14,y+16,'LANGUAGE','#555',size=10,weight='600',ls='1'),
      rect(14,y+22,W-28,22,'#1e1e30',rx=5,stroke='#2a2a3e',sw=1),
      txt(22,y+37,'Any','#888',size=12), txt(W-20,y+37,'▾','#666',size=11,anchor='end')]
y += 50

# Site
L += [rect(0,y,W,56,BG), rect(0,y+55,W,1,'#1c1c2e'),
      txt(14,y+16,'SITE','#555',size=10,weight='600',ls='1'),
      rect(14,y+22,W-28,22,'#1e1e30',rx=5,stroke='#2a2a3e',sw=1),
      txt(22,y+37,'example.com','#444',size=12),
      txt(14,y+52,'Show results only from this site','#444',size=10)]
y += 56

# Footer
L += [rect(0,y,W,48,'#0e0e1a'),
      rect(14,y+10,W-28,30,'#003d44',rx=5,stroke='#00838f',sw=1),
      txt(W//2,y+29,'Apply to search','#00e5ff',size=12,weight='600',anchor='middle')]

L.append('</svg>')
with open(r'C:\Users\Francesco\Documents\Projects\searchlens\assets\panel.svg','w',encoding='utf-8') as f:
    f.write('\n'.join(L))
print('panel.svg done, height',y+48)

# ── overview.svg ─────────────────────────────────────────────────────────────
# Two-column layout: zones on left (ZX=10, ZW=420), legend on right (LX=460).
# Canvas is 760px wide so the two columns never overlap.
W2, H2 = 760, 480
ZX, ZW = 10, 420   # zone column bounds
LX      = 460      # legend column start

L2 = [f'<svg width="{W2}" height="{H2}" xmlns="http://www.w3.org/2000/svg">',
      f'<rect width="{W2}" height="{H2}" fill="#12121e" rx="12"/>',
      txt(W2//2, 28, 'What SearchLens filters on Google Search',
          '#00bcd4', size=14, weight='600', anchor='middle')]

def zone_rect(x, y, w, h, color, alpha):
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="4" '
            f'fill="{color}" fill-opacity="{alpha}" '
            f'stroke="{color}" stroke-width="1.5" stroke-opacity="0.6"/>')

# slim_appbar — narrow grey divider at top
L2.append(zone_rect(ZX, 44, ZW, 12, '#888', 0.35))

# Sponsored — two ad-like blocks
L2.append(zone_rect(ZX, 62, ZW, 58, '#ff5252', 0.18))
for i in range(2):
    ay = 68 + i * 26
    L2 += [f'<rect x="20" y="{ay}" width="200" height="9" rx="3" fill="#ff5252" fill-opacity="0.45"/>',
           f'<rect x="20" y="{ay+12}" width="340" height="6" rx="3" fill="#ff5252" fill-opacity="0.2"/>']

# Organic results — three blocks
for i in range(3):
    ry = 132 + i * 56
    L2 += [f'<rect x="{ZX}" y="{ry}" width="{ZW}" height="48" rx="4" '
           f'fill="#1e2d1e" fill-opacity="0.5" stroke="#4caf50" stroke-width="1" stroke-opacity="0.4"/>',
           f'<rect x="20" y="{ry+8}" width="180" height="9" rx="3" fill="#4caf50" fill-opacity="0.5"/>',
           f'<rect x="20" y="{ry+22}" width="320" height="6" rx="3" fill="#2e3d2e" fill-opacity="0.8"/>',
           f'<rect x="20" y="{ry+33}" width="220" height="6" rx="3" fill="#2e3d2e" fill-opacity="0.8"/>']

# Images strip
L2.append(zone_rect(ZX, 302, ZW, 50, '#42a5f5', 0.18))
for i in range(5):
    L2.append(f'<rect x="{20+i*80}" y="312" width="70" height="32" rx="3" fill="#42a5f5" fill-opacity="0.25"/>')

# Products carousel
L2.append(zone_rect(ZX, 360, ZW, 68, '#ff9800', 0.18))
for i in range(4):
    px = 18 + i * 102
    L2 += [f'<rect x="{px}" y="370" width="92" height="50" rx="3" fill="#ff9800" fill-opacity="0.18"/>',
           f'<rect x="{px+6}" y="376" width="80" height="26" rx="2" fill="#ff9800" fill-opacity="0.12"/>',
           f'<rect x="{px+6}" y="406" width="56" height="6" rx="2" fill="#ff9800" fill-opacity="0.28"/>']

# ── Right-column legend ───────────────────────────────────────────────────────
# Separated from zone column by 30px gap (ZX+ZW=430, LX=460).
# Each entry: 4px colored bar | bold name on first line | dim description below.
# 54px row height gives comfortable reading room.
LEGEND = [
    ('#888',    'slim_appbar', 'Always hidden — empty UI divider'),
    ('#ff5252', 'Sponsored',   '"Hide sponsored" toggle'),
    ('#4caf50', 'Results',     'Organic results — always visible'),
    ('#42a5f5', 'Images',      '"Show images" toggle'),
    ('#ff9800', 'Products',    '"Hide products" toggle'),
]

L2.append(txt(LX, 40, 'FILTER ZONES', '#555', size=9, weight='600', ls='1'))
L2.append(f'<rect x="{LX}" y="45" width="{W2-LX-16}" height="1" fill="#2a2a3e"/>')

for i, (color, name, desc) in enumerate(LEGEND):
    ey = 56 + i * 54
    L2.append(f'<rect x="{LX}" y="{ey}" width="4" height="38" rx="2" fill="{color}" fill-opacity="0.9"/>')
    L2.append(txt(LX + 14, ey + 15, name,  '#e0e0e0', size=12, weight='600'))
    L2.append(txt(LX + 14, ey + 30, desc,  '#777',    size=10))

L2.append('</svg>')
with open(r'C:\Users\Francesco\Documents\Projects\searchlens\assets\overview.svg','w',encoding='utf-8') as f:
    f.write('\n'.join(L2))
print('overview.svg done')
