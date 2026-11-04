import { manhattan } from "./GridSystem";
import type { Character } from "./types";

export const MAX_ATTACK_HEIGHT_DIFF = 2;

export function canAttack(a: Pick<Character, "x" | "y" | "z" | "attackRange">, t: Character) {
  if (t.hp <= 0) return false;
  const d = manhattan(a, t);
  return d >= 1 && d <= a.attackRange && Math.abs(a.z - t.z) <= MAX_ATTACK_HEIGHT_DIFF;
}

export function computeDamage(a: Character, t: Character, rand = Math.random) {
  return Math.max(1, a.attack - t.defense + Math.floor(rand() * 3));
}
