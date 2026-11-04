import mapImg from "@/assets/battle_map.png.asset.json";
import { SPRITES } from "./CharacterSystem";
import { diamondPoints, getTile, key, tileCenter } from "./GridSystem";
import { MAP_IMAGE_SIZE } from "./mapData";
import { STEP_MS, type Popup } from "./TurnSystem";
import type { Character, MapData } from "./types";

type Props = {
  map: MapData;
  units: Character[];
  scale: number;
  moveTiles: string[];
  attackTiles: string[];
  targetIds: string[];
  selectedId: string | null;
  activeId?: string | undefined;
  popups: Popup[];
  onPopupDone: (id: number) => void;
  onTileClick: (x: number, y: number) => void;
  onUnitClick: (id: string) => void;
  calibrating: boolean;
  calibSelected: string | null;
};

export function MapRenderer(p: Props) {
  const { map } = p;
  const cfg = map.config;
  const move = new Set(p.moveTiles);
  const atk = new Set(p.attackTiles);
  const targetTiles = new Set(p.units.filter((u) => p.targetIds.includes(u.id)).map((u) => key(u.x, u.y)));
  const selected = p.units.find((u) => u.id === p.selectedId);

  return (
    <div
      className="relative origin-top-left"
      style={{ width: MAP_IMAGE_SIZE.w, height: MAP_IMAGE_SIZE.h, transform: `scale(${p.scale})` }}
    >
      <img src={mapImg.url} alt="Campo de batalha" className="pixelated absolute inset-0 select-none" draggable={false} width={MAP_IMAGE_SIZE.w} height={MAP_IMAGE_SIZE.h} />
      <svg className="absolute inset-0" width={MAP_IMAGE_SIZE.w} height={MAP_IMAGE_SIZE.h} style={{ zIndex: 1 }}>
        {map.tiles.map((t) => {
          const k = key(t.x, t.y);
          let fill = "transparent";
          let stroke = "transparent";
          let cls = "";
          if (p.calibrating) {
            fill = t.walkable ? "var(--move)" : "var(--danger)";
            stroke = k === p.calibSelected ? "var(--select)" : "var(--foreground)";
          } else if (targetTiles.has(k)) {
            fill = "var(--danger)"; stroke = "var(--danger)"; cls = "tile-pulse";
          } else if (move.has(k)) {
            fill = "var(--move)"; stroke = "var(--move)"; cls = "tile-pulse";
          } else if (atk.has(k)) {
            fill = "var(--danger)"; stroke = "var(--danger)"; cls = "opacity-30";
          }
          if (!p.calibrating && selected && selected.x === t.x && selected.y === t.y) {
            fill = "var(--select)"; stroke = "var(--select)"; cls = "tile-pulse";
          }
          const c = tileCenter(cfg, t);
          return (
            <g key={k} onClick={() => p.onTileClick(t.x, t.y)} className="cursor-pointer">
              <polygon
                points={diamondPoints(cfg, t)}
                fill={fill}
                fillOpacity={p.calibrating ? 0.25 : 0.5}
                stroke={stroke}
                strokeWidth={p.calibrating ? 1 : 2}
                className={cls}
                pointerEvents="all"
              />
              {p.calibrating && (
                <text x={c.sx} y={c.sy + 5} textAnchor="middle" fontSize={13} fill="var(--foreground)" pointerEvents="none">
                  {t.terrain.charAt(0).toUpperCase()}
                  {t.height}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {p.units.map((u) => {
        const t = getTile(map, u.x, u.y)!;
        const { sx, sy } = tileCenter(cfg, { ...t, height: u.z });
        const s = SPRITES[u.spriteId] ?? SPRITES.mage!;
        const w = s.frameW * s.scale;
        const h = s.frameH * s.scale;
        const d = s.dirs[u.dir];
        return (
          <div
            key={u.id}
            className="absolute"
            style={{
              left: sx - w / 2,
              top: sy - h + 4,
              width: w,
              height: h,
              zIndex: 10 + (u.x + u.y) * 10,
              transition: `left ${STEP_MS}ms linear, top ${STEP_MS}ms linear`,
              pointerEvents: u.hp > 0 || u.anim === "dead" ? "auto" : "none",
            }}
            onClick={() => p.onUnitClick(u.id)}
          >
            <div
              className={`pixelated h-full w-full cursor-pointer anim-${u.hp <= 0 && u.anim !== "hurt" ? "dead" : u.anim}`}
              style={{
                backgroundImage: `url(${s.url})`,
                backgroundSize: `${8 * w}px ${h}px`,
                backgroundPosition: `${-d.frame * w}px 0`,
                filter: s.filter,
                scale: d.flip ? "-1 1" : undefined,
                outline: u.id === p.activeId && u.hp > 0 ? undefined : undefined,
              }}
            />
            {u.hp > 0 && (
              <div className="absolute left-1/2 -top-2 h-1.5 w-10 -translate-x-1/2 border border-background bg-background/70">
                <div className={u.team === "player" ? "h-full bg-hp" : "h-full bg-danger"} style={{ width: `${(u.hp / u.maxHp) * 100}%` }} />
              </div>
            )}
            {p.popups.filter((pp) => pp.unitId === u.id).map((pp) => (
              <span
                key={pp.id}
                className="dmg-float absolute left-1/2 top-2 font-pixel text-lg text-primary"
                style={{ textShadow: "2px 2px 0 var(--background)" }}
                onAnimationEnd={() => p.onPopupDone(pp.id)}
              >
                {pp.text}
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
}
