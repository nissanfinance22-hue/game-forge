import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Network, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import synergyArt from "@/assets/elemental-synergy.png.asset.json";

const elements = [
  { id: "fire", name: "Fogo", level: "Nv. 3", stones: "7", className: "synergy-fire" },
  { id: "water", name: "Água", level: "Nv. 3", stones: "12", className: "synergy-water" },
  { id: "nature", name: "Natureza", level: "Nv. 1", stones: "5", className: "synergy-nature" },
  { id: "earth", name: "Terra", level: "Bloqueado", stones: "4", className: "synergy-earth" },
  { id: "electric", name: "Elétrico", level: "Nv. 2", stones: "9", className: "synergy-electric" },
];

export function ElementalSynergy() {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const element = elements.find((item) => item.id === selected);

  return (
    <Dialog open={open} onOpenChange={(value) => { setOpen(value); setDetails(false); setSelected(null); }}>
      <DialogPrimitive.Trigger asChild>
        <Button variant="outline" className="game-panel font-body text-xl"><Network /> Sinergia</Button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="synergy-overlay" />
        <DialogPrimitive.Content className="synergy-window" aria-describedby="synergy-description">
          <DialogTitle className="sr-only">Sinergia Elemental</DialogTitle>
          <DialogDescription id="synergy-description" className="sr-only">Destrave e conecte os elementos para fortalecer toda a sua jornada!</DialogDescription>
          <img src={synergyArt.url} alt="Sinergia Elemental: fogo, água, natureza, terra e elétrico; pedras elementais, bônus de sinergia e progresso da rede." width={1024} height={768} draggable={false} className="synergy-art" />
          {elements.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={`synergy-hotspot ${item.className}`}
              aria-label={`Detalhes de ${item.name}`}
              title={`${item.name} — ${item.level}`}
              onClick={() => { setSelected(item.id); setDetails(true); }}
            />
          ))}
          <Button variant="ghost" className="synergy-hotspot synergy-details" aria-label="Detalhes da sinergia" onClick={() => { setSelected(null); setDetails(true); }} />
          <Button variant="ghost" className="synergy-hotspot synergy-upgrade" aria-label="Aprimorar — indisponível nesta batalha" aria-disabled="true" title="Aprimoramento indisponível nesta batalha" />
          <DialogPrimitive.Close asChild>
            <Button variant="ghost" className="synergy-hotspot synergy-close" aria-label="Fechar sinergia" />
          </DialogPrimitive.Close>
          {details && (
            <section className="synergy-detail-panel" aria-label={element ? `Informações de ${element.name}` : "Bônus de sinergia"}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-body text-2xl">{element?.name ?? "Bônus de Sinergia"}</h2>
                <Button variant="ghost" size="icon" aria-label="Fechar detalhes" onClick={() => setDetails(false)}><X /></Button>
              </div>
              {element ? (
                <dl className="synergy-stats"><div><dt>Nível</dt><dd>{element.level}</dd></div><div><dt>Pedras disponíveis</dt><dd>{element.stones}</dd></div></dl>
              ) : (
                <dl className="synergy-stats"><div><dt>HP</dt><dd>+12%</dd></div><div><dt>Atk</dt><dd>+8%</dd></div><div><dt>Def</dt><dd>+8%</dd></div><div><dt>Vel</dt><dd>+6%</dd></div><div><dt>Progresso da Rede</dt><dd>3/5</dd></div></dl>
              )}
            </section>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}