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

- Keep numeric knitting calculations and quantity validation in the dependency-free calculation module, with concrete unit tests; this keeps all entry points consistent.
- Use browser data hooks with owner-scoped Cloud policies for the existing private inventory, calculations and shopping flows; no privileged client is needed.
- Shopping entries record purchase status separately from inventory and project purchases; changing a checklist must not silently double-count stock.
