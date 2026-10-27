# MONTÉRRE agents

## Figma visual QA (new pack)

- **Folder:** [`agents/figma-visual-qa/`](agents/figma-visual-qa/)
- **Prompt:** [`agents/figma-visual-qa/PROMPT.md`](agents/figma-visual-qa/PROMPT.md)
- **Context:** [`agents/figma-visual-qa/CONTEXT.md`](agents/figma-visual-qa/CONTEXT.md) — repo, http://127.0.0.1:5173/, port 5173, Figma
- **Skill:** `.cursor/skills/figma-visual-qa/SKILL.md`
- **Mode:** check-only report (no file edits)

## Figma readonly reviewer (legacy)

- **Prompt:** open a new Agent chat and paste [`agents/figma-reviewer.PROMPT.md`](agents/figma-reviewer.PROMPT.md)
- **Skill:** `.cursor/skills/figma-site-reviewer/SKILL.md`
- **Rule:** `.cursor/rules/figma-readonly-reviewer.mdc`
- **Mode:** read-only — Figma + local site + code audit only; no file edits
