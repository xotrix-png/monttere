"""
Recreate the MONTÉRRE saloon leaf from the reference photograph.

Run:
  blender --background --python generate_door.py

The reference is src/assets/images/doors-leaf-left.png (same leaf as the
supplied photo, at the original resolution). Assumptions are listed in REPORT
at the bottom of this file and printed after the export.
"""

import array
import math
import os

import bmesh
import bpy
from mathutils import Matrix, Vector

ROOT = os.path.dirname(os.path.abspath(__file__))
PROJECT = os.path.normpath(os.path.join(ROOT, "..", ".."))
SRC_PHOTO = os.path.join(PROJECT, "src", "assets", "images", "doors-leaf-left.png")
TEX_DIR = os.path.join(ROOT, "textures")
BLEND_PATH = os.path.join(ROOT, "saloon_door.blend")
GLB_PATH = os.path.join(ROOT, "saloon_door.glb")

# Photo is 871 x 2297. Height is the one assumed real-world measure.
PW = 871
PH = 2297
DOOR_H = 2.20
# The photo keeps a gray-black fringe under the leaf. The wood itself
# is solid by this row, so the foot ends here instead of on the cutout.
BOTTOM_PY = 2252.0
# Thickness faces, and the front edge, read this interior row.
# The photo below it is the gray-black cutout.
FOOT_PY = 2180.0
EDGE_PY = 2210.0
THICK = 0.042
Y_FRONT = -THICK * 0.5
Y_BACK = THICK * 0.5

# Pixel layout measured on the reference.
LEFT_PX = 28.0
RIGHT_PX = 860.0
STILE_L = 128.0
STILE_R = 812.0
STILE_TOP_PY = 348.0
RAIL_UNDER_PY = 408.0
SLAT_BOT_PY = 1508.0
PANEL_TOP_PY = 1695.0
PANEL_BOT_PY = 2040.0
PANEL_L = 176.0
PANEL_R = 748.0
# Gap centers (photo y, top-down) between the louver boards.
GAP_PY = [460, 536, 620, 715, 789, 866, 971, 1032, 1125, 1197, 1301, 1375, 1435]
GAP_M = 0.0065
# Top silhouette, photo x -> photo y. Flat along the hinge stile, then the rise.
CURVE = [
    (28, 350), (44, 348), (60, 348), (76, 348), (92, 347), (108, 347),
    (124, 348), (140, 346), (156, 343), (172, 338), (188, 332), (204, 327),
    (220, 322), (236, 320), (252, 317), (268, 315), (284, 312), (300, 309),
    (316, 306), (332, 301), (348, 296), (364, 289), (380, 282), (396, 274),
    (412, 265), (428, 256), (444, 245), (460, 234), (476, 221), (492, 208),
    (508, 194), (524, 179), (540, 163), (556, 148), (572, 133), (588, 119),
    (604, 105), (620, 93), (636, 82), (652, 72), (668, 63), (684, 55),
    (700, 47), (716, 41), (732, 35), (748, 29), (764, 23), (780, 17),
    (796, 11), (812, 5), (828, 2), (844, 5), (860, 9),
]
# Hinges, photo pixels (x0, x1, y0, y1).
HINGES = [(94, 120, 553, 772), (94, 120, 1660, 1879)]
SKEW = [0.0022, -0.0018, 0.0026, -0.0024, 0.0015, -0.0028, 0.0020,
        -0.0012, 0.0025, -0.0022, 0.0018, -0.0026, 0.0014, -0.0020]


def X(px):
    return DOOR_H * px / PH


def Z(py):
    return DOOR_H * (BOTTOM_PY - py) / PH


def curve_py(px):
    if px <= CURVE[0][0]:
        return CURVE[0][1]
    if px >= CURVE[-1][0]:
        return CURVE[-1][1]
    for i in range(len(CURVE) - 1):
        x0, y0 = CURVE[i]
        x1, y1 = CURVE[i + 1]
        if x0 <= px <= x1:
            t = (px - x0) / (x1 - x0)
            return y0 + (y1 - y0) * t
    return CURVE[-1][1]


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.scale_length = 1.0
    os.makedirs(TEX_DIR, exist_ok=True)
    return scene


def load_photo():
    src = bpy.data.images.load(SRC_PHOTO)
    w, h = int(src.size[0]), int(src.size[1])
    raw = array.array("f", [0.0]) * (w * h * 4)
    src.pixels.foreach_get(raw)
    return w, h, raw


def photo_rgb(raw, w, h, x, py):
    """py is top-down. Blender stores the bottom row first."""
    by = h - 1 - py
    i = (by * w + x) * 4
    return raw[i], raw[i + 1], raw[i + 2], raw[i + 3]


def build_textures(w, h, raw):
    n = w * h
    mask = bytearray(n)
    lum = array.array("f", [0.0]) * n
    for py in range(h):
        for x in range(w):
            r, g, b, a = photo_rgb(raw, w, h, x, py)
            i = py * w + x
            if a > 0.08 and (r + g + b) > 0.045:
                mask[i] = 1
                lum[i] = r * 0.30 + g * 0.59 + b * 0.11
    door = bytearray(mask)

    # Dilate the wood color a few pixels past the silhouette so UV edges
    # do not pick up the black background.
    rgb = [array.array("f", [0.0]) * n for _ in range(3)]
    for py in range(h):
        for x in range(w):
            i = py * w + x
            if not mask[i]:
                continue
            r, g, b, _ = photo_rgb(raw, w, h, x, py)
            rgb[0][i], rgb[1][i], rgb[2][i] = r, g, b
    for _ in range(10):
        nxt = bytearray(mask)
        nr = rgb[0][:]
        ng = rgb[1][:]
        nb = rgb[2][:]
        for py in range(1, h - 1):
            row = py * w
            for x in range(1, w - 1):
                i = row + x
                if mask[i]:
                    continue
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    j = i + dy * w + dx
                    if mask[j]:
                        nxt[i] = 1
                        nr[i], ng[i], nb[i] = rgb[0][j], rgb[1][j], rgb[2][j]
                        break
        mask, rgb[0], rgb[1], rgb[2] = nxt, nr, ng, nb

    def blur(src_arr, radius):
        tmp = array.array("f", [0.0]) * n
        acc = array.array("f", [0.0]) * n
        for py in range(h):
            row = py * w
            prefix = 0.0
            pref = array.array("f", [0.0]) * (w + 1)
            for x in range(w):
                prefix += src_arr[row + x]
                pref[x + 1] = prefix
            for x in range(w):
                lo = x - radius if x - radius > 0 else 0
                hi = x + radius if x + radius < w - 1 else w - 1
                tmp[row + x] = (pref[hi + 1] - pref[lo]) / (hi - lo + 1)
        for x in range(w):
            prefix = 0.0
            pref = array.array("f", [0.0]) * (h + 1)
            for py in range(h):
                prefix += tmp[py * w + x]
                pref[py + 1] = prefix
            for py in range(h):
                lo = py - radius if py - radius > 0 else 0
                hi = py + radius if py + radius < h - 1 else h - 1
                acc[py * w + x] = (pref[hi + 1] - pref[lo]) / (hi - lo + 1)
        return acc

    local = blur(lum, 11)
    # Rubbed edges of the silhouette, a few pixels in from the cutout.
    edge = bytearray(n)
    for py in range(1, h - 1):
        row = py * w
        for x in range(1, w - 1):
            i = row + x
            if door[i] and (
                not door[i - 1] or not door[i + 1] or not door[i - w] or not door[i + w]
            ):
                edge[i] = 6
    for _ in range(5):
        grown = bytearray(edge)
        for py in range(1, h - 1):
            row = py * w
            for x in range(1, w - 1):
                i = row + x
                if edge[i] or not door[i]:
                    continue
                near = max(edge[i - 1], edge[i + 1], edge[i - w], edge[i + w])
                if near > 1:
                    grown[i] = near - 1
        edge = grown

    albedo = array.array("f", [0.0]) * (n * 4)
    rough = array.array("f", [0.0]) * (n * 4)
    wear_buf = array.array("f", [0.0]) * (n * 4)
    normal = array.array("f", [0.0]) * (n * 4)
    flat_lum = array.array("f", [0.0]) * n
    for py in range(h):
        row = py * w
        for x in range(w):
            i = row + x
            r, g, b = rgb[0][i], rgb[1][i], rgb[2][i]
            L = lum[i]
            # Keep the photographed darkness. Only warm it so the stain
            # stays brown instead of drifting to gray under white light.
            wr, wg, wb = r * 1.12, g * 0.93, b * 0.74
            lw = wr * 0.30 + wg * 0.59 + wb * 0.11
            if lw > 1e-6 and L > 0.0:
                scale = L / lw
                r, g, b = wr * scale, wg * scale, wb * scale
            # Scratches already in the photo: streaks lighter than the board.
            photo_wear = 0.0
            if local[i] > 0.01:
                photo_wear = (L - local[i] - 0.022) / 0.08
                photo_wear = 0.0 if photo_wear < 0.0 else (1.0 if photo_wear > 1.0 else photo_wear)
            # Short broken scratches along the grain. Sparse, not a grunge overlay.
            band = py // 2
            scratch = 0.0
            if ((x * 13 + band * 89) & 255) < 2 and ((band * 47) % 240) < 4:
                if ((x + band * 5) % 80) < 16:
                    scratch = 0.42
            edge_wear = edge[i] / 6.0 * 0.32
            wear = photo_wear * 0.75
            if scratch > wear:
                wear = scratch
            if edge_wear > wear:
                wear = edge_wear
            # Worn wood goes warm and a little lighter. The body stays dark.
            sr = min(1.0, r * 2.6 + 0.04)
            sg = min(1.0, g * 1.65 + 0.025)
            sb = min(1.0, b * 1.05 + 0.012)
            r = r * (1.0 - wear) + sr * wear
            g = g * (1.0 - wear) + sg * wear
            b = b * (1.0 - wear) + sb * wear
            # The photograph is a near-black stain. Keep that depth.
            r *= 0.30
            g *= 0.26
            b *= 0.22
            o = i * 4
            albedo[o] = r
            albedo[o + 1] = g
            albedo[o + 2] = b
            albedo[o + 3] = 1.0
            flat_lum[i] = r * 0.30 + g * 0.59 + b * 0.11
            rv = 0.86 - wear * 0.38
            rv = 0.40 if rv < 0.40 else (0.94 if rv > 0.94 else rv)
            rough[o] = rough[o + 1] = rough[o + 2] = rv
            rough[o + 3] = 1.0
            wear_buf[o] = wear_buf[o + 1] = wear_buf[o + 2] = wear
            wear_buf[o + 3] = 1.0

    # High-frequency grain only, so the photo's lighting does not become a bulge.
    hp = array.array("f", [0.0]) * n
    grain = blur(flat_lum, 2)
    for i in range(n):
        hp[i] = flat_lum[i] - grain[i]
    scale = 6.5
    for py in range(h):
        for x in range(w):
            i = py * w + x
            xm = i - 1 if x > 0 else i
            xp = i + 1 if x + 1 < w else i
            ym = i - w if py > 0 else i
            yp = i + w if py + 1 < h else i
            dx = (hp[xp] - hp[xm]) * scale
            # Photo y grows downward; tangent +V grows up the image.
            dy = -(hp[yp] - hp[ym]) * scale
            dz = 1.0
            length = math.sqrt(dx * dx + dy * dy + dz * dz)
            by = h - 1 - py
            o = (by * w + x) * 4
            normal[o] = dx / length * 0.5 + 0.5
            normal[o + 1] = dy / length * 0.5 + 0.5
            normal[o + 2] = dz / length * 0.5 + 0.5
            normal[o + 3] = 1.0

    # Albedo and roughness were filled top-down. Flip them into Blender order.
    def flip(buf):
        out = array.array("f", [0.0]) * (n * 4)
        for py in range(h):
            by = h - 1 - py
            out[by * w * 4:(by + 1) * w * 4] = buf[py * w * 4:(py + 1) * w * 4]
        return out

    return flip(albedo), normal, flip(rough), flip(wear_buf)


def save_texture(name, w, h, pixels, path, colorspace):
    # alpha=True is required. With alpha=False, Blender 5 saves the empty
    # generated buffer and the PNG comes out black.
    img = bpy.data.images.new(name, w, h, alpha=True, float_buffer=True)
    try:
        img.colorspace_settings.name = colorspace
    except (TypeError, ValueError):
        img.colorspace_settings.name = "Non-Color"
    img.pixels.foreach_set(pixels)
    img.alpha_mode = "STRAIGHT"
    img.filepath_raw = path
    img.file_format = "PNG"
    img.save()
    print(name, "saved pixel", round(img.pixels[0], 4), path)
    img.pack()
    return img


def new_mesh(name, bm, recalc=True):
    if recalc:
        bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    me.update()
    obj = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(obj)
    return obj


def assign_uv(face, layer, uvs):
    for loop, uv in zip(face.loops, uvs):
        loop[layer].uv = uv


def uv_px(px, py):
    return (px / PW, 1.0 - py / PH)


def foot_v():
    return uv_px(0.0, FOOT_PY)[1]


def py_of_z(z):
    return BOTTOM_PY - z * PH / DOOR_H


def make_board(name, x0, x1, z0, z1, y0, y1, px0, px1, py_top, py_bot, skew=0.0, end_caps=True):
    """Closed board. y0 is the front face. skew tilts the left edge up."""
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new("UVMap")
    z0l, z0r = z0 + skew, z0 - skew
    z1l, z1r = z1 + skew, z1 - skew
    verts = [
        bm.verts.new((x0, y0, z0l)),
        bm.verts.new((x1, y0, z0r)),
        bm.verts.new((x1, y0, z1r)),
        bm.verts.new((x0, y0, z1l)),
        bm.verts.new((x0, y1, z0l)),
        bm.verts.new((x1, y1, z0r)),
        bm.verts.new((x1, y1, z1r)),
        bm.verts.new((x0, y1, z1l)),
    ]
    faces = {
        "front": (0, 1, 2, 3),
        "back": (5, 4, 7, 6),
        "bottom": (4, 5, 1, 0),
        "top": (3, 2, 6, 7),
        "left": (4, 0, 3, 7),
        "right": (1, 5, 6, 2),
    }
    if not end_caps:
        del faces["left"]
        del faces["right"]
    front = [
        uv_px(px0, py_bot),
        uv_px(px1, py_bot),
        uv_px(px1, py_top),
        uv_px(px0, py_top),
    ]
    back = [front[1], front[0], front[3], front[2]]
    strip_u0, strip_u1 = 50 / PW, 92 / PW
    side = {
        "bottom": [
            (strip_u0, foot_v()),
            (strip_u1, foot_v()),
            (strip_u1, foot_v()),
            (strip_u0, foot_v()),
        ],
        "top": [
            (strip_u0, uv_px(px0, py_top)[1]),
            (strip_u1, uv_px(px1, py_top)[1]),
            (strip_u1, uv_px(px1, py_top)[1]),
            (strip_u0, uv_px(px0, py_top)[1]),
        ],
        "left": [
            (strip_u0, uv_px(px0, py_bot)[1]),
            (strip_u1, uv_px(px0, py_bot)[1]),
            (strip_u1, uv_px(px0, py_top)[1]),
            (strip_u0, uv_px(px0, py_top)[1]),
        ],
        "right": [
            (strip_u0, uv_px(px1, py_bot)[1]),
            (strip_u1, uv_px(px1, py_bot)[1]),
            (strip_u1, uv_px(px1, py_top)[1]),
            (strip_u0, uv_px(px1, py_top)[1]),
        ],
    }
    uv_sets = {"front": front, "back": back, **side}
    for key, idxs in faces.items():
        face = bm.faces.new([verts[i] for i in idxs])
        assign_uv(face, uv, uv_sets[key])
    return new_mesh(name, bm)


def make_curved(name, x0, x1, z_bottom, y0, y1, step_px=8.0, cap_left=True, cap_right=True):
    samples = []
    px = x0
    while px < x1 - 0.01:
        samples.append(px)
        px += step_px
    samples.append(x1)
    zs = [Z(curve_py(px)) for px in samples]
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new("UVMap")

    def vert(px, y, z):
        return bm.verts.new((X(px), y, z))

    front_b = [vert(px, y0, z_bottom) for px in samples]
    front_t = [vert(px, y0, z) for px, z in zip(samples, zs)]
    back_b = [vert(px, y1, z_bottom) for px in samples]
    back_t = [vert(px, y1, z) for px, z in zip(samples, zs)]
    py_bot = py_of_z(z_bottom)
    if z_bottom <= 0.001:
        py_bot = min(py_bot, EDGE_PY)

    for i in range(len(samples) - 1):
        pxa, pxb = samples[i], samples[i + 1]
        pya, pyb = curve_py(pxa), curve_py(pxb)
        front = bm.faces.new((front_b[i], front_b[i + 1], front_t[i + 1], front_t[i]))
        assign_uv(front, uv, [
            uv_px(pxa, py_bot), uv_px(pxb, py_bot), uv_px(pxb, pyb), uv_px(pxa, pya),
        ])
        back = bm.faces.new((back_b[i + 1], back_b[i], back_t[i], back_t[i + 1]))
        assign_uv(back, uv, [
            uv_px(pxb, py_bot), uv_px(pxa, py_bot), uv_px(pxa, pya), uv_px(pxb, pyb),
        ])
        top = bm.faces.new((front_t[i], front_t[i + 1], back_t[i + 1], back_t[i]))
        assign_uv(top, uv, [
            uv_px(pxa, pya), uv_px(pxb, pyb), uv_px(pxb, pyb), uv_px(pxa, pya),
        ])
        bot = bm.faces.new((back_b[i], back_b[i + 1], front_b[i + 1], front_b[i]))
        assign_uv(bot, uv, [
            (50 / PW, foot_v()),
            (92 / PW, foot_v()),
            (92 / PW, foot_v()),
            (50 / PW, foot_v()),
        ])
    if cap_left:
        cap_l = bm.faces.new((back_b[0], front_b[0], front_t[0], back_t[0]))
        assign_uv(cap_l, uv, [
            uv_px(samples[0], py_bot), uv_px(samples[0], py_bot),
            uv_px(samples[0], curve_py(samples[0])), uv_px(samples[0], curve_py(samples[0])),
        ])
    if cap_right:
        cap_r = bm.faces.new((front_b[-1], back_b[-1], back_t[-1], front_t[-1]))
        assign_uv(cap_r, uv, [
            uv_px(samples[-1], py_bot), uv_px(samples[-1], py_bot),
            uv_px(samples[-1], curve_py(samples[-1])), uv_px(samples[-1], curve_py(samples[-1])),
        ])
    return new_mesh(name, bm, recalc=False)


def add_bevel(obj, width):
    mod = obj.modifiers.new("Bevel", "BEVEL")
    mod.width = width
    mod.segments = 2
    mod.limit_method = "ANGLE"
    mod.angle_limit = math.radians(42)
    mod.harden_normals = True
    for poly in obj.data.polygons:
        poly.use_smooth = True
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode="OBJECT")
    bpy.ops.object.modifier_apply(modifier=mod.name)
    # The bevel ring under the foot was picking up the photo's black cutout.
    # Any face sitting on the foot, other than the photographed front,
    # reads a solid wood texel.
    mesh = obj.data
    if not mesh.uv_layers or not mesh.vertices:
        return
    zmin = min(vert.co.z for vert in mesh.vertices)
    uv = mesh.uv_layers.active.data
    v = foot_v()
    for poly in mesh.polygons:
        lowest = min(mesh.vertices[i].co.z for i in poly.vertices)
        if lowest > zmin + 0.008:
            continue
        if poly.normal.y < -0.82 and poly.normal.z > -0.25:
            continue
        for li in poly.loop_indices:
            uv[li].uv = (0.48, v)


def wood_material(albedo, normal, rough, wear):
    mat = bpy.data.materials.new("Wood_Old")
    mat.use_nodes = True
    nt = mat.node_tree
    nodes = nt.nodes
    links = nt.links
    bsdf = nodes["Principled BSDF"]
    bsdf.inputs["Roughness"].default_value = 0.82
    if "Specular IOR Level" in bsdf.inputs:
        bsdf.inputs["Specular IOR Level"].default_value = 0.28

    tex = nodes.new("ShaderNodeTexImage")
    tex.image = albedo
    tex.location = (-980, 280)
    wimg = nodes.new("ShaderNodeTexImage")
    wimg.image = wear
    wimg.location = (-980, 40)
    nimg = nodes.new("ShaderNodeTexImage")
    nimg.image = normal
    nimg.location = (-980, -240)
    rimg = nodes.new("ShaderNodeTexImage")
    rimg.image = rough
    rimg.location = (-980, -500)

    # Real board edges catch a dull rub. The scratch map is already in the albedo.
    bevel = nodes.new("ShaderNodeBevel")
    bevel.location = (-760, -40)
    bevel.samples = 2
    bevel.inputs["Radius"].default_value = 0.0035
    geom = nodes.new("ShaderNodeNewGeometry")
    geom.location = (-760, -220)
    dot = nodes.new("ShaderNodeVectorMath")
    dot.location = (-520, -80)
    dot.operation = "DOT_PRODUCT"
    links.new(bevel.outputs["Normal"], dot.inputs[0])
    links.new(geom.outputs["Normal"], dot.inputs[1])
    edge = nodes.new("ShaderNodeMath")
    edge.location = (-320, -80)
    edge.operation = "SUBTRACT"
    edge.inputs[0].default_value = 1.0
    links.new(dot.outputs["Value"], edge.inputs[1])
    edge_amt = nodes.new("ShaderNodeMath")
    edge_amt.location = (-140, -80)
    edge_amt.operation = "MULTIPLY"
    edge_amt.inputs[1].default_value = 0.38
    links.new(edge.outputs["Value"], edge_amt.inputs[0])

    scuff = nodes.new("ShaderNodeMix")
    scuff.location = (-120, 240)
    scuff.data_type = "RGBA"
    scuff.inputs[7].default_value = (0.26, 0.14, 0.06, 1.0)
    links.new(tex.outputs["Color"], scuff.inputs[6])
    links.new(edge_amt.outputs["Value"], scuff.inputs[0])
    links.new(scuff.outputs[2], bsdf.inputs["Base Color"])

    nmap = nodes.new("ShaderNodeNormalMap")
    nmap.location = (-140, -280)
    nmap.inputs["Strength"].default_value = 0.85
    links.new(nimg.outputs["Color"], nmap.inputs["Color"])
    links.new(nmap.outputs["Normal"], bsdf.inputs["Normal"])
    links.new(rimg.outputs["Color"], bsdf.inputs["Roughness"])
    # Wear map stays on the material so the scratches can be tuned later.
    wimg.location = (-760, 40)
    return mat


def metal_material(name, color, roughness):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    bsdf.inputs["Metallic"].default_value = 1.0
    bsdf.inputs["Roughness"].default_value = roughness
    return mat


def make_cylinder(name, radius, depth, location, material):
    bm = bmesh.new()
    bmesh.ops.create_cone(
        bm,
        cap_ends=True,
        segments=28,
        radius1=radius,
        radius2=radius,
        depth=depth,
        matrix=Matrix.Translation(location),
        calc_uvs=True,
    )
    obj = new_mesh(name, bm)
    obj.data.materials.append(material)
    for poly in obj.data.polygons:
        poly.use_smooth = True
    return obj


def make_screw(name, location, material):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(
        bm,
        u_segments=16,
        v_segments=10,
        radius=0.0042,
        matrix=Matrix.Translation(location),
        calc_uvs=True,
    )
    obj = new_mesh(name, bm)
    obj.data.materials.append(material)
    for poly in obj.data.polygons:
        poly.use_smooth = True
    return obj


def attach(obj, pivot):
    obj.parent = pivot
    obj.matrix_parent_inverse = pivot.matrix_world.inverted()


def join_objects(objs, name):
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objs:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    objs[0].name = name
    return objs[0]


def build_door(wood, brass, brass_dark, steel):
    pivot = bpy.data.objects.new("HingePivot", None)
    bpy.context.scene.collection.objects.link(pivot)
    hinge_px = (HINGES[0][0] + HINGES[0][1]) * 0.5
    radius = X(HINGES[0][1] - HINGES[0][0]) * 0.5
    pivot.location = (X(hinge_px), Y_FRONT - radius * 0.72, DOOR_H * 0.45)

    parts = []
    stile_h = make_board(
        "Stile_Hinge", X(LEFT_PX), X(STILE_L), 0.0, Z(STILE_TOP_PY),
        Y_FRONT, Y_BACK, LEFT_PX, STILE_L, STILE_TOP_PY, EDGE_PY,
    )
    stile_l = make_curved(
        "Stile_Lock", STILE_R, RIGHT_PX, 0.0, Y_FRONT, Y_BACK, cap_left=False,
    )
    rail_t = make_curved(
        "Rail_Top", STILE_L, STILE_R, Z(RAIL_UNDER_PY), Y_FRONT, Y_BACK,
        cap_left=False, cap_right=False,
    )
    rail_m = make_board(
        "Rail_Mid", X(STILE_L), X(STILE_R), Z(PANEL_TOP_PY), Z(SLAT_BOT_PY),
        Y_FRONT, Y_BACK, STILE_L, STILE_R, SLAT_BOT_PY, PANEL_TOP_PY,
        end_caps=False,
    )
    rail_b = make_board(
        "Rail_Bottom", X(STILE_L), X(STILE_R), 0.0, Z(PANEL_BOT_PY),
        Y_FRONT, Y_BACK, STILE_L, STILE_R, PANEL_BOT_PY, EDGE_PY,
        end_caps=False,
    )
    # Borders beside the recessed panel. Without these the lower opening
    # is a hole between the stile and the panel.
    lip_l = make_board(
        "Lip_Left", X(STILE_L), X(PANEL_L), Z(PANEL_BOT_PY), Z(PANEL_TOP_PY),
        Y_FRONT, Y_BACK, STILE_L, PANEL_L, PANEL_TOP_PY, PANEL_BOT_PY,
        end_caps=False,
    )
    lip_r = make_board(
        "Lip_Right", X(PANEL_R), X(STILE_R), Z(PANEL_BOT_PY), Z(PANEL_TOP_PY),
        Y_FRONT, Y_BACK, PANEL_R, STILE_R, PANEL_TOP_PY, PANEL_BOT_PY,
        end_caps=False,
    )
    frame_objs = [stile_h, stile_l, rail_t, rail_m, rail_b, lip_l, lip_r]
    for obj in frame_objs:
        obj.data.materials.append(wood)
    frame = join_objects(frame_objs, "Frame")
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.mesh.remove_doubles(threshold=0.00015)
    bpy.ops.object.mode_set(mode="OBJECT")
    add_bevel(frame, 0.0011)
    parts.append(frame)

    panel = make_board(
        "Panel", X(PANEL_L), X(PANEL_R), Z(PANEL_BOT_PY), Z(PANEL_TOP_PY),
        Y_FRONT + 0.009, Y_BACK - 0.007,
        PANEL_L, PANEL_R, PANEL_TOP_PY, PANEL_BOT_PY,
    )
    panel.data.materials.append(wood)
    add_bevel(panel, 0.0008)
    parts.append(panel)

    edges = [RAIL_UNDER_PY] + GAP_PY + [SLAT_BOT_PY]
    slat_y0 = Y_FRONT + 0.005
    slat_y1 = Y_BACK - 0.005
    for i in range(len(edges) - 1):
        top_py = edges[i]
        bot_py = edges[i + 1]
        z1 = Z(top_py) - GAP_M * 0.5
        z0 = Z(bot_py) + GAP_M * 0.5
        if i == 0:
            z1 = Z(top_py)
        if i == len(edges) - 2:
            z0 = Z(bot_py)
        skew = 0.0 if i in (0, len(edges) - 2) else SKEW[i % len(SKEW)]
        slat = make_board(
            f"Slat_{i + 1:02d}", X(STILE_L - 6), X(STILE_R + 6), z0, z1,
            slat_y0, slat_y1, STILE_L, STILE_R, top_py, bot_py, skew,
        )
        slat.data.materials.append(wood)
        add_bevel(slat, 0.00045)
        parts.append(slat)

    for index, (x0, x1, y0, y1) in enumerate(HINGES):
        center = ((x0 + x1) * 0.5, (y0 + y1) * 0.5)
        height = abs(Z(y0) - Z(y1))
        loc = (X(center[0]), Y_FRONT - radius * 0.72, Z(center[1]))
        barrel = make_cylinder(f"Hinge_{index + 1:02d}", radius, height * 0.92, loc, brass)
        band = make_cylinder(
            f"Hinge_{index + 1:02d}_Band", radius * 1.07, height * 0.07, loc, brass_dark,
        )
        lip_z = height * 0.46
        lip_a = make_cylinder(
            f"Hinge_{index + 1:02d}_LipA", radius * 1.08, 0.006,
            (loc[0], loc[1], loc[2] + lip_z), brass,
        )
        lip_b = make_cylinder(
            f"Hinge_{index + 1:02d}_LipB", radius * 1.08, 0.006,
            (loc[0], loc[1], loc[2] - lip_z), brass,
        )
        screw = make_screw(
            f"Screw_{index + 1:02d}",
            (X(x1 + 10), Y_FRONT - 0.0025, Z(y0 + 28)),
            steel,
        )
        parts.extend([barrel, band, lip_a, lip_b, screw])

    bpy.context.view_layer.update()
    for obj in parts:
        attach(obj, pivot)
    return pivot


def look_at(obj, target):
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def setup_scene(scene, pivot):
    world = bpy.data.worlds.new("PreviewWorld")
    scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs[0].default_value = (0.012, 0.011, 0.010, 1.0)
    bg.inputs[1].default_value = 0.08

    def area(name, location, energy, color, size):
        light_data = bpy.data.lights.new(name, "AREA")
        light_data.energy = energy
        light_data.color = color
        light_data.shape = "RECTANGLE"
        light_data.size = size
        light_data.size_y = size * 1.4
        obj = bpy.data.objects.new(name, light_data)
        scene.collection.objects.link(obj)
        obj.location = location
        return obj

    key = area("Key", (0.15, -1.7, 1.55), 24, (1.0, 0.93, 0.84), 2.2)
    look_at(key, (0.4, 0.0, 1.1))
    fill = area("Fill", (1.15, -1.45, 0.7), 6, (0.80, 0.86, 0.94), 2.0)
    look_at(fill, (0.4, 0.0, 1.0))
    rim = area("Rim", (-0.35, 1.2, 1.7), 14, (1.0, 0.94, 0.86), 0.7)
    look_at(rim, (0.4, 0.0, 1.2))

    cam_data = bpy.data.cameras.new("PreviewCam")
    cam_data.type = "ORTHO"
    cam_data.ortho_scale = 2.45
    cam_data.clip_start = 0.01
    cam_data.clip_end = 50
    cam = bpy.data.objects.new("PreviewCam", cam_data)
    scene.collection.objects.link(cam)
    scene.camera = cam

    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 48
    scene.cycles.use_denoising = True
    scene.cycles.denoiser = "OPENIMAGEDENOISE"
    scene.render.resolution_x = 900
    scene.render.resolution_y = 1300
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = False
    scene.render.image_settings.file_format = "PNG"
    try:
        scene.view_settings.view_transform = "AgX"
        scene.view_settings.exposure = 0.0
    except TypeError:
        pass
    return cam


def render_view(scene, cam, path, location, ortho, resolution):
    cam.location = location
    look_at(cam, (0.42, 0.0, 1.05))
    cam.data.type = "ORTHO"
    cam.data.ortho_scale = ortho
    scene.render.resolution_x, scene.render.resolution_y = resolution
    scene.render.filepath = path
    bpy.ops.render.render(write_still=True)
    print("RENDERED", path)


def export_glb(pivot):
    bpy.ops.object.select_all(action="DESELECT")
    pivot.select_set(True)
    for child in pivot.children_recursive:
        child.select_set(True)
    bpy.context.view_layer.objects.active = pivot
    bpy.ops.export_scene.gltf(
        filepath=GLB_PATH,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_texcoords=True,
        export_normals=True,
        export_materials="EXPORT",
        export_cameras=False,
        export_lights=False,
    )
    print("EXPORTED", GLB_PATH)


def main():
    if not os.path.isfile(SRC_PHOTO):
        raise SystemExit(f"Missing reference photo: {SRC_PHOTO}")
    scene = reset_scene()
    print("PHOTO", SRC_PHOTO)
    w, h, raw = load_photo()
    print("TEXTURE", w, h)
    albedo_px, normal_px, rough_px, wear_px = build_textures(w, h, raw)
    albedo = save_texture(
        "wood_albedo", w, h, albedo_px,
        os.path.join(TEX_DIR, "wood_albedo.png"), "Linear Rec.709",
    )
    normal = save_texture(
        "wood_normal", w, h, normal_px,
        os.path.join(TEX_DIR, "wood_normal.png"), "Non-Color",
    )
    rough = save_texture(
        "wood_roughness", w, h, rough_px,
        os.path.join(TEX_DIR, "wood_roughness.png"), "Non-Color",
    )
    wear = save_texture(
        "wood_wear", w, h, wear_px,
        os.path.join(TEX_DIR, "wood_wear.png"), "Non-Color",
    )
    wood = wood_material(albedo, normal, rough, wear)
    brass = metal_material("Brass_Hinge", (0.57, 0.30, 0.14), 0.34)
    brass_dark = metal_material("Brass_Dark", (0.22, 0.10, 0.05), 0.48)
    steel = metal_material("Steel_Screw", (0.50, 0.46, 0.40), 0.42)
    pivot = build_door(wood, brass, brass_dark, steel)
    cam = setup_scene(scene, pivot)
    bpy.context.view_layer.update()
    bpy.ops.wm.save_as_mainfile(filepath=BLEND_PATH)
    print("SAVED", BLEND_PATH)

    if os.environ.get("DOOR_SKIP_PREVIEW") == "1":
        export_glb(pivot)
        bpy.ops.wm.save_as_mainfile(filepath=BLEND_PATH)
        print("DONE")
        print(REPORT)
        return

    render_view(
        scene, cam, os.path.join(ROOT, "preview.png"),
        (0.42, -4.2, 1.08), 2.42, (900, 1300),
    )
    render_view(
        scene, cam, os.path.join(ROOT, "preview_side.png"),
        (1.55, -2.15, 1.15), 2.7, (1100, 1000),
    )
    render_view(
        scene, cam, os.path.join(ROOT, "preview_back.png"),
        (0.42, 4.2, 1.08), 2.42, (900, 1300),
    )
    pivot.rotation_euler = (0.0, 0.0, math.radians(34))
    bpy.context.view_layer.update()
    render_view(
        scene, cam, os.path.join(ROOT, "preview_open.png"),
        (0.15, -3.6, 1.25), 2.7, (1100, 1100),
    )
    pivot.rotation_euler = (0.0, 0.0, 0.0)
    bpy.context.view_layer.update()
    export_glb(pivot)
    bpy.ops.wm.save_as_mainfile(filepath=BLEND_PATH)
    print("DONE")
    print(REPORT)


REPORT = """
Assumptions (not visible as a second photograph):
- Leaf height is 2.20 m. Width and every joint follow the photo proportions.
- Frame thickness is 42 mm. Louvers are 32 mm and set 5 mm behind the face.
- The lower panel is set back 9 mm, matching the recessed rectangle.
- Bottom edge is leveled on the last solid wood row. The gray-black fringe under the photo is the cutout, not the leaf.
- Hinge axis is the center of the barrel, on the front face, not the outer stile edge.
- The dark mark on the lock stile is a knot in the wood, so no pull was added.
- Back stays structural: same frame, louvers and a recessed panel. No new ornament.
- Face color is the photograph with only the broad lighting eased off.
"""


if __name__ == "__main__":
    main()
