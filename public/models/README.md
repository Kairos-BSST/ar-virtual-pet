# 3D models

Place runtime assets here:

- `dog.glb` — Beagle companion (currently installed)
- `bone.glb`, `chicken.glb`, `biscuit.glb` — optional treats

The app loads `/models/dog.glb` first. If clips exist they are mapped to idle/walk/run/etc.
This Beagle mesh has no clips, so lightweight transform animations are applied in code.
