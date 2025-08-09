

# Onbo: API Assistant – Quick Reference

A one‑pager to ask great, **source‑grounded** questions and get tight, cite‑back answers across your uploaded docs (G2RS MDMX, Monitoring/PMM_TLD, ZignSec Mobile SDK, plus any future PDFs/TXT).

---

## How to ask (fastest patterns)

- **Locate facts + page**:  
  *“List the exact required fields for merchant creation. Quote and cite page(s).”*
- **Compare/contrast**:  
  *“Compare Monitoring vs MDMX rate limits and timeouts with page numbers.”*
- **Procedure step‑by‑step**:  
  *“Walk the end‑to‑end flow from liveness to final decision using backend only. Cite pages.”*
- **Endpoint + headers**:  
  *“Show the POST for ZignSec session creation with required headers and expected success code. Quote & page.”*
- **Error behavior**:  
  *“Show the exact error JSON for webhook failures (if documented). Quote & page.”*

Tips
- Prefer **one tight question** over many. If you need bullets or a table, say so.
- Add *“Quote exact line with page n.”* to force verbatim snippets.
- If an answer says *“not specified”*, ask for **closest related** spec or example.

---

## High‑value queries you can paste

### MDMX (Merchant Data Management API)
1. *“List the exact required fields for merchant creation and where they first appear. Quote + page.”*
2. *“Which fields are optional vs required for merchant creation? Show as two lists with page cites.”*
3. *“If a principal’s name changes, what `dataUpdateAction` values are valid and what do they mean? Quote + page.”*
4. *“All rate limits / timeouts mentioned for MDMX. Quote each item + page.”*

### Monitoring / PMM_TLD (Webhooks / Notifications)
5. *“What does the webhook return on success vs error? Include JSON examples if present. Quote + page.”*
6. *“What token is issued during onboarding, where is it used, and how long until expiry? Quote + page.”*

### ZignSec ID & Bio Verification Mobile SDK
7. *“Document + biometry recommended flow: enumerate steps only, backend zero‑trust. Cite pages.”*
8. *“Passive vs Active liveness: differences, when to use each. Quote + page.”*
9. *“`FullProcess` vs `FullAuth` – what’s added by FullAuth? Quote + page.”*
10. *“Create session, add liveness/doc transactions, expected HTTP status codes, and required headers. Quote + page.”*

---

## Answer styles (pick one)

- **Bulleted facts + cites** – best for field lists, limits, headers.  
- **Mini‑procedure (numbered)** – best for flows.  
- **2‑column table** – best for comparisons (e.g., MDMX vs Monitoring).  
- **Code block** – for JSON payloads/endpoints.

> Always end with a short **Notes** line if something is *not specified* and you provided the closest available detail.

---

## Tricky phrasing to watch for

- *“Must/required vs optional”* – ensure you separate and **cite**.
- *“Production vs test”* – return **environment base URLs** explicitly.
- *Pagination* – if not documented, say so and cite the section where limits/timeouts are discussed instead.
- *Retries on 401/403 (ZignSec)* – recommend retry with a **different product key** as documented.

---

## Reusable snippets (ready to copy)

### ZignSec – Session creation (TEST)
```http
POST https://test-gateway.zignsec.com/mobilesdk/sessions
Headers:
  Authorization: Bearer <jwt>
  Zs-Product-Key: <subscription-key>
```
*Success:* `204 No Content` when attaching transactions; session creation returns a JSON body with `id` (sessionId). *(See SDK pages ~12–16.)*

### ZignSec – Attach liveness transaction
```http
POST https://test-gateway.zignsec.com/mobilesdk/sessions/{sessionId}/liveness/transactions/{transactionId}
Headers:
  Authorization: Bearer <jwt>
  Zs-Product-Key: <subscription-key>
```
*Success:* `204 No Content`.

### ZignSec – Environments
- **PROD** `https://gateway.zignsec.com`
- **TEST** `https://test-gateway.zignsec.com`
Base paths:
- Face API: `$(baseURL)/mobilesdk/faceapi`
- DocReader: `$(baseURL)/mobilesdk/docreader`
- OIDC discovery: `$(baseURL)/auth/realms/zignsec/.well-known/openid-configuration`

### Monitoring / PMM_TLD – Webhook note
If JSON error bodies are *not specified*, state: *“Exact error JSON not documented; only status codes/examples referenced.”* Cite the page that says to consult Swagger/examples.

### MDMX – Merchant creation (fields)
Ask: *“List the **exact** required fields for merchant creation and quote the request body example with page.”*
Return two lists: **Required** and **Optional**, then a small JSON excerpt.

---

## Quality checklist before you click Enter
- [ ] Ask for **quotes + page numbers** when you need literal text.
- [ ] If the tool says *index rebuilt* or *HyDE not available*, proceed; retrieval is vector‑only but tuned.
- [ ] If an answer seems thin, immediately follow with a **narrower** question.

---

## Maintenance (for us)
- Add new PDFs/TXT to `docs/` and re‑index from the UI.
- Keep `dev_hints` in `.env` set to `on` to enable concise mode & better highlighting.
- For long‑running sessions, prefer smaller, single‑intent questions to keep the query log useful.
