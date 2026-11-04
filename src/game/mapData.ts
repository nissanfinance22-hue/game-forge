import type { MapData, Terrain, Tile } from "./types";

/**
 * Default map data for the uploaded battlefield image.
 * These are first-pass values — use the in-game Calibration mode to fix
 * heights / walkability, then "Exportar JSON" and paste it here.
 */
const COLS = 12;
const ROWS = 12;

const WATER = new Set([
  "7,2", "7,3", "8,3", "8,4", "7,4", "7,5", "8,5", "6,5", "6,6", "7,6", "7,7",
  "8,9", "9,9", "8,10", "9,10", "8,11", "9,11",
]);
const OBSTACLES = new Set(["0,0", "1,0", "7,0", "10,3", "11,3", "6,1"]);
const DIRT = new Set([
  "0,2", "0,3", "0,4", "0,5", "0,6", "1,6", "1,7", "1,8", "1,9", "2,8", "3,8", "3,9",
  "4,8", "4,9", "5,9", "6,9", "10,5", "10,6", "11,5", "10,7", "10,8", "10,9", "11,9",
]);

function heightFor(x: number, y: number): number {
  if (y <= 1 && x <= 4) return 3;
  if (x >= 4 && x <= 7 && y <= 1) return 3;
  if (x >= 8 && y <= 3) return 2;
  if (WATER.has(`${x},${y}`)) return 0;
  return 1;
}

function buildTiles(): Tile[] {
  const tiles: Tile[] = [];
  for (let y = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++) {
      const k = `${x},${y}`;
      const terrain: Terrain = WATER.has(k)
        ? "water"
        : OBSTACLES.has(k)
          ? "obstacle"
          : DIRT.has(k)
            ? "dirt"
            : "grass";
      tiles.push({
        x,
        y,
        height: heightFor(x, y),
        walkable: terrain === "grass" || terrain === "dirt",
        terrain,
        occupiedBy: null,
      });
    }
  return tiles;
}

export const DEFAULT_MAP: MapData = {
  config: {
    cols: COLS,
    rows: ROWS,
    tileW: 112,
    tileH: 56,
    heightStep: 44,
    originX: 722,
    originY: 342,
    maxClimb: 1,
  },
  tiles: buildTiles(),
};

export const MAP_IMAGE_SIZE = { w: 1448, h: 1086 };
export const STORAGE_KEY = "tlomh-map-v1";
