## 2026-05-05 Task: broadcast-premium-emoji plan execution

### Completed
- P1: 4 utility functions in broadcast.service.ts (removeSubstringAndAdjustEntities, truncateCaptionWithEntities, telegramEntitiesToHtml, sendTelegramCopyMessage)
- P2: Core integration (copyMessage path in runBroadcast, email HTML conversion, caption truncation)
- P3: Bot-admin API schema (fromChatId, messageId optional fields)
- P4: Bot payload capture (raw text, fromChatId/messageId from ctx.chat/ctx.message)
- P5: Bot API client (fromChatId, messageId parameters)
- Unit tests: 25 test cases in __tests__/broadcast.utils.test.ts

### Key Decisions
- Hybrid approach: copyMessage when no button extraction needed, sendMessage fallback with entity offset correction otherwise
- Button extraction moved from bot (client) to backend (server) — backend uses removeSubstringAndAdjustEntities
- Email channel now gets proper HTML via telegramEntitiesToHtml instead of plain text with <br>
- Exported utility functions from broadcast.service.ts for testability

### Gotchas
- parse_mode and entities are mutually exclusive in Telegram Bot API
- copyMessage requires the original message to still exist (admin must not delete during broadcast)
- UTF-16 offsets: JS String.length matches Telegram convention
- When buttonText is present, copyMessage is NOT used (need to modify text server-side)

### Blocker: Ручное QA
- Requires deployment to server (108.165.164.185)
- Deploy order: backend FIRST, then bot (backward compatible — old bot works with new backend, but new bot sends unknown fields to old backend → 400)
- QA checklist:
  1. Text with premium emoji → copyMessage preserves exactly
  2. Text with [Button](URL) + premium emoji → fallback path, button extracted, entities recalculated
  3. Photo with long caption + entities → caption truncated properly
  4. Email with entities → proper HTML formatting
  5. Web admin broadcast → backward compatible (fallback path)
