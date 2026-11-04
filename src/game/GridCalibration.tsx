import { useState } from "react";
import type { GridConfig, MapData, Terrain } from "./types";
import { DEFAULT_MAP } from "./mapData";

const TERRAINS: Terrain[] = ["grass", "dirt", "water", "obstacle"];
type Props = {
  map: MapData;
  setMap: (m: MapData) => void;
  selected: string | null;
};

const FIELDS: { k: keyof GridConfig; label: string; min: number; max: number; step: number }[] = [
  { k: "originX", label: "Origem X", min: 0, max: 1448, step: 1 },
  { k: "originY", label: "Origem Y", min: 0, max: 1086, step: 1 },
  { k: "tileW", label: "Largura", min: 20, max: 240, step: 1 },
  { k: "tileH", label: "Altura", min: 10, max: 140, step: 1 },
  { k: "heightStep", label: "Passo Z (px)", min: 0, max: 120, step: 1 },
  { k: "maxClimb", label: "Subida máx", min: 0, max: 4, step: 1 },
];

export function GridCalibration({ map, setMap, selected }: Props) {
  const [copied, setCopied] = useState(false);
  const cfg = map.config;
  const tile = selected ? map.tiles.find((t) => `${t.x},${t.y}` === selected) : undefined;

  const setCfg = (k: keyof GridConfig, v: number) => setMap({ ...map, config: { ...cfg, [k]: v } });
  const editTile = (p: Partial<(typeof map.tiles)[number]>) =>
    tile && setMap({ ...map, tiles: map.tiles.map((t) => (t === tile ? { ...t, ...p } : t)) });

  const btn = "game-panel px-2 py-0.5 text-base hover:bg-secondary";
  return (
    <div className="game-panel w-64 space-y-2 p-3 text-base">
      <h3 className="font-pixel text-[10px] text-primary">CALIBRAÇÃO</h3>
      {FIELDS.map((f) => (
        <label key={f.k} className="block">
          <span className="flex justify-between"><span>{f.label}</span><span className="text-primary">{cfg[f.k]}</span></span>
          <input type="range" min={f.min} max={f.max} step={f.step} value={cfg[f.k]} onChange={(e) => setCfg(f.k, Number(e.target.value))} className="w-full accent-primary" />
        </label>
      ))}
      <div className="border-t border-border pt-2">
        {tile ? (
          <div className="space-y-1">
            <div>Célula <span className="text-primary">{tile.x},{tile.y}</span></div>
            <div className="flex items-center gap-1">Z {tile.height}
              <button className={btn} onClick={() => editTile({ height: tile.height - 1 })}>-</button>
              <button className={btn} onClick={() => editTile({ height: tile.height + 1 })}>+</button>
            </div>
            <div className="flex flex-wrap gap-1">
              {TERRAINS.map((t) => (
                <button key={t} className={`${btn} ${tile.terrain === t ? "text-primary" : ""}`}
                  onClick={() => editTile({ terrain: t, walkable: t === "grass" || t === "dirt" })}>{t}</button>
              ))}
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={tile.walkable} onChange={(e) => editTile({ walkable: e.target.checked })} /> transitável
            </label>
            <div className="flex items-center gap-1">Ajuste
              <button className={btn} onClick={() => editTile({ dx: (tile.dx ?? 0) - 2 })}>←</button>
              <button className={btn} onClick={() => editTile({ dx: (tile.dx ?? 0) + 2 })}>→</button>
              <button className={btn} onClick={() => editTile({ dy: (tile.dy ?? 0) - 2 })}>↑</button>
              <button className={btn} onClick={() => editTile({ dy: (tile.dy ?? 0) + 2 })}>↓</button>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">Clique numa célula para editá-la.</p>
        )}
      </div>
      <div className="flex flex-wrap gap-1 border-t border-border pt-2">
        <button className={btn} onClick={async () => {
          await navigator.clipboard.writeText(JSON.stringify(map));
          setCopied(true); setTimeout(() => setCopied(false), 1500);
        }}>{copied ? "Copiado!" : "Exportar JSON"}</button>
        <button className={btn} onClick={() => setMap(DEFAULT_MAP)}>Resetar</button>
      </div>
      <p className="text-sm text-muted-foreground">Alterações salvas neste navegador.</p>
    </div>
  );
}
