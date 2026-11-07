import { useEffect, useRef, useState } from "react";
import { MapRenderer } from "./MapRenderer";
import { GridCalibration } from "./GridCalibration";
import { ActionMenu, ResultScreen, TopBar, UnitCard } from "./BattleUI";
import { DEFAULT_MAP, MAP_IMAGE_SIZE, STORAGE_KEY } from "./mapData";
import { useBattle } from "./TurnSystem";
import { ElementalSynergy } from "./ElementalSynergy";
import type { MapData } from "./types";

function Battle({ map, setMap }: { map: MapData; setMap: (m: MapData) => void }) {
  const b = useBattle(map);
  const [scale, setScale] = useState(0.7);
  const [calibrating, setCalibrating] = useState(false);
  const [calibSel, setCalibSel] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const fit = Math.min(el.clientWidth / MAP_IMAGE_SIZE.w, el.clientHeight / MAP_IMAGE_SIZE.h);
    setScale(Math.max(0.3, Math.min(1.5, fit)));
  }, []);

  const zoom = (d: number) => setScale((s) => Math.max(0.3, Math.min(2.5, +(s + d).toFixed(2))));
  const selected = b.units.find((u) => u.id === b.selectedId);

  return (
    <div className="flex h-screen flex-col gap-2 overflow-hidden p-2">
      <div className="flex flex-wrap items-center gap-2">
        <TopBar turn={b.turn} active={b.active} />
        <ElementalSynergy />
        <div className="game-panel flex items-center">
          <button className="px-3 py-1 hover:bg-secondary" onClick={() => zoom(-0.1)} aria-label="Diminuir zoom">−</button>
          <span className="w-14 text-center">{Math.round(scale * 100)}%</span>
          <button className="px-3 py-1 hover:bg-secondary" onClick={() => zoom(0.1)} aria-label="Aumentar zoom">+</button>
        </div>
        <button className={`game-panel px-3 py-1 hover:bg-secondary ${calibrating ? "text-primary" : ""}`} onClick={() => setCalibrating((c) => !c)}>
          {calibrating ? "Sair da calibração" : "Calibrar grid"}
        </button>
        <span className="game-panel px-3 py-1 text-muted-foreground">{b.log}</span>
      </div>

      <div ref={boxRef} className="relative flex-1 overflow-auto" onWheel={(e) => { if (e.ctrlKey) { e.preventDefault(); zoom(e.deltaY < 0 ? 0.1 : -0.1); } }}>
        <div style={{ width: MAP_IMAGE_SIZE.w * scale, height: MAP_IMAGE_SIZE.h * scale }} className="mx-auto">
          <MapRenderer
            map={map}
            units={b.units}
            scale={scale}
            moveTiles={b.moveTiles}
            attackTiles={b.attackTiles}
            targetIds={b.attackTargets.map((t) => t.id)}
            selectedId={b.selectedId}
            activeId={b.active?.id}
            popups={b.popups}
            onPopupDone={(id) => b.setPopups((p) => p.filter((x) => x.id !== id))}
            onTileClick={(x, y) => (calibrating ? setCalibSel(`${x},${y}`) : b.onTileClick(x, y))}
            onUnitClick={(id) => {
              if (calibrating) {
                const u = b.units.find((v) => v.id === id);
                if (u) setCalibSel(`${u.x},${u.y}`);
              } else b.onUnitClick(id);
            }}
            calibrating={calibrating}
            calibSelected={calibSel}
          />
        </div>

        <div className="pointer-events-none fixed bottom-3 left-3 z-40 flex items-end gap-2 [&>*]:pointer-events-auto">
          {selected && <UnitCard u={selected} />}
          {b.isPlayerTurn && b.active && !calibrating && (
            <ActionMenu active={b.active} mode={b.mode} setMode={b.setMode} onWait={b.nextTurn} onEnd={b.nextTurn} />
          )}
        </div>
        {calibrating && (
          <div className="fixed right-3 top-16 z-40 max-h-[85vh] overflow-auto">
            <GridCalibration map={map} setMap={setMap} selected={calibSel} />
          </div>
        )}
        {b.result && <ResultScreen result={b.result} onRestart={b.restart} />}
      </div>
    </div>
  );
}

export function BattleGame() {
  const [map, setMapState] = useState<MapData>(DEFAULT_MAP);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setMapState(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);
  const setMap = (m: MapData) => {
    setMapState(m);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(m));
  };
  return <Battle map={map} setMap={setMap} />;
}
