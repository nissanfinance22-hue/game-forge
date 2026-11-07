import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Backpack, BookOpen, CircleDot, Gem, Network, Settings, X, Flame, Droplets, Leaf, Mountain, Zap, Heart, Sword, Shield, Feather, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import frame from "@/assets/synergy-window-frame.jpg";
import fire from "@/assets/synergy-fire.png";
import water from "@/assets/synergy-water.png";
import nature from "@/assets/synergy-nature.png";
import earth from "@/assets/synergy-earth.png";
import electric from "@/assets/synergy-electric.png";
import core from "@/assets/synergy-core.png";

const elements = [
  { id: "fire", name: "Fogo", level: "Nv. 3", stones: 7, progress: "7/12", image: fire, icon: Flame },
  { id: "water", name: "Água", level: "Nv. 3", stones: 12, progress: "12/16", image: water, icon: Droplets },
  { id: "nature", name: "Natureza", level: "Nv. 1", stones: 5, progress: "5/8", image: nature, icon: Leaf },
  { id: "earth", name: "Terra", level: "Bloqueado", stones: 4, progress: "0/10", image: earth, icon: Mountain },
  { id: "electric", name: "Elétrico", level: "Nv. 2", stones: 9, progress: "12/16", image: electric, icon: Zap },
];
const tabs = [{ name: "Bolsa", icon: Backpack }, { name: "Monstros", icon: CircleDot }, { name: "Códex", icon: BookOpen }, { name: "Elemental", icon: Gem }, { name: "Sinergia", icon: Network }, { name: "Opções", icon: Settings }];
const bonuses = [{ name: "HP", value: "+12%", icon: Heart }, { name: "Atk", value: "+8%", icon: Sword }, { name: "Def", value: "+8%", icon: Shield }, { name: "Vel", value: "+6%", icon: Feather }];

export function ElementalSynergy() {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState("Sinergia");
  const element = elements.find((item) => item.id === selected);
  return (
    <Dialog open={open} onOpenChange={(value) => { setOpen(value); setDetails(false); setSelected(null); setTab("Sinergia"); }}>
      <DialogPrimitive.Trigger asChild><Button variant="outline" className="game-panel font-body text-xl"><Network /> Sinergia</Button></DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="synergy-overlay" />
        <DialogPrimitive.Content className="synergy-window" aria-describedby="synergy-description">
          <img src={frame} alt="" className="synergy-frame" draggable={false} />
          <DialogTitle className="synergy-title">{tab === "Sinergia" ? "SINERGIA ELEMENTAL" : tab.toUpperCase()}</DialogTitle>
          <DialogDescription id="synergy-description" className="synergy-description">✧ Destrave e conecte os elementos para fortalecer toda a sua jornada! ✧</DialogDescription>
          <nav className="synergy-tabs" aria-label="Abas do menu">
            {tabs.map((item) => <Button key={item.name} variant="ghost" className={`synergy-tab ${tab === item.name ? "is-active" : ""}`} aria-pressed={tab === item.name} onClick={() => { setTab(item.name); setDetails(false); }}><item.icon /><span>{item.name}</span></Button>)}
          </nav>
          {tab === "Sinergia" || tab === "Elemental" ? <>
            <div className="synergy-wheel" aria-label="Rede elemental">
              <div className="synergy-ring" />
              <img src={core} className="synergy-core" alt="Cristal de sinergia" />
              {elements.map((item) => <Button key={item.id} variant="ghost" className={`synergy-node node-${item.id} ${selected === item.id ? "is-selected" : ""}`} aria-label={`Detalhes de ${item.name}`} onClick={() => { setSelected(item.id); setDetails(true); }}>
                <img src={item.image} alt="" /><span className="synergy-node-label"><span><item.icon /> {item.name.toUpperCase()}</span><b>{item.level}</b><span className="synergy-node-progress">{item.progress}</span></span>
              </Button>)}
            </div>
            <aside className="synergy-summary">
              <section className="synergy-summary-section"><h2><Gem /> Pedras Elementais</h2><ul>{elements.map((item) => <li key={item.id}><img src={item.image} alt="" /><span>Pedra {item.name === "Água" ? "d’Água" : `de ${item.name}`}</span><b>× {item.stones}</b></li>)}</ul></section>
              <section className="synergy-summary-section"><h2><Leaf /> Bônus de Sinergia</h2><ul>{bonuses.map((item) => <li key={item.name}><item.icon /><span>{item.name}</span><b>{item.value}</b></li>)}</ul></section>
              <section className="synergy-summary-section"><h2><Network /> Progresso da Rede</h2><div className="synergy-network-progress"><progress value={3} max={5} aria-label="Progresso da Rede" /><b>3/5</b></div><div className="synergy-network-icons"><Flame /><Droplets /><Leaf /><Lock /><Lock /></div></section>
            </aside>
          </> : <section className="synergy-tab-content"><h2>{tab}</h2><p>{tab === "Bolsa" ? "Pedras Elementais" : tab === "Monstros" ? "Nenhum monstro capturado." : tab === "Códex" ? "Elementos descobertos" : "Áudio"}</p>{(tab === "Bolsa" || tab === "Códex") && elements.map((item) => <div key={item.id}><img src={item.image} alt="" /><span>{item.name}</span><b>{tab === "Bolsa" ? `× ${item.stones}` : item.level}</b></div>)}{tab === "Opções" && <label><input type="checkbox" defaultChecked /> Sons</label>}</section>}
          <footer className="synergy-footer">
            <Button className="synergy-command command-details" onClick={() => { setSelected(null); setDetails(true); }} aria-label="Detalhes da sinergia"><span>Y</span> Detalhes <BookOpen /></Button>
            <Button className="synergy-command command-upgrade" aria-disabled="true" title="Aprimoramento indisponível nesta batalha"><span>A</span> Aprimorar <Gem /></Button>
            <DialogPrimitive.Close asChild><Button className="synergy-command command-close" aria-label="Fechar sinergia"><span>B</span> Fechar <X /></Button></DialogPrimitive.Close>
          </footer>
          {details && <section className="synergy-detail-panel" aria-label={element ? `Informações de ${element.name}` : "Bônus de sinergia"}><div className="flex items-center justify-between gap-3"><h2>{element?.name ?? "Bônus de Sinergia"}</h2><Button variant="ghost" size="icon" aria-label="Fechar detalhes" onClick={() => setDetails(false)}><X /></Button></div>{element ? <dl className="synergy-stats"><div><dt>Nível</dt><dd>{element.level}</dd></div><div><dt>Pedras disponíveis</dt><dd>{element.stones}</dd></div></dl> : <dl className="synergy-stats">{bonuses.map((item) => <div key={item.name}><dt>{item.name}</dt><dd>{item.value}</dd></div>)}<div><dt>Progresso da Rede</dt><dd>3/5</dd></div></dl>}</section>}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}
