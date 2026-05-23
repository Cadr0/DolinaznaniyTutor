# E2E Test Report — Homework System

**Date:** 2026-05-23  
**Environment:** https://diary-ai.ru  
**Commit deployed:** `f1e8f59`  
**Runner:** Playwright (Chromium), 13 scenarios

## Summary

| Result | Count |
|--------|-------|
| Passed | 10 |
| Skipped (no data) | 2 |
| Flaky (passed on retry) | 1 |
| Failed | 0 |

## Scenarios

### Auth (`e2e/auth.spec.ts`)

| Test | Result | Notes |
|------|--------|-------|
| Tutor login | ✅ Pass | |
| Student login | ⚠️ Flaky | First attempt timed out; retry succeeded. Likely cold start / network latency after deploy. |

### Tutor (`e2e/homework-tutor.spec.ts`)

| Test | Result | Notes |
|------|--------|-------|
| Room shows students with progress action | ✅ Pass | Button uses `aria-label="Прогресс ученика"`. |
| Open student progress panel | ✅ Pass | Dialog opens with stats and «Назначить тему». |
| Assign topic modal replaces progress panel | ✅ Pass | Only one dialog visible (fix for nested modals). |
| Revoke inline confirm | ⏭ Skipped | No assignments to revoke in test room. |

### Student (`e2e/homework-student.spec.ts`)

| Test | Result | Notes |
|------|--------|-------|
| Homework hub loads | ✅ Pass | |
| Empty state or assignment cards | ✅ Pass | |
| Skip without browser confirm | ✅ Pass | No `window.confirm` dialog; URL changes after skip. |
| Wrong answer stays on task | ⏭ Skipped | Current task in queue is not TEXT type. |
| Hint button reveals hint | ✅ Pass | Shows hint text or «Подсказки нет». |
| Photo upload on IMAGE task | ✅ Pass | No EACCES; helper text visible. |
| Progress page loads | ✅ Pass | |

## Issues Found (before fixes)

| # | Problem | Impact | Fix applied |
|---|---------|--------|-------------|
| 1 | Two dialogs open at once (progress + assign) | Confusing UI, E2E strict-mode failure | Hide progress panel when assign modal opens (`open && !assignOpen`) |
| 2 | `router.replace` after correct/skip sometimes didn't navigate | Student stuck on completed task | Use `window.location.assign` for reliable full navigation |
| 3 | Progress bar stale until page refresh | Misleading % after skip/correct | Optimistic `completedCount` state in `TaskPlayer` |
| 4 | Generic `"Error"` in catch blocks | Users see unhelpful message | i18n `genericError`, `uploadFailed` |
| 5 | IMAGE tasks: upload then check unclear | Users didn't know to press «Проверить» | Added `imageSubmitHint` above dropzone |
| 6 | Hardcoded Russian strings | Broken EN locale in homework UI | i18n in `RoomStudentsSection`, `StudentTaskView`, `AssignTopicModal`, progress page |
| 7 | `confirm()` on revoke assignment | Unexpected browser dialog on mobile | Inline confirm (Отмена / Подтвердить) |
| 8 | Repeated login in every test caused timeouts | Flaky E2E | `globalSetup` + `storageState` per role |
| 9 | Photo upload EACCES on prod | Upload failed silently | Fixed in prior deploy (`docker-entrypoint.sh` chown) |

## Recommended follow-ups (not blocking)

1. **Full assign → solve → teacher stats flow** — add E2E that tutor assigns a fresh topic, student solves TEXT wrong→correct, tutor sees attempts. Requires test fixture topic or cleanup step.
2. **`/dashboard/review`** — still a stub for IMAGE manual review by teacher.
3. **Wrong-answer E2E** — ensure test room has at least one TEXT task in student queue, or create assignment in `beforeAll`.
4. **Revoke E2E** — seed assignment in test setup to exercise inline revoke.
5. **Login flakiness** — consider `waitUntil: 'domcontentloaded'` instead of `load`, or increase auth project timeout slightly.

## How to run

```bash
E2E_BASE_URL=https://diary-ai.ru npm run test:e2e
```

Optional env vars: `E2E_TUTOR_EMAIL`, `E2E_TUTOR_PASSWORD`, `E2E_STUDENT_EMAIL`, `E2E_STUDENT_PASSWORD`, `E2E_ROOM_ID`.

HTML report: `playwright-report/index.html` after run.

## Deploy

- Pushed `f1e8f59` to `main`
- GitHub Actions workflow **Deploy to VDS** completed successfully
- Verified: `GET /api/version` → `"commit":"f1e8f59"`
