"""Iterate the favicon until 16px and 32px ASCII reads as drop + needle."""
import math
from pathlib import Path

OUT = Path("/workspace/.grok/brand-preview")
PETROL, AMBER, PINE, MIST = "#15303F", "#D8830B", "#0B7361", "#EDF1F3"


def fmt(n):
    return f"{n:.2f}".rstrip("0").rstrip(".")


def construct(tip, theta_deg, tangent_len, radius, needle_len):
    tx, ty = tip
    th = math.radians(theta_deg)
    ux, uy = math.cos(th), math.sin(th)
    nx, ny = -uy, ux
    px, py = tx - ux * tangent_len, ty - uy * tangent_len
    cx, cy = px + nx * radius, py + ny * radius
    dx, dy = tx - cx, ty - cy
    dist = math.hypot(dx, dy)
    base = math.atan2(dy, dx)
    phi = math.acos(max(-1, min(1, radius / dist)))
    cands = []
    for sign in (1, -1):
        ang = base + sign * phi
        ox, oy = cx + radius * math.cos(ang), cy + radius * math.sin(ang)
        cands.append((math.hypot(ox - px, oy - py), ox, oy))
    cands.sort()
    lx, ly = cands[-1][1], cands[-1][2]
    nex, ney = tx + ux * needle_len, ty + uy * needle_len
    return dict(c=(cx, cy), r=radius, tip=(tx, ty), left=(lx, ly), right=(px, py),
                needle=(nex, ney), u=(ux, uy))


def far_sweep(cx, cy, r, lx, ly, rx, ry):
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
        if span <= math.pi + 0.05:
            continue
        my = cy + r * math.sin(sm)
        if best is None or my > best[0]:
            best = (my, sweep, span)
    if not best:
        raise RuntimeError("no belly arc")
    return best[1], best[2]


def arc_points(acx, acy, ar, a0, a1, n=48):
    span = (a1 - a0) % 360
    pts = []
    for i in range(n + 1):
        deg = a0 + span * i / n
        t = math.radians(deg)
        pts.append((acx + ar * math.cos(t), acy + ar * math.sin(t)))
    return pts


def amber_points(geo, n_arc=56):
    cx, cy = geo["c"]
    r = geo["r"]
    lx, ly = geo["left"]
    rx, ry = geo["right"]
    sweep, _ = far_sweep(cx, cy, r, lx, ly, rx, ry)
    a = math.atan2(ly - cy, lx - cx)
    b = math.atan2(ry - cy, rx - cx)
    pts = [geo["needle"], geo["tip"], geo["left"]]
    if sweep == 1:
        bb = b if b > a else b + 2 * math.pi
        for i in range(1, n_arc):
            t = a + (bb - a) * i / n_arc
            pts.append((cx + r * math.cos(t), cy + r * math.sin(t)))
    else:
        aa = a if a > b else a + 2 * math.pi
        for i in range(1, n_arc):
            t = a - (aa - b) * i / n_arc
            pts.append((cx + r * math.cos(t), cy + r * math.sin(t)))
    pts += [geo["right"], geo["tip"]]
    return pts


def min_clearance(geo, sw, arc):
    ap = amber_points(geo)
    acx, acy, ar, a0, a1, asw = arc
    pp = arc_points(acx, acy, ar, a0, a1)
    best = 1e9
    for x, y in ap:
        for u, v in pp:
            best = min(best, math.hypot(x - u, y - v))
    return best - sw / 2 - asw / 2


def svg(geo, sw, arc, mist=None):
    cx, cy = geo["c"]
    r = geo["r"]
    tx, ty = geo["tip"]
    lx, ly = geo["left"]
    rx, ry = geo["right"]
    nx, ny = geo["needle"]
    sweep, _ = far_sweep(cx, cy, r, lx, ly, rx, ry)
    d = (
        f"M {fmt(nx)} {fmt(ny)} L {fmt(tx)} {fmt(ty)} L {fmt(lx)} {fmt(ly)} "
        f"A {fmt(r)} {fmt(r)} 0 1 {sweep} {fmt(rx)} {fmt(ry)} L {fmt(tx)} {fmt(ty)}"
    )
    parts = [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Fuellee">',
        f'  <rect width="64" height="64" rx="18" fill="{PETROL}"/>',
    ]
    acx, acy, ar, a0, a1, asw = arc
    def polar(deg, rad=ar):
        t = math.radians(deg)
        return acx + rad * math.cos(t), acy + rad * math.sin(t)
    x0, y0 = polar(a0)
    x1, y1 = polar(a1)
    span_a = (a1 - a0) % 360
    parts.append(
        f'  <path d="M {fmt(x0)} {fmt(y0)} A {fmt(ar)} {fmt(ar)} 0 {1 if span_a > 180 else 0} 1 {fmt(x1)} {fmt(y1)}" '
        f'fill="none" stroke="{PINE}" stroke-width="{fmt(asw)}" stroke-linecap="round"/>'
    )
    if mist:
        length, msw = mist
        # outward tick at the arc's crown (highest point along the span)
        crown = None
        for i in range(25):
            deg = a0 + span_a * i / 24
            px, py = polar(deg)
            if crown is None or py < crown[0]:
                crown = (py, deg, px, py)
        _, deg, x, y = crown
        t = math.radians(deg)
        ox, oy = x + math.cos(t) * length, y + math.sin(t) * length
        parts.append(
            f'  <path d="M {fmt(x)} {fmt(y)} L {fmt(ox)} {fmt(oy)}" fill="none" stroke="{MIST}" '
            f'stroke-width="{fmt(msw)}" stroke-linecap="round"/>'
        )
    parts.append(
        f'  <path d="{d}" fill="none" stroke="{AMBER}" stroke-width="{fmt(sw)}" '
        f'stroke-linecap="round" stroke-linejoin="round"/>'
    )
    parts.append("</svg>")
    return "\n".join(parts) + "\n", d


def main():
    geo = construct(tip=(34.2, 30.0), theta_deg=-52, tangent_len=11.6, radius=9.3, needle_len=16.8)
    arc = (18.5, 32.5, 15.2, 250, 322, 5.5)
    gap = min_clearance(geo, 7.6, arc)
    text, _ = svg(geo, sw=7.6, arc=arc, mist=(4.0, 3.3))
    (OUT / "mark-final.svg").write_text(text)
    print("clearance", round(gap, 2))
    print("needle", tuple(round(v, 2) for v in geo["needle"]), "C", tuple(round(v, 2) for v in geo["c"]))
    print(text)


if __name__ == "__main__":
    main()
