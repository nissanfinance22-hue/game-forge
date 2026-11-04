import { canAttack } from "./CombatSystem";
import { key } from "./GridSystem";
import { buildPath, distanceField, reachable } from "./MovementSystem";
import type { Character, MapData } from "./types";

export type AIPlan = { path: { x: number; y: number }[]; targetId: string | null };

/** Uses exactly the same movement/attack rules as the player. */
export function planEnemyTurn(map: MapData, self: Character, units: Character[]): AIPlan {
  const foes = units.filter((u) => u.team !== self.team && u.hp > 0);
  if (!foes.length) return { path: [], targetId: null };
  const { dist, parent } = reachable(map, self, units);
  const startK = key(self.x, self.y);

  // 1. Any reachable tile from which a foe can be attacked? pick weakest foe, shortest move
  let best: { k: string; foe: Character; cost: number } | null = null;
  for (const [k, cost] of dist) {
    const [x = 0, y = 0] = k.split(",").map(Number);
    const z = map.tiles[y * map.config.cols + x]?.height ?? 0;
    for (const f of foes) {
      if (!canAttack({ x, y, z, attackRange: self.attackRange }, f)) continue;
      if (!best || f.hp < best.foe.hp || (f.hp === best.foe.hp && cost < best.cost))
        best = { k, foe: f, cost };
    }
  }
  if (best) return { path: buildPath(parent, startK, best.k), targetId: best.foe.id };

  // 2. Approach nearest foe via valid path
  let bestK = startK;
  let bestD = Infinity;
  for (const f of foes) {
    const field = distanceField(map, f, units, self.id);
    for (const k of dist.keys()) {
      const d = field.get(k);
      if (d !== undefined && d < bestD) {
        bestD = d;
        bestK = k;
      }
    }
  }
  return { path: buildPath(parent, startK, bestK), targetId: null };
}
