import { createFileRoute } from "@tanstack/react-router";
import { BattleGame } from "@/game/BattleGame";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Legend of Mythology Heroes — RPG Tático" },
      { name: "description", content: "Protótipo jogável de RPG tático isométrico em pixel art com combate por turnos." },
      { property: "og:title", content: "The Legend of Mythology Heroes" },
      { property: "og:description", content: "RPG tático isométrico em pixel art com combate por turnos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BattleGame,
});
