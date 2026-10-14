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

- Keep note models and sample content in `src/lib/notes.ts`, with editing isolated in `src/components/note-editor.tsx`, so the board and editor share one data contract.
- Persist account-owned notes through the generated Cloud client with owner-scoped RLS; signed-out sample notes are explicitly temporary and never persisted as private user data.
- Express note colors through global semantic CSS tokens, so all note surfaces and swatches stay consistent.
