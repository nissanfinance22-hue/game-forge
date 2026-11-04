import { getTile, key } from "./GridSystem";
import type { Character, MapData, Tile } from "./types";

const DIRS: [number, number][] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

function canStep(map: MapData, from: Tile, to: Tile | undefined, occupied: Set<string>) {
  if (!to || !to.walkable || to.terrain === "obstacle" || to.terrain === "water") return false;
  if (occupied.has(key(to.x, to.y))) return false;
  return Math.abs(to.height - from.height) <= map.config.maxClimb;
}

/** BFS: returns reachable tiles with parent links for path reconstruction. */
export function reachable(map: MapData, unit: Character, units: Character[]) {
  const occupied = new Set(
    units.filter((u) => u.hp > 0 && u.id !== unit.id).map((u) => key(u.x, u.y)),
  );
  const start = getTile(map, unit.x, unit.y)!;
  const dist = new Map<string, number>([[key(start.x, start.y), 0]]);
  const parent = new Map<string, string>();
  const queue: Tile[] = [start];
  while (queue.length) {
    const cur = queue.shift()!;
    const d = dist.get(key(cur.x, cur.y))!;
    if (d >= unit.movement) continue;
    for (const [dx, dy] of DIRS) {
      const nt = getTile(map, cur.x + dx, cur.y + dy);
      if (!nt || dist.has(key(nt.x, nt.y)) || !canStep(map, cur, nt, occupied)) continue;
      dist.set(key(nt.x, nt.y), d + 1);
      parent.set(key(nt.x, nt.y), key(cur.x, cur.y));
      queue.push(nt);
    }
  }
  return { dist, parent };
}

export function buildPath(parent: Map<string, string>, from: string, to: string) {
  const path: { x: number; y: number }[] = [];
  let cur: string | undefined = to;
  while (cur && cur !== from) {
    const [x = 0, y = 0] = cur.split(",").map(Number);
    path.unshift({ x, y });
    cur = parent.get(cur);
  }
  return cur === from ? path : [];
}

/** Full-map BFS distance ignoring movement limit (for AI approach). */
export function distanceField(map: MapData, target: { x: number; y: number }, units: Character[], selfId: string) {
  const occupied = new Set(
    units.filter((u) => u.hp > 0 && u.id !== selfId).map((u) => key(u.x, u.y)),
  );
  occupied.delete(key(target.x, target.y));
  const start = getTile(map, target.x, target.y)!;
  const dist = new Map<string, number>([[key(start.x, start.y), 0]]);
  const q: Tile[] = [start];
  while (q.length) {
    const cur = q.shift()!;
    for (const [dx, dy] of DIRS) {
      const nt = getTile(map, cur.x + dx, cur.y + dy);
      if (!nt || dist.has(key(nt.x, nt.y)) || !canStep(map, cur, nt, occupied)) continue;
      dist.set(key(nt.x, nt.y), dist.get(key(cur.x, cur.y))! + 1);
      q.push(nt);
    }
  }
  return dist;
}

export function dirTowards(from: { x: number; y: number }, to: { x: number; y: number }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? "SE" : "NW";
  return dy >= 0 ? "SW" : "NE";
}
