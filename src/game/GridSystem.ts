import type { GridConfig, MapData, Tile } from "./types";

export const key = (x: number, y: number) => `${x},${y}`;

export function getTile(map: MapData, x: number, y: number): Tile | undefined {
  const { cols, rows } = map.config;
  if (x < 0 || y < 0 || x >= cols || y >= rows) return undefined;
  return map.tiles[y * cols + x];
}

/** Screen position of the CENTER of a tile's top face (where feet go). */
export function tileCenter(cfg: GridConfig, t: Pick<Tile, "x" | "y" | "height" | "dx" | "dy">) {
  return {
    sx: cfg.originX + ((t.x - t.y) * cfg.tileW) / 2 + (t.dx ?? 0),
    sy:
      cfg.originY +
      ((t.x + t.y + 1) * cfg.tileH) / 2 -
      t.height * cfg.heightStep +
      (t.dy ?? 0),
  };
}

export function diamondPoints(cfg: GridConfig, t: Tile) {
  const { sx, sy } = tileCenter(cfg, t);
  const w = cfg.tileW / 2;
  const h = cfg.tileH / 2;
  return `${sx},${sy - h} ${sx + w},${sy} ${sx},${sy + h} ${sx - w},${sy}`;
}

export const manhattan = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
