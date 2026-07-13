# Bulk Upload for Test Accounts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let an admin upload a CSV of emails on the Test Accounts page and bulk-mark any matching existing users as test accounts, instead of searching one email at a time.

**Architecture:** A new `POST /api/test-accounts/bulk-mark` Fastify endpoint does one lookup query + one bulk `UPDATE` (2 DB round trips regardless of list size) and returns a per-email status. A new frontend `BulkUploadDialog` component parses the CSV client-side, confirms, submits, and shows a results table; it's wired into the existing `TestAccountsTable` via a new "Bulk Upload" button next to "Search".

**Tech Stack:** Backend: Fastify 5, TypeBox, drizzle-orm raw `sql` templates, node-postgres (`aspire-dashboard-fastify` repo). Frontend: Next.js 15, React 19, axios, Radix Dialog/AlertDialog (`landau-dashboard/frontend` repo).

## Global Constraints

- Full spec: `docs/superpowers/specs/2026-07-13-bulk-upload-test-accounts-design.md` in this repo.
- CSV format: one email per line, no header row, no other columns.
- Backend uses raw `sql` template tags via drizzle (see `src/services/testAccounts.service.ts`), not the query builder — follow that convention, not a new ORM pattern.
- No new dependencies needed in either repo (no CSV parsing library — single-column parsing is a one-line `split`).
- **No automated test framework exists in either repo** (no jest/vitest/mocha configured). Verification steps in this plan are manual: `curl` against the local dev backend, and manual checks in the browser — matching how the rest of this codebase is verified today. Do not add a test framework as part of this feature.
- Local dev backend (`aspire-dashboard-fastify`, port 3002) is already wired to the **production** database. Manual verification must reuse emails already visible in the local Test Accounts table (e.g. one already marked, to test `already_test_account`) plus one made-up email (to test `not_found`) — never an arbitrary real user's email, to avoid mutating real accounts as a side effect of testing.
- Frontend dev server expects `NEXT_PUBLIC_API_BASE_URL` in `landau-dashboard/frontend/.env` to point at the local backend (already set to `http://localhost:3002/api` for this session).

---

### Task 1: Backend — `bulkMarkTestAccounts` service function

**Files:**
- Modify: `src/services/testAccounts.service.ts`

**Interfaces:**
- Produces: `bulkMarkTestAccounts(db: NodePgDatabase, emails: string[]): Promise<Array<{ email: string; status: 'marked' | 'already_test_account' | 'not_found'; id?: string; name?: unknown }>>` — thrown error has `.statusCode = 400` if `emails` normalizes to an empty list.

- [ ] **Step 1: Add the function**

Append to `src/services/testAccounts.service.ts`:

```ts
export async function bulkMarkTestAccounts(db: NodePgDatabase, emails: string[]) {
  const normalized = Array.from(
    new Set(emails.map(e => e.trim().toLowerCase()).filter(e => e.length > 0))
  )

  if (normalized.length === 0) {
    const err = new Error('At least one email is required') as Error & { statusCode: number }
    err.statusCode = 400
    throw err
  }

  const found = await db.execute(sql`
    SELECT u.id, u.email, asd.student_name AS name, u.is_test_account
    FROM users u
    LEFT JOIN additional_signup_data asd ON u.id = asd.user_id
    WHERE LOWER(u.email) = ANY(${normalized}::text[])
      AND u.deleted_at IS NULL
  `)

  const byEmail = new Map<string, { id: string; name: unknown; is_test_account: boolean }>()
  for (const row of found.rows as Record<string, unknown>[]) {
    byEmail.set(String(row.email).toLowerCase(), {
      id: String(row.id),
      name: row.name,
      is_test_account: Boolean(row.is_test_account),
    })
  }

  const toMarkIds: string[] = []
  for (const email of normalized) {
    const match = byEmail.get(email)
    if (match && !match.is_test_account) {
      toMarkIds.push(match.id)
    }
  }

  if (toMarkIds.length > 0) {
    await db.execute(sql`
      UPDATE users
      SET is_test_account = true, updated_at = NOW()
      WHERE id = ANY(${toMarkIds}::bigint[])
    `)
  }

  return normalized.map(email => {
    const match = byEmail.get(email)
    if (!match) {
      return { email, status: 'not_found' as const }
    }
    if (match.is_test_account) {
      return { email, status: 'already_test_account' as const, id: match.id, name: match.name ?? email }
    }
    return { email, status: 'marked' as const, id: match.id, name: match.name ?? email }
  })
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run build`
Expected: compiles with no errors (the `dist/` output is not committed — this is just a type-check gate).

- [ ] **Step 3: Commit**

```bash
git add src/services/testAccounts.service.ts
git commit -m "feat: add bulkMarkTestAccounts service function"
```

---

### Task 2: Backend — controller and route

**Files:**
- Modify: `src/controllers/testAccounts.controller.ts`
- Modify: `src/routes/testAccounts.routes.ts`

**Interfaces:**
- Consumes: `testAccountsService.bulkMarkTestAccounts(db, emails)` from Task 1.
- Produces: `POST /api/test-accounts/bulk-mark` — request `{ emails: string[] }`, response `200 { results: [...] }`.

- [ ] **Step 1: Add the controller function**

Append to `src/controllers/testAccounts.controller.ts`:

```ts
export async function bulkMarkTestAccounts(
  request: FastifyRequest<{ Body: { emails: string[] } }>,
  reply: FastifyReply
) {
  const { emails } = request.body
  if (!Array.isArray(emails) || emails.length === 0) {
    return reply.status(400).send({ error: 'emails array is required' })
  }
  try {
    const results = await testAccountsService.bulkMarkTestAccounts(request.server.db, emails)
    reply.send({ results })
  } catch (error) {
    const err = error as { statusCode?: number; message?: string }
    const statusCode = err.statusCode ?? 500
    reply.status(statusCode).send({ error: err.message ?? 'Failed to bulk mark test accounts' })
  }
}
```

- [ ] **Step 2: Add the route**

In `src/routes/testAccounts.routes.ts`, add this schema near the top (alongside `TestAccountRow` / `UserSearchResult`):

```ts
const BulkMarkResultItem = Type.Object({
  email: Type.String(),
  status: Type.Union([
    Type.Literal('marked'),
    Type.Literal('already_test_account'),
    Type.Literal('not_found'),
  ]),
  id: Type.Optional(Type.String()),
  name: Type.Optional(Type.Any()),
})
```

And add this route inside `testAccountsRoutes`, after the existing `PATCH /test-accounts/:userId` route:

```ts
  // POST /api/test-accounts/bulk-mark — mark multiple existing users as test accounts
  app.post('/test-accounts/bulk-mark', {
    schema: {
      body: Type.Object({ emails: Type.Array(Type.String()) }),
      response: {
        200: Type.Object({ results: Type.Array(BulkMarkResultItem) }),
        400: ErrorResponse,
        500: ErrorResponse,
      },
    },
  }, testAccountsController.bulkMarkTestAccounts)
```

- [ ] **Step 3: Typecheck**

Run: `npm run build`
Expected: compiles with no errors.

- [ ] **Step 4: Verify manually against the running dev server**

The dev server (`npm run dev`) auto-reloads on save via `tsx watch`. Confirm it picked up the change:

Run: `curl -s http://localhost:3002/health`
Expected: `{"status":"ok","port":3002}`

Then test the three status branches in one request. Use an email already visible as a test account in the local Test Accounts table (`already_test_account`), a made-up email (`not_found`), and confirm dedupe by repeating one:

```bash
curl -s -X POST http://localhost:3002/api/test-accounts/bulk-mark \
  -H "Content-Type: application/json" \
  -d '{"emails":["shainsingh89@outlook.com","shainsingh89@outlook.com","this-email-does-not-exist-xyz@example.com"]}'
```

Expected: a `results` array with exactly 2 entries (deduped) — one `{"email":"shainsingh89@outlook.com","status":"already_test_account",...}` and one `{"email":"this-email-does-not-exist-xyz@example.com","status":"not_found"}`.

Also verify the 400 path:

Run: `curl -s -X POST http://localhost:3002/api/test-accounts/bulk-mark -H "Content-Type: application/json" -d '{"emails":[]}'`
Expected: `400` status with `{"error":"emails array is required"}`.

- [ ] **Step 5: Commit**

```bash
git add src/controllers/testAccounts.controller.ts src/routes/testAccounts.routes.ts
git commit -m "feat: add POST /test-accounts/bulk-mark route"
```

---

### Task 3: Frontend — `BulkUploadDialog` component

**Files:**
- Create: `components/bulk-upload-test-accounts-dialog.tsx`

**Interfaces:**
- Produces: `export default function BulkUploadDialog({ open, onOpenChange, onComplete }: { open: boolean; onOpenChange: (open: boolean) => void; onComplete: () => void })` — a self-contained dialog: file picker, sample CSV download, confirm, submit to `POST /test-accounts/bulk-mark`, results table. Calls `onComplete()` when the dialog is closed (so the parent can refetch the accounts list).

- [ ] **Step 1: Create the component**

```tsx
"use client";
import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

type BulkMarkStatus = "marked" | "already_test_account" | "not_found";

interface BulkMarkResult {
  email: string;
  status: BulkMarkStatus;
  id?: string;
  name?: string;
}

const statusLabel: Record<BulkMarkStatus, string> = {
  marked: "Marked",
  already_test_account: "Already test account",
  not_found: "Not found",
};

const statusClass: Record<BulkMarkStatus, string> = {
  marked: "bg-green-100 text-green-800",
  already_test_account: "bg-gray-100 text-gray-800",
  not_found: "bg-red-100 text-red-800",
};

function parseEmails(text: string): string[] {
  const seen = new Set<string>();
  const emails: string[] = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const email = rawLine.trim();
    if (!email) continue;
    const key = email.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    emails.push(email);
  }
  return emails;
}

function downloadSampleCsv() {
  const content = "user1@example.com\nuser2@example.com\n";
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "test-accounts-sample.csv";
  a.click();
  URL.revokeObjectURL(url);
}

interface BulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export default function BulkUploadDialog({
  open,
  onOpenChange,
  onComplete,
}: BulkUploadDialogProps) {
  const [emails, setEmails] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [results, setResults] = useState<BulkMarkResult[] | null>(null);

  function reset() {
    setEmails([]);
    setFileName("");
    setParseError(null);
    setUploadError(null);
    setResults(null);
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      reset();
      onComplete();
    }
    onOpenChange(next);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setParseError(null);
    setResults(null);
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseEmails(String(reader.result ?? ""));
      if (parsed.length === 0) {
        setParseError("No valid emails found in this file");
      }
      setEmails(parsed);
    };
    reader.readAsText(file);
  }

  async function handleUpload() {
    setUploading(true);
    setUploadError(null);
    try {
      const res = await axios.post<{ results: BulkMarkResult[] }>(
        `${API_BASE_URL}/test-accounts/bulk-mark`,
        { emails },
      );
      setResults(res.data.results);
    } catch {
      setUploadError("Bulk upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  const summary = results
    ? {
        marked: results.filter((r) => r.status === "marked").length,
        already: results.filter((r) => r.status === "already_test_account")
          .length,
        notFound: results.filter((r) => r.status === "not_found").length,
      }
    : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Upload Test Accounts</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <button
            type="button"
            onClick={downloadSampleCsv}
            className="text-sm text-primary underline"
          >
            Download sample CSV
          </button>

          <div>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="text-sm"
            />
            {fileName && (
              <p className="text-sm text-muted-foreground mt-1">
                {fileName} — {emails.length} email(s) found
              </p>
            )}
            {parseError && (
              <p className="text-destructive text-sm mt-1">{parseError}</p>
            )}
          </div>

          {uploadError && (
            <p className="text-destructive text-sm">{uploadError}</p>
          )}

          {!results && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={emails.length === 0 || uploading}>
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Mark {emails.length} email(s) as test accounts?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will check {emails.length} email(s) against existing
                    users and mark any matches as test accounts. Emails that
                    don&apos;t match an existing user will be skipped.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleUpload}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {summary && (
            <div className="space-y-3">
              <p className="text-sm font-medium">
                {summary.marked} marked, {summary.already} already test
                accounts, {summary.notFound} not found
              </p>
              <div className="border rounded-md max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-background">
                    <tr>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r) => (
                      <tr key={r.email} className="border-t">
                        <td className="p-2">{r.email}</td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${statusClass[r.status]}`}
                          >
                            {statusLabel[r.status]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors reported for `components/bulk-upload-test-accounts-dialog.tsx`.

- [ ] **Step 3: Commit**

```bash
git add components/bulk-upload-test-accounts-dialog.tsx
git commit -m "feat: add BulkUploadDialog component for test accounts"
```

---

### Task 4: Frontend — wire "Bulk Upload" button into `TestAccountsTable`

**Files:**
- Modify: `components/data-table-test-accounts.tsx`

**Interfaces:**
- Consumes: `BulkUploadDialog` from Task 3 — `{ open, onOpenChange, onComplete }`.
- Consumes: existing `fetchAccounts()` (defined in this file) as the `onComplete` callback.

- [ ] **Step 1: Import the new component**

At the top of `components/data-table-test-accounts.tsx`, after the existing `Eye, EyeOff` import line:

```tsx
import { Eye, EyeOff } from "lucide-react";
import BulkUploadDialog from "@/components/bulk-upload-test-accounts-dialog";
```

- [ ] **Step 2: Add dialog-open state**

Near the other state declarations (after `const [searchLoading, setSearchLoading] = useState(false);`):

```tsx
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
```

- [ ] **Step 3: Add the "Bulk Upload" button next to "Search"**

Replace this block:

```tsx
          <div className="flex gap-2 max-w-md">
            <Input
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="user@example.com"
            />
            <Button
              onClick={handleSearch}
              disabled={searchLoading || !searchEmail}
            >
              {searchLoading ? "Searching..." : "Search"}
            </Button>
          </div>
```

with:

```tsx
          <div className="flex gap-2 max-w-md">
            <Input
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="user@example.com"
            />
            <Button
              onClick={handleSearch}
              disabled={searchLoading || !searchEmail}
            >
              {searchLoading ? "Searching..." : "Search"}
            </Button>
            <Button variant="outline" onClick={() => setBulkDialogOpen(true)}>
              Bulk Upload
            </Button>
          </div>
```

- [ ] **Step 4: Render the dialog**

Just before the final closing `</div>` of the component's return statement (after the existing `</Dialog>` that closes the "Create Test Account Dialog"), add:

```tsx
      <BulkUploadDialog
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        onComplete={fetchAccounts}
      />
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Verify manually in the browser**

With both dev servers running (backend on 3002, frontend on 4000):

1. Open `http://localhost:4000/dashboard/test-accounts`.
2. Confirm a "Bulk Upload" button now appears next to "Search" in the "Mark Existing User as Test Account" card.
3. Click it — confirm the dialog opens with "Download sample CSV", a file input, and a disabled "Upload" button.
4. Click "Download sample CSV" — confirm a `test-accounts-sample.csv` file downloads with two placeholder emails, one per line.
5. Create a small local test CSV with one already-marked email (e.g. `shainsingh89@outlook.com`) and one made-up email, upload it, confirm the "Upload" button enables and shows "N email(s) found".
6. Click Upload, confirm the AlertDialog appears, click Continue.
7. Confirm the summary line and results table render with correct statuses (`Already test account` / `Not found`).
8. Close the dialog, confirm the main Test Accounts table below still reflects current data (no crash, no stale state).

- [ ] **Step 7: Commit**

```bash
git add components/data-table-test-accounts.tsx
git commit -m "feat: wire Bulk Upload dialog into test accounts page"
```

---

## Self-Review Notes

- **Spec coverage:** endpoint + service (Task 1–2), sample CSV download (Task 3), confirm step (Task 3), results summary/table (Task 3), button placement next to Search (Task 4), table refresh on close (Task 4) — all covered. Out-of-scope items (no user creation from CSV, no header-row support, no bulk-unmark) require no task, matching the spec.
- **Placeholder scan:** no TBD/TODO; all steps have full code or exact commands.
- **Type consistency:** `BulkMarkResult`/`BulkMarkStatus` in the frontend match the `status` literals (`marked` / `already_test_account` / `not_found`) and field names (`email`, `status`, `id`, `name`) returned by the backend's `bulkMarkTestAccounts` (Task 1) and the `BulkMarkResultItem` schema (Task 2).
