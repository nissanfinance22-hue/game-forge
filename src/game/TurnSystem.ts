import { useCallback, useEffect, useRef, useState } from "react";
import { canAttack, computeDamage } from "./CombatSystem";
import { createInitialUnits } from "./CharacterSystem";
import { getTile, key } from "./GridSystem";
import { buildPath, dirTowards, reachable } from "./MovementSystem";
import { planEnemyTurn } from "./EnemyAI";
import type { AnimState, Character, MapData } from "./types";

export type Mode = "idle" | "move" | "attack";
export type Popup = { id: number; unitId: string; text: string };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
export const STEP_MS = 200;

function placeOnMap(map: MapData, units: Character[]) {
  return units.map((u) => ({ ...u, z: getTile(map, u.x, u.y)?.height ?? 0 }));
}

export function useBattle(map: MapData) {
  const [units, setUnits] = useState<Character[]>(() => placeOnMap(map, createInitialUnits()));
  const unitsRef = useRef(units);
  unitsRef.current = units;
  const [activeIdx, setActiveIdx] = useState(0);
  const [turn, setTurn] = useState(1);
  const [mode, setMode] = useState<Mode>("idle");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [log, setLog] = useState<string>("Seu turno! Clique no herói.");
  const runId = useRef(0);

  const active = units[activeIdx];
  const result: "victory" | "defeat" | null = !units.find((u) => u.id === "hero" && u.hp > 0)
    ? "defeat"
    : units.every((u) => u.team === "player" || u.hp <= 0)
      ? "victory"
      : null;

  const patch = (id: string, p: Partial<Character>) =>
    setUnits((us) => {
      const next = us.map((u) => (u.id === id ? { ...u, ...p } : u));
      unitsRef.current = next;
      return next;
    });
  const setAnim = (id: string, anim: AnimState) => patch(id, { anim });

  const walk = useCallback(
    async (id: string, path: { x: number; y: number }[]) => {
      if (!path.length) return;
      setAnim(id, "walk");
      for (const step of path) {
        const u = unitsRef.current.find((v) => v.id === id)!;
        const t = getTile(map, step.x, step.y)!;
        patch(id, { x: step.x, y: step.y, z: t.height, dir: dirTowards(u, step) });
        await sleep(STEP_MS);
      }
      patch(id, { anim: "idle", hasMoved: true });
    },
    [map],
  );

  const attack = useCallback(async (attackerId: string, targetId: string) => {
    const a = unitsRef.current.find((u) => u.id === attackerId)!;
    const t = unitsRef.current.find((u) => u.id === targetId)!;
    patch(attackerId, { dir: dirTowards(a, t), anim: "attack" });
    await sleep(350);
    const dmg = computeDamage(a, t);
    const hp = Math.max(0, t.hp - dmg);
    patch(attackerId, { anim: "idle", hasActed: true });
    patch(targetId, { hp, anim: "hurt" });
    setPopups((p) => [...p, { id: Date.now() + Math.random(), unitId: targetId, text: `-${dmg}` }]);
    setLog(`${a.name} causou ${dmg} de dano em ${t.name}.`);
    await sleep(380);
    patch(targetId, { anim: hp <= 0 ? "dead" : "idle" });
    if (hp <= 0) {
      setLog(`${t.name} foi derrotado!`);
      await sleep(500);
    }
  }, []);

  const nextTurn = useCallback(() => {
    setMode("idle");
    setSelectedId(null);
    const us = unitsRef.current;
    let i = activeIdx;
    let wrapped = false;
    for (let n = 0; n < us.length; n++) {
      i = (i + 1) % us.length;
      if (i === 0) wrapped = true;
      if (us[i].hp > 0) break;
    }
    if (wrapped) setTurn((t) => t + 1);
    patch(us[i].id, { hasMoved: false, hasActed: false });
    setActiveIdx(i);
  }, [activeIdx]);

  // Enemy turn
  useEffect(() => {
    const u = unitsRef.current[activeIdx];
    if (!u || u.team !== "enemy" || u.hp <= 0 || result) return;
    const my = ++runId.current;
    (async () => {
      setBusy(true);
      setLog(`Turno de ${u.name}...`);
      setSelectedId(u.id);
      await sleep(600);
      const plan = planEnemyTurn(map, unitsRef.current.find((v) => v.id === u.id)!, unitsRef.current);
      await walk(u.id, plan.path);
      if (my !== runId.current) return;
      await sleep(250);
      if (plan.targetId) await attack(u.id, plan.targetId);
      await sleep(400);
      if (my !== runId.current) return;
      setBusy(false);
      nextTurn();
    })();
  }, [activeIdx, turn]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (active?.team === "player" && !busy) setLog(`Turno de ${active.name}.`);
  }, [activeIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const isPlayerTurn = active?.team === "player" && !busy && !result;

  const moveInfo =
    isPlayerTurn && mode === "move" && !active.hasMoved ? reachable(map, active, units) : null;
  const moveTiles = moveInfo ? [...moveInfo.dist.keys()].filter((k) => k !== key(active.x, active.y)) : [];
  const attackTargets =
    isPlayerTurn && mode === "attack" && !active.hasActed
      ? units.filter((t) => t.team !== active.team && canAttack(active, t))
      : [];
  const attackTiles: string[] = [];
  if (isPlayerTurn && mode === "attack" && !active.hasActed) {
    for (const t of map.tiles) {
      const d = Math.abs(t.x - active.x) + Math.abs(t.y - active.y);
      if (d >= 1 && d <= active.attackRange && t.walkable) attackTiles.push(key(t.x, t.y));
    }
  }

  const onTileClick = async (x: number, y: number) => {
    if (!isPlayerTurn) return;
    const k = key(x, y);
    if (mode === "move" && moveInfo?.dist.has(k) && k !== key(active.x, active.y)) {
      setBusy(true);
      setMode("idle");
      await walk(active.id, buildPath(moveInfo.parent, key(active.x, active.y), k));
      setBusy(false);
      const after = unitsRef.current.find((u) => u.id === active.id)!;
      if (!after.hasActed) setMode("attack");
      return;
    }
    const u = units.find((v) => v.x === x && v.y === y && v.hp > 0);
    if (u) onUnitClick(u.id);
  };

  const onUnitClick = async (id: string) => {
    const u = units.find((v) => v.id === id);
    if (!u) return;
    if (isPlayerTurn && mode === "attack" && attackTargets.some((t) => t.id === id)) {
      setBusy(true);
      setMode("idle");
      await attack(active.id, id);
      setBusy(false);
      const after = unitsRef.current.find((v) => v.id === active.id)!;
      if (!after.hasMoved) setMode("move");
      return;
    }
    setSelectedId(id);
    if (isPlayerTurn && id === active.id) setMode(active.hasMoved ? (active.hasActed ? "idle" : "attack") : "move");
  };

  const restart = () => {
    runId.current++;
    setUnits(placeOnMap(map, createInitialUnits()));
    setActiveIdx(0);
    setTurn(1);
    setMode("idle");
    setSelectedId(null);
    setBusy(false);
    setLog("Seu turno! Clique no herói.");
  };

  return {
    units, active, turn, mode, setMode, selectedId, busy, popups, setPopups, log, result,
    isPlayerTurn, moveTiles, attackTiles, attackTargets, onTileClick, onUnitClick, nextTurn, restart,
  };
}
