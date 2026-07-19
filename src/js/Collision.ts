import Point2 from "./Point2";
import Vector2 from "./Vector2";

// what an onHit hook is handed about the collision it is reacting to. Only
// `other` and `normal` today; the object shape lets more be added without
// changing every hook's signature.
export interface HitContext {
  other: Collidable;
  normal: Vector2;
}

// the surface collision resolution acts through. An entity exposes where it is
// (center), how much it can take (health), how to flash it (highlight), and
// what it does when struck (onHit). The resolver never sees geometry beyond the
// center.
export interface Collidable {
  readonly center: Point2;
  health: number;
  highlight(color?: string): void;
  onHit(ctx: HitContext): void;
}

// Resolve a pair World has already confirmed collide. Compute the
// center-to-center normal once and hand it to each party (negated for the far
// side), then let each party's onHit decide what that means. No damage or
// ricochet policy lives here — only the normal and the once-per-pair
// orchestration.
export function resolveCollision(a: Collidable, b: Collidable): void {
  const normal = new Vector2(a.center.x - b.center.x, a.center.y - b.center.y);
  a.onHit({ other: b, normal });
  b.onHit({ other: a, normal: new Vector2(-normal.x, -normal.y) });
}
