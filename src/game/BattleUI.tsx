import type { Character } from "./types";
import type { Mode } from "./TurnSystem";

export function TopBar({ turn, active }: { turn: number; active?: Character }) {
  return (
    <div className="game-panel flex items-center gap-4 px-4 py-2">
      <h1 className="font-pixel text-[11px] leading-tight text-primary sm:text-xs">THE LEGEND OF MYTHOLOGY HEROES</h1>
      <span className="text-muted-foreground">Turno <b className="text-foreground">{turn}</b></span>
      {active && (
        <span className="text-muted-foreground">Ativo: <b className={active.team === "player" ? "text-select" : "text-danger"}>{active.name}</b></span>
      )}
    </div>
  );
}

export function UnitCard({ u }: { u: Character }) {
  return (
    <div className="game-panel w-56 p-3">
      <div className="flex items-baseline justify-between">
        <span className="font-pixel text-[10px] text-primary">{u.name}</span>
        <span className={u.team === "player" ? "text-hp" : "text-danger"}>{u.team === "player" ? "Aliado" : "Inimigo"}</span>
      </div>
      <div className="mt-2 h-2.5 w-full border border-border bg-background">
        <div className={u.team === "player" ? "h-full bg-hp" : "h-full bg-danger"} style={{ width: `${(u.hp / u.maxHp) * 100}%` }} />
      </div>
      <div className="mt-1 grid grid-cols-2 gap-x-3 leading-tight">
        <span>HP {u.hp}/{u.maxHp}</span>
        <span>ATQ {u.attack}</span>
        <span>DEF {u.defense}</span>
        <span>MOV {u.hasMoved ? 0 : u.movement}</span>
        <span>ALC {u.attackRange}</span>
        <span>Z {u.z}</span>
      </div>
    </div>
  );
}

type MenuProps = {
  active: Character;
  mode: Mode;
  setMode: (m: Mode) => void;
  onWait: () => void;
  onEnd: () => void;
};

export function ActionMenu({ active, mode, setMode, onWait, onEnd }: MenuProps) {
  const item = (label: string, onClick: () => void, disabled = false, on = false) => (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`block w-full px-3 py-0.5 text-left text-lg transition-colors disabled:opacity-35 ${on ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
    >
      {on ? "▶ " : ""}{label}
    </button>
  );
  return (
    <div className="game-panel w-40 py-1">
      {item("Mover", () => setMode("move"), active.hasMoved, mode === "move")}
      {item("Atacar", () => setMode("attack"), active.hasActed, mode === "attack")}
      {item("Esperar", onWait)}
      {item("Finalizar turno", onEnd)}
    </div>
  );
}

export function ResultScreen({ result, onRestart }: { result: "victory" | "defeat"; onRestart: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/70">
      <div className="game-panel p-8 text-center">
        <h2 className={`font-pixel text-2xl ${result === "victory" ? "text-primary" : "text-danger"}`}>
          {result === "victory" ? "VITÓRIA!" : "DERROTA"}
        </h2>
        <p className="mt-3 text-muted-foreground">
          {result === "victory" ? "Todos os inimigos foram derrotados." : "O herói caiu em batalha."}
        </p>
        <button onClick={onRestart} className="mt-6 bg-primary px-5 py-2 font-pixel text-[10px] text-primary-foreground hover:opacity-90">
          REINICIAR BATALHA
        </button>
      </div>
    </div>
  );
}
