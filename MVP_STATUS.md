# OutboundOS MVP status

## Working now

- First-run onboarding persists workspace and ideal-customer settings.
- Campaigns, prospects, inbox threads, and sequence steps persist in browser storage.
- Campaign creation assigns available prospects and opens the created campaign.
- Prospect filtering, sorting, selection, CSV export, and detail inspection work locally.
- Inbox replies update the visible thread and persist locally.
- Sequence steps can be added, edited, toggled, and persisted.
- Campaign status and prospect status changes update the local application state.

## Not connected yet

- Authentication and multi-tenant workspace isolation.
- Database persistence and migrations.
- Server-side research and Gemini integration.
- Company discovery, contact verification, and email validation providers.
- Gmail or Microsoft OAuth and real email sending.
- Background jobs, scheduled follow-ups, bounce handling, and unsubscribe suppression.
- Real reply synchronization and analytics aggregation.

## Required before production sending

1. Add a server-side database and authenticated workspace ownership.
2. Add provider-backed discovery, research, verification, and AI services.
3. Add mailbox OAuth with encrypted token storage.
4. Add idempotent send records, rate limits, sending windows, bounce handling, and suppression lists.
5. Add background workers for research, inbox sync, scheduled sends, and analytics.
6. Run typecheck, build, accessibility checks, and end-to-end tests in CI.

The current product intentionally keeps sending locked until a real mailbox is connected and the audience is reviewed.
