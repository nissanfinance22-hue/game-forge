<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Game logic lives in src/game as decoupled modules (Grid/Movement/Combat/EnemyAI/Turn/Character/MapRenderer/BattleUI/GridCalibration); no backend — the prototype is client-only by request.
- Reference-art game windows use CDN-hosted original artwork with proportional accessible controls in a dedicated game UI module to preserve exact visual fidelity without altering combat rules.
- Prebundle the game dialog dependencies with React and reject outdated Vite dependency requests to prevent mixed React instances during preview updates.
