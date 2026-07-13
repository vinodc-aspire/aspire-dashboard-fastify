# Bulk Upload for Test Accounts — Design

## Context

The Test Accounts page (`dashboard.aspirelearning.app/dashboard/test-accounts`) lets an admin mark an existing user as a test account by searching for their email one at a time (`GET /api/test-accounts/search`, then `PATCH /api/test-accounts/:userId`). This is slow when marking many users at once from a prepared list (e.g. a CSV of QA/test emails).

This feature adds a bulk path: upload a CSV of emails, look each one up, and mark any that exist as test accounts — while leaving the single-email flow untouched.

Two repos are involved:
- Backend: `aspire-dashboard-fastify` (this repo)
- Frontend: `landau-dashboard/frontend` (`data-table-test-accounts.tsx`)

## CSV format

Plain CSV, one email per line, **no header row**, no other columns. Blank lines are ignored. Example (from the user-provided sample):

```
suresh.nrh77@gmail.com
supreeth203@gmail.com
rajeevlandau@gmail.com
```

## Backend

### New endpoint: `POST /api/test-accounts/bulk-mark`

**Request body:**
```json
{ "emails": ["a@example.com", "b@example.com"] }
```

**Response 200:**
```json
{
  "results": [
    { "email": "a@example.com", "status": "marked", "id": "123", "name": "A" },
    { "email": "b@example.com", "status": "already_test_account", "id": "456", "name": "B" },
    { "email": "c@example.com", "status": "not_found" }
  ]
}
```

`status` is one of: `marked`, `already_test_account`, `not_found`. Order of `results` matches the order of input emails (deduplicated, case-insensitive).

**Implementation** (`testAccounts.service.ts`, following the existing raw-SQL style in this file):

1. Normalize input: trim whitespace, drop empty strings, dedupe case-insensitively, lowercase for matching.
2. Single lookup query joining `users` and `additional_signup_data`, matching `LOWER(u.email) = ANY(${normalizedEmails})` and `u.deleted_at IS NULL`, selecting `id, email, name, is_test_account`.
3. Partition the normalized input list against the lookup results:
   - Not present in results → `not_found`
   - Present with `is_test_account = true` → `already_test_account` (no-op, not re-updated)
   - Present with `is_test_account = false` → `marked` (added to an update batch)
4. Single `UPDATE users SET is_test_account = true, updated_at = NOW() WHERE id = ANY(${toMarkIds}) RETURNING id`.
5. Build the `results` array in input order using the data gathered in steps 2–4.

This keeps the whole operation to 2 DB round trips regardless of list size (no per-email loop).

### Route (`testAccounts.routes.ts`)

```
POST /test-accounts/bulk-mark
  body: { emails: string[] }
  response: 200 { results: [...] }, 400 ErrorResponse, 500 ErrorResponse
```

400 if `emails` is missing or empty after normalization.

### Controller (`testAccounts.controller.ts`)

Thin wrapper matching the existing controller pattern: validate body, call service, catch errors → 500 with a generic message, log via `request.log.error`.

## Frontend (`data-table-test-accounts.tsx`)

- Add a **"Bulk Upload"** button next to the existing "Search" button in the "Mark Existing User as Test Account" card.
- Clicking it opens a `Dialog` containing:
  - A **"Download sample CSV"** link. Generates a small template client-side (via a `Blob` + object URL) with 1–2 placeholder emails, one per line, no header — matching the real format exactly.
  - A file input accepting `.csv` + an "Upload" button (disabled until a file is chosen).
  - On file read (`FileReader.readAsText`): split on newlines, trim each line, drop blanks, dedupe case-insensitively → the email list to submit. If the resulting list is empty, show an inline error and don't submit.
  - Before submitting, an `AlertDialog` confirm step: "This will check N emails and mark any matches as test accounts. Continue?" — mirrors the existing single-mark confirmation pattern.
  - On confirm: `POST /test-accounts/bulk-mark` with `{ emails }`.
  - On response: show a summary line (e.g. "8 marked, 2 already test accounts, 3 not found") and a scrollable table of `Email | Status` (status rendered as a colored badge: green = marked, gray = already test account, red = not found), all within the same dialog.
  - On network/500 error: a generic inline error message in the dialog; nothing partially applied since the backend update is a single statement.
- Closing the dialog (or on a subsequent action) triggers `fetchAccounts()` so newly-marked users show up in the main table without a manual page refresh.

## Out of scope

- No creation of new users from the CSV — only existing users can be bulk-marked (mirrors the current single-email "mark existing user" flow; creating accounts remains a separate, deliberate action via "+ Create Test Account").
- No CSV column beyond a single email column, no header-row support.
- No undo/bulk-unmark from the same dialog — unmarking remains per-row via the existing "Remove" action in the table.

## Testing notes

- Local dev currently points at the **production** database (`landau-db-prod...`), same as the existing single-mark feature. Manual testing of the bulk endpoint should use a couple of known-safe emails (e.g. the `@landauschool.com` / `@aspiretesting.live` addresses already used for test accounts) rather than marking arbitrary real users.
- Backend: verify via `curl` against the local dev server — a mix of found/not-found/already-marked emails in one request, confirm `results` order and statuses.
- Frontend: manual verification in the browser — download the sample CSV, edit it, upload, confirm the dialog summary/table and that the main table refreshes.
