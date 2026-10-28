"""Draft favicon marks. Geometry is constructed so the needle is one tangent of the drop."""
import math
from pathlib import Path

OUT = Path("/workspace/.grok/brand-preview")
PETROL, AMBER, PINE, MIST = "#15303F", "#D8830B", "#0B7361", "#EDF1F3"


def fmt(n):
    return f"{n:.2f}".rstrip("0").rstrip(".")


def construct(tip, theta_deg, tangent_len, radius, needle_len):
    """Upper edge of the drop is colinear with the needle.
    theta is the outward needle direction, degrees, y-down atan2 (0=east, -90=north).
    """
    tx, ty = tip
    th = math.radians(theta_deg)
    ux, uy = math.cos(th), math.sin(th)
    # Clockwise normal (screen): points to the belly side for an up-right needle.
    nx, ny = -uy, ux
    # Tangent point on the needle line, back from the tip.
    px, py = tx - ux * tangent_len, ty - uy * tangent_len
    cx, cy = px + nx * radius, py + ny * radius
    # Other tangent from tip to circle.
    dx, dy = tx - cx, ty - cy
    dist = math.hypot(dx, dy)
    base = math.atan2(dy, dx)
    phi = math.acos(max(-1, min(1, radius / dist)))
    others = []
    for sign in (1, -1):
        ang = base + sign * phi
        ox, oy = cx + radius * math.cos(ang), cy + radius * math.sin(ang)
        if math.hypot(ox - px, oy - py) > 0.8:
            others.append((ox, oy))
    if len(others) != 1:
        # both or none — pick farthest from the known tangent point
        cands = []
        for sign in (1, -1):
            ang = base + sign * phi
            ox, oy = cx + radius * math.cos(ang), cy + radius * math.sin(ang)
            cands.append((math.hypot(ox - px, oy - py), ox, oy))
        cands.sort()
        lx, ly = cands[-1][1], cands[-1][2]
    else:
        lx, ly = others[0]
    nex, ney = tx + ux * needle_len, ty + uy * needle_len
    return dict(c=(cx, cy), r=radius, tip=(tx, ty), left=(lx, ly), right=(px, py),
                needle=(nex, ney), theta=theta_deg)


def far_sweep(cx, cy, lx, ly, rx, ry, tx, ty):
    best = None
    for sweep in (0, 1):
        a = math.atan2(ly - cy, lx - cx)
        b = math.atan2(ry - cy, rx - cx)
        if sweep == 1:
            bb = b if b > a else b + 2 * math.pi
            span = bb - a
            sm = a + span / 2
        else:
            aa = a if a > b else a + 2 * math.pi
            span = aa - b
            sm = b + span / 2
        mx, my = cx + math.cos(sm) * math.hypot(lx - cx, ly - cy), cy + math.sin(sm) * 1
        # use radius from left point
        r = math.hypot(lx - cx, ly - cy)
        mx, my = cx + r * math.cos(sm), cy + r * math.sin(sm)
        if span <= math.pi + 0.08:
            continue
        dist = math.hypot(mx - tx, my - ty)
        if best is None or dist > best[0]:
            best = (dist, sweep, span)
    if not best:
        raise RuntimeError("arc")
    return best[1], best[2]


def svg_for(name, geo, sw, arc, mist=None):
    cx, cy = geo["c"]
    r = geo["r"]
    tx, ty = geo["tip"]
    lx, ly = geo["left"]
    rx, ry = geo["right"]
    nx, ny = geo["needle"]
    sweep, span = far_sweep(cx, cy, lx, ly, rx, ry, tx, ty)
    large = 1 if span > math.pi else 0
    d = (
        f"M {fmt(nx)} {fmt(ny)} L {fmt(tx)} {fmt(ty)} L {fmt(lx)} {fmt(ly)} "
        f"A {fmt(r)} {fmt(r)} 0 {large} {sweep} {fmt(rx)} {fmt(ry)} L {fmt(tx)} {fmt(ty)}"
    )
    arc_el = ""
    mist_el = ""
    if arc:
        acx, acy, ar, a0, a1, asw = arc
        def polar(deg, rad=ar):
            t = math.radians(deg)
            return acx + rad * math.cos(t), acy + rad * math.sin(t)
        x0, y0 = polar(a0)
        x1, y1 = polar(a1)
        span_a = (a1 - a0) % 360
        arc_el = (
            f'<path d="M {fmt(x0)} {fmt(y0)} A {fmt(ar)} {fmt(ar)} 0 {1 if span_a>180 else 0} 1 {fmt(x1)} {fmt(y1)}" '
            f'fill="none" stroke="{PINE}" stroke-width="{fmt(asw)}" stroke-linecap="round"/>'
        )
        if mist:
            # mist tick just beyond the high end, continuing the arc's tangent a touch outward
            t = math.radians(a1)
            length, msw = mist
            ox, oy = x1 + math.cos(t) * length, y1 + math.sin(t) * length
            mist_el = (
                f'<path d="M {fmt(x1)} {fmt(y1)} L {fmt(ox)} {fmt(oy)}" fill="none" stroke="{MIST}" '
                f'stroke-width="{fmt(msw)}" stroke-linecap="round"/>'
            )
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Fuellee">
  <rect width="64" height="64" rx="18" fill="{PETROL}"/>
  {arc_el}
  <path d="{d}" fill="none" stroke="{AMBER}" stroke-width="{fmt(sw)}" stroke-linecap="round" stroke-linejoin="round"/>
  {mist_el}
</svg>'''
    (OUT / f"mark-{name}.svg").write_text(svg)
    print(name, "theta", geo["theta"], "C", tuple(round(v,1) for v in geo["c"]), "sweep", sweep)
    print(" ", d)
    return svg


# tip, theta, tangent length, radius, needle length
GEOS = {
    "i": construct((34.5, 30.0), -60, 13.5, 9.4, 14.5),
    "j": construct((33.5, 31.0), -52, 12.5, 10.0, 15.0),
    "k": construct((35.0, 29.5), -66, 14.0, 9.0, 13.5),
    "l": construct((34.0, 30.5), -58, 15.5, 8.8, 14.0),
}

# arcs tuned after a first look — upper dial, thick for petrol contrast
ARCS = {
    "i": (31, 39, 20.5, 210, 336, 5.4),
    "j": (30, 40, 20.0, 216, 332, 5.6),
    "k": (32, 38, 20.0, 204, 340, 5.2),
    "l": (31, 39, 19.5, 212, 334, 5.5),
}

svgs = {}
for name, geo in GEOS.items():
    mist = (4.2, 3.2) if name in ("i", "k") else None
    svgs[name] = svg_for(name, geo, sw=6.6, arc=ARCS[name], mist=mist)

blocks = []
for name, svg in svgs.items():
    row = "".join(svg.replace("<svg ", f'<svg width="{w}" height="{w}" ') for w in (220, 64, 32, 16))
    blocks.append(f"<section><h2>{name}</h2><div class='row'>{row}</div></section>")

html = """<!doctype html><meta charset="utf-8"><style>
body{margin:10px;background:#737c82;color:#fff;font:13px ui-sans-serif,sans-serif}
section{margin-bottom:12px;background:#5e676d;padding:8px}
h2{margin:0 0 6px}
.row{display:flex;gap:14px;align-items:flex-end;background:#3e474c;padding:12px}
</style>""" + "\n".join(blocks)
(OUT / "sheet3.html").write_text(html)
print("wrote")
