# Blaster

An asteroids-style 2D shooter: a player-controlled craft fires at drifting
asteroids on a canvas. This glossary names the concepts the engine simulates and
the seams it is built around.

## Entities

**Obj**:
The base entity — anything that exists in the simulation with geometry, health,
and a collision presence.
_Avoid_: GameObject, actor, sprite

**Craft**:
The player's ship. The only entity bound to the visible area; immortal.
_Avoid_: player, ship

**Roid**:
A drifting asteroid, spawned at random with a per-instance jagged shape.
_Avoid_: asteroid, rock

**Projectile**:
A shot fired by the Craft. Either destroyed on impact or ricochets.
_Avoid_: bullet, shot

**Stage**:
The container for a simulation: the canvas, the entity list, the broad-phase
grid, and the world bounds.
_Avoid_: scene, level, world (World is the simulation step, not the container)

## Space & time

**Native space**:
The fixed 1920×1080 coordinate space the simulation runs in, independent of the
device's pixel size. All simulation math is in native space.
_Avoid_: world space, game space, screen space

**Tick**:
One fixed step of the simulation (16.7 ms of game time). Distinct from a rendered
frame — multiple ticks may run per frame to catch up.
_Avoid_: frame, step, update (when precision matters)

**Cull**:
Removal of an unbound entity once its full extent has left native space.
_Avoid_: despawn, delete, off-screen removal

## Collision

**Broad phase**:
The cheap first pass that finds *candidate* pairs sharing a grid cell.
_Avoid_: broadphase, coarse pass

**Narrow phase**:
The exact geometry test that confirms whether a candidate pair actually
intersects.
_Avoid_: fine pass, precise check

**Collidable**:
The interface a Collision Resolution acts through: an entity's `center`, its
`health`, `highlight()`, and its `onHit` hook. The only surface the resolver
knows about — it never sees an entity's underlying geometry.
_Avoid_: hittable, collider

**Center**:
An entity's single collision reference point, from which the collision normal is
built. Distinct from position (an entity's origin corner).
_Avoid_: centroid (that is a model-space geometry term), midpoint, origin

**Collision Resolution**:
The act of deciding what happens to a confirmed colliding pair. It computes the
center-to-center normal once and invokes each party's `onHit` hook; it holds no
damage or ricochet policy of its own — that lives with each entity.
_Avoid_: collision handling, collision response, hit processing

**onHit**:
An entity's hook, invoked by Collision Resolution, describing what that entity
does when struck — deal its damage, ricochet, flash. The one place an entity's
collision behaviour lives.
_Avoid_: intersects, onCollide, handleHit

**Ricochet**:
A Projectile reflecting off what it strikes instead of being destroyed, using the
collision normal it is handed.
_Avoid_: bounce (used loosely in config; ricochet is the domain term), reflect
