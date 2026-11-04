import mageSheet from "@/assets/mage_sheet.png.asset.json";
import type { Character, Direction } from "./types";

/**
 * Sprite registry. To swap in final sprites, add a sheet here and set
 * `spriteId` on the character. Each direction maps to a frame index + mirror.
 * Animations (walk/attack/hurt/dead) are layered with CSS until per-anim
 * frames are provided: add `anims` frames per direction when available.
 */
export type SpriteDef = {
  url: string;
  frameW: number;
  frameH: number;
  /** Display scale relative to frame size */
  scale: number;
  dirs: Record<Direction, { frame: number; flip: boolean }>;
  filter?: string;
};

const mageDirs: SpriteDef["dirs"] = {
  SW: { frame: 1, flip: false },
  SE: { frame: 1, flip: true },
  NE: { frame: 5, flip: false },
  NW: { frame: 5, flip: true },
};

export const SPRITES: Record<string, SpriteDef> = {
  mage: { url: mageSheet.url, frameW: 200, frameH: 300, scale: 0.36, dirs: mageDirs },
  // Provisional enemies: recolored mage until final enemy sprites arrive
  shade: {
    url: mageSheet.url,
    frameW: 200,
    frameH: 300,
    scale: 0.34,
    dirs: mageDirs,
    filter: "hue-rotate(150deg) saturate(1.4) brightness(0.8)",
  },
};

export function createInitialUnits(): Character[] {
  const base = { hasMoved: false, hasActed: false, anim: "idle" as const, z: 0 };
  return [
    { ...base, id: "hero", name: "Merlin", team: "player", hp: 30, maxHp: 30, attack: 11, defense: 3, movement: 4, attackRange: 2, x: 2, y: 9, spriteId: "mage", dir: "NE" },
    { ...base, id: "e1", name: "Sombra", team: "enemy", hp: 18, maxHp: 18, attack: 8, defense: 2, movement: 3, attackRange: 1, x: 8, y: 2, spriteId: "shade", dir: "SW" },
    { ...base, id: "e2", name: "Espectro", team: "enemy", hp: 18, maxHp: 18, attack: 7, defense: 3, movement: 3, attackRange: 1, x: 9, y: 7, spriteId: "shade", dir: "SW" },
  ];
}
