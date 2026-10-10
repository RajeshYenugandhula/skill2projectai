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

## Architecture rules
- App state (profile, saved, portfolio, assessments) lives in `src/lib/store.tsx` persisted to localStorage — demo must work with no backend or keys.
- Recommendation scoring is deterministic in `src/lib/recommend.ts`; weights live in `WEIGHTS` — never add randomness so scores stay explainable.
- `supabase/schema.sql` is a reference schema for future Cloud persistence; not yet applied.
