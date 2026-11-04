export type Terrain = "grass" | "dirt" | "water" | "obstacle";

export type Tile = {
  x: number;
  y: number;
  height: number;
  walkable: boolean;
  terrain: Terrain;
  occupiedBy: string | null;
  /** Manual visual nudge (px) from calibration */
  dx?: number;
  dy?: number;
};

export type GridConfig = {
  cols: number;
  rows: number;
  tileW: number;
  tileH: number;
  heightStep: number;
  originX: number;
  originY: number;
  maxClimb: number;
};

export type MapData = { config: GridConfig; tiles: Tile[] };

export type Direction = "SE" | "SW" | "NE" | "NW";
export type AnimState = "idle" | "walk" | "attack" | "hurt" | "dead";

export type Character = {
  id: string;
  name: string;
  team: "player" | "enemy";
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  movement: number;
  attackRange: number;
  x: number;
  y: number;
  z: number;
  hasMoved: boolean;
  hasActed: boolean;
  spriteId: string;
  dir: Direction;
  anim: AnimState;
};
