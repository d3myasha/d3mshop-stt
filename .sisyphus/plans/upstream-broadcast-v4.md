# План: Premium Emoji Broadcast на upstream v4.0.1

## Контекст

Upstream `systemmaster1200-eng/remnawave-STEALTHNET-Bot` обновился до v4.0.1 (commit 92668f2). Наши broadcast-фиксы (premium emoji, copyMessage API, entity offset correction, email HTML conversion) были сделаны на v3.3.3. Нужно перенести ТОЛЬКО broadcast-изменения на upstream/main, сохранив upstream-добавления (Heleket, Lava payments).

## Проверка upstream

- `broadcast.service.ts` в upstream: 549 строк, НЕТ `sendTelegramCopyMessage`, `telegramEntitiesToHtml`, `removeSubstringAndAdjustEntities`
- `bot-admin.routes.ts` в upstream: НЕТ `entities`, `fromChatId`, `messageId` в broadcast schema
- `bot/src/api.ts` в upstream v4.0.1: добавлены `heleketEnabled`, `lavaEnabled`, `createHeleketPayment`, `createLavaPayment` — их НЕЛЬЗЯ удалять

## Файлы для изменения

1. **backend/src/modules/broadcast/broadcast.service.ts** — полная замена на нашу версию (upstream не менял с v3.3.3)
2. **backend/src/modules/bot-admin/bot-admin.routes.ts** — полная замена на нашу версию (upstream не менял)
3. **backend/src/modules/broadcast/__tests__/broadcast.utils.test.ts** — новый файл (тесты)
4. **backend/tsconfig.json** — добавить `"src/**/__tests__/**"` в `exclude`
5. **bot/src/api.ts** — аккуратный merge: добавить `entities`, `fromChatId`, `messageId` в `postBotAdminBroadcast`, сохранив heleket/lava

## Шаги исполнения

### Wave 1 — Backend файлы (4 файла, parallel)
- Скопировать `broadcast.service.ts`, `bot-admin.routes.ts`, `__tests__/broadcast.utils.test.ts`, `tsconfig.json` из ветки `feature/premium-emoji-broadcast`

### Wave 2 — Bot API (1 файл)
- Найти `postBotAdminBroadcast` в `bot/src/api.ts` (~строка 594)
- Заменить сигнатуру: добавить `entities?`, `fromChatId?`, `messageId?`
- Заменить `body: JSON.stringify(...)`: добавить `entities`, `fromChatId`, `messageId`
- Сохранить ВСЕ остальное (heleketEnabled, lavaEnabled, createHeleketPayment, createLavaPayment)

### Wave 3 — Коммит и пуш
- `git add -A`
- Коммит с сообщением о фиче
- `git push origin feature/premium-emoji-broadcast-v4`

### Wave 4 — Проверка
- `git diff upstream/main --stat` — ровно 5 файлов
- `node --test backend/src/modules/broadcast/__tests__/broadcast.utils.test.ts` — 30/30 pass
- Проверить `git diff upstream/main -- bot/src/api.ts` — нет удаления heleket/lava

## Коммит сообщение

```
feat(broadcast): premium emoji support + copyMessage API + entity offset correction + email HTML

- Add copyMessage API for 100% formatting preservation (custom_emoji, bold, italic, etc.)
- Fallback path with entities when button extraction needed
- removeSubstringAndAdjustEntities: full markdown [Button](URL) removal + entity offset recalculation
- truncateCaptionWithEntities: caption truncation with entity adjustment
- telegramEntitiesToHtml: boundary-splitting algorithm for nested entities (e.g., bold inside blockquote)
- sanitizeUrl: whitelist https?:// only, block javascript:/data: for email XSS prevention
- Explicit Zod schema for broadcast entities (url, custom_emoji_id, language)
- Unit tests: 30 test cases for all utility functions
- tsconfig: exclude __tests__ from tsc build
```

## PR в upstream

```bash
gh pr create \
  --repo systemmaster1200-eng/remnawave-STEALTHNET-Bot \
  --head d3myasha:feature/premium-emoji-broadcast-v4 \
  --base main \
  --title "feat(broadcast): premium emoji support + copyMessage API" \
  --body "..."
```

## Constraints

- НЕ менять другие файлы (index.ts, i18n.ts, keyboard.ts, frontend/index.html — это наш брендинг)
- НЕ удалять heleket/lava из api.ts
- НЕ добавлять npm зависимости
- Только dev-ветка upstream (target branch — main)
