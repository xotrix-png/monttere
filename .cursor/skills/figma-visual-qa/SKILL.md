---
name: figma-visual-qa
description: >-
  Launch MONTÉRRE Figma ↔ site visual QA agent. Read-only report only.
  Use when starting the figma-visual-qa agent or auditing against Figma.
---

# Figma Visual QA (agent pack)

## Folder

`agents/figma-visual-qa/`

- `PROMPT.md` — полный промпт агента (основа + доступ)
- `CONTEXT.md` — репозиторий, URL, порт, Figma fileKey

## Site

- Repo: https://github.com/xotrix-png/monttere
- Local: http://127.0.0.1:5173/ port **5173**
- Path: `C:\Users\user\Desktop\monttere`

## Figma

- fileKey: `CO0yT5ll32AvgonliVkn5x`
- MCP: `user-figma` → `create_session` first

## Run

1. Read `agents/figma-visual-qa/PROMPT.md` and `CONTEXT.md`
2. Follow the prompt exactly (report only, no file edits)
3. Use browser on :5173 and Figma MCP for side-by-side comparison
