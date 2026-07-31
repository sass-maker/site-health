"""Render bounded literal lyric plates from a validated Fleet JSON manifest."""

import argparse
import json
import math
import random
import sys
from pathlib import Path

import bpy


PALETTES = {
    "midnight-gold": {
        "world": (0.015, 0.025, 0.08, 1),
        "primary": (1.0, 0.45, 0.08, 1),
        "secondary": (0.08, 0.35, 0.8, 1),
    },
    "blue-silver": {
        "world": (0.008, 0.025, 0.07, 1),
        "primary": (0.35, 0.72, 1.0, 1),
        "secondary": (0.75, 0.84, 1.0, 1),
    },
    "violet-cyan": {
        "world": (0.025, 0.01, 0.065, 1),
        "primary": (0.55, 0.18, 1.0, 1),
        "secondary": (0.05, 0.85, 0.9, 1),
    },
}


def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True)
    return parser.parse_args(argv)


def material(name, color, emission=0.0, metallic=0.0, roughness=0.45):
    item = bpy.data.materials.new(name)
    item.diffuse_color = color
    item.use_nodes = True
    principled = item.node_tree.nodes.get("Principled BSDF")
    principled.inputs["Base Color"].default_value = color
    principled.inputs["Metallic"].default_value = metallic
    principled.inputs["Roughness"].default_value = roughness
    if emission:
        principled.inputs["Emission Color"].default_value = color
        principled.inputs["Emission Strength"].default_value = emission
    return item


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for item in list(bpy.data.materials):
        bpy.data.materials.remove(item)


def add_camera(camera_mode):
    bpy.ops.object.camera_add(location=(0, -15.5, 2.4))
    camera = bpy.context.object
    camera.data.lens = 52 if camera_mode == "slow-push" else 46
    camera.rotation_euler = (math.radians(78), 0, 0)
    camera.rotation_euler[2] = 0
    bpy.context.scene.camera = camera


def add_light():
    bpy.ops.object.light_add(type="AREA", location=(0, -4, 8))
    key = bpy.context.object
    key.data.energy = 1150
    key.data.shape = "DISK"
    key.data.size = 8
    key.rotation_euler = (math.radians(10), 0, 0)
    bpy.ops.object.light_add(type="AREA", location=(5, 1, 2))
    rim = bpy.context.object
    rim.data.energy = 800
    rim.data.color = (0.2, 0.45, 1.0)
    rim.data.size = 5


def add_star(index, palette):
    angle = (index * 2.399963) % (2 * math.pi)
    radius = 2.0 + (index % 4) * 0.8
    x = math.cos(angle) * radius
    z = 2.0 + math.sin(angle * 1.7) * 3.0
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.12 + (index % 3) * 0.05, location=(x, 1.5, z))
    star = bpy.context.object
    star.data.materials.append(material(f"star-{index}", palette["primary"], emission=7.0))


def add_world(palette):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32, radius=5.8, location=(0, 4.4, -4.2))
    globe = bpy.context.object
    globe.data.materials.append(material("world", palette["secondary"], metallic=0.15, roughness=0.55))


def add_diamond(palette):
    bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=1.5, radius2=0.0, depth=2.4, location=(0, 1.4, 1.4))
    top = bpy.context.object
    top.rotation_euler[2] = math.radians(45)
    top.data.materials.append(material("diamond-top", palette["secondary"], metallic=0.75, roughness=0.12))
    bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=1.5, radius2=0.0, depth=1.35, location=(0, 1.4, -0.46), rotation=(math.pi, 0, math.radians(45)))
    bottom = bpy.context.object
    bottom.data.materials.append(material("diamond-bottom", palette["primary"], metallic=0.7, roughness=0.13))


def add_traveller(palette):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.42, location=(0, 0.8, 1.4))
    head = bpy.context.object
    head.data.materials.append(material("traveller-head", palette["primary"], roughness=0.7))
    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.52, depth=2.3, location=(0, 0.8, 0.0))
    body = bpy.context.object
    body.data.materials.append(material("traveller-body", palette["secondary"], roughness=0.65))


def add_road(palette):
    bpy.ops.mesh.primitive_plane_add(size=16, location=(0, 2.5, -1.3))
    road = bpy.context.object
    road.scale.x = 0.35
    road.data.materials.append(material("road", (0.08, 0.09, 0.12, 1), roughness=0.9))
    bpy.ops.mesh.primitive_cube_add(location=(0, 2.4, -1.15), scale=(0.035, 6, 0.015))
    line = bpy.context.object
    line.data.materials.append(material("road-line", palette["primary"], emission=1.0))


def add_heart(palette):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, location=(-0.58, 1.2, 0.8), scale=(0.8, 0.55, 1.05))
    left = bpy.context.object
    left.data.materials.append(material("heart-left", palette["primary"], roughness=0.35))
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, location=(0.58, 1.2, 0.8), scale=(0.8, 0.55, 1.05))
    right = bpy.context.object
    right.data.materials.append(material("heart-right", palette["primary"], roughness=0.35))


def build_objects(objects, palette):
    if "world" in objects:
        add_world(palette)
    if "diamond" in objects:
        add_diamond(palette)
    if "traveller" in objects:
        add_traveller(palette)
    if "road" in objects:
        add_road(palette)
    if "heart" in objects:
        add_heart(palette)
    star_count = 22 if "star" in objects else 12
    for index in range(star_count):
        add_star(index, palette)
    if not set(objects).intersection({"star", "world", "diamond", "traveller", "road", "heart"}):
        bpy.ops.mesh.primitive_torus_add(major_radius=1.7, minor_radius=0.16, location=(0, 1.6, 0.6))
        bpy.context.object.data.materials.append(material("subject", palette["secondary"], metallic=0.45, roughness=0.2))


def render_scene(scene_manifest, root, width, height, samples):
    clear_scene()
    palette = PALETTES[scene_manifest["palette"]]
    world = bpy.context.scene.world
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = palette["world"]
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.24
    random.seed(scene_manifest["seed"])
    add_camera(scene_manifest["camera"])
    add_light()
    build_objects(scene_manifest["objects"], palette)

    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = width
    scene.render.resolution_y = height
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = False
    scene.render.filepath = str((root / scene_manifest["output"]).resolve())
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.filepath = str((root / scene_manifest["output"]).resolve())
    scene.render.resolution_percentage = 100
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.image_settings.color_depth = "8"
    scene.render.film_transparent = False
    scene.render.filepath = str((root / scene_manifest["output"]).resolve())
    bpy.ops.render.render(write_still=True)


def main():
    args = parse_args()
    manifest_path = Path(args.manifest).resolve()
    root = manifest_path.parent
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest.get("schema") != "fleet.blender-literal-scenes.v1":
        raise ValueError("unsupported Blender scene manifest")
    for scene in manifest["scenes"]:
        output = (root / scene["output"]).resolve()
        if root not in output.parents:
            raise ValueError("output path escapes run directory")
        output.parent.mkdir(parents=True, exist_ok=True)
        render_scene(scene, root, manifest["width"], manifest["height"], manifest["samples"])
        print(f"FLEET_BLENDER_PROGRESS {scene['id']} {scene['output']}", flush=True)


if __name__ == "__main__":
    main()
