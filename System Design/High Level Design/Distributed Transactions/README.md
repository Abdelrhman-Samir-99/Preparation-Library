# Distributed Transactions

When data lives in a single database, ACID makes "all-or-nothing" easy — wrap the work in one transaction and the DB guarantees atomicity and isolation. When data spreads across shards or microservices, there's no global coordinator, so a single logical operation now spans separate local transactions. That's a *distributed transaction*, and it needs a deliberate strategy for "all commit, or clean up on failure."

This folder contains short notes and a set of interactive diagrams that you can open in a browser to operate the mechanisms yourself.

## Two-phase commit (2PC)

A coordinator drives consensus across participants:
+ **Phase 1 — prepare:** coordinator asks every participant "can you commit?" Each does the work, durably records changes, **locks rows**, and votes yes/no.
+ **Phase 2 — commit:** if all vote yes, coordinator tells everyone to commit and release locks; if any votes no, everyone aborts.

Strong consistency, but **blocking**:
+ If the coordinator crashes after collecting votes but before sending the decision, participants are stuck holding locks — they cannot safely commit or abort on their own.
+ Held locks block other transactions; the system can stall.
+ A slow participant delays everyone, since locks are held through prepare.
+ Network partitions can't be handled gracefully.

2PC survives mainly *inside* distributed databases that tightly couple coordinator and participants (Google Spanner, CockroachDB, YugabyteDB). Across independent services it's impractical — see Pat Helland, *Life Beyond Distributed Transactions*. **Don't build 2PC across services yourself.**

## Saga pattern

Drop the all-or-nothing requirement; accept **eventual consistency**. A saga is a chain of local transactions, each committing to its own database. If a later step fails, run **compensating actions** to undo earlier completed steps — business-level undos like refund and cancel, not DB rollbacks. Because each step commits and releases immediately, **no locks are held across services**.

Two coordination styles:
+ **Choreography (decentralized):** services emit events when they finish a step; others subscribe and react. Fine for simple flows (≲ 5 steps); gets hard to track and debug as flows grow.
+ **Orchestration (centralized):** a dedicated orchestrator service directs each step, waits for confirmation, and triggers compensations. Better visibility and control for complex flows. Tooling: Temporal (Uber's Cadence team), AWS Step Functions.

**Saga crash behavior** — the contrast with 2PC: the orchestrator stores state durably, so on restart it resumes exactly where it left off. No locks are held indefinitely, so other transactions are never blocked. Sagas trade the blocking problem for **compensation complexity**.

Hard parts of compensation:
+ Compensations are *visible* business operations — a customer sees a charge, then a refund. Some actions are effectively irreversible (a sent email can't be unsent).
+ Compensations can themselves fail → need **retry logic with idempotency** so you don't double-refund.

## Dual-write problem + transactional outbox

After a local transaction, a service must publish an event for the next step. That's two separate writes (database + message broker); if one succeeds and the other fails, the saga stalls or goes inconsistent.

Fix with the **transactional outbox pattern**:
1. In one local DB transaction, write both the business data **and** the event into an `outbox` table.
2. A background process reads the outbox and publishes events to the broker — via **Change Data Capture** (tailing the transaction log) or **polling** the table on an interval.

This makes the write and the event atomic.

## Decision guidance

1. First ask: *do you even need a distributed transaction?* If the data can be co-located in one database, do that — simpler, faster, more reliable.
2. If unavoidable, use a Saga: choreography for simple flows, orchestration for complex/large-scale ones.
3. If you truly need strong cross-store consistency, reach for a distributed database (Spanner, CockroachDB, YugabyteDB) that handles 2PC internally rather than rolling your own.

## Interactive diagrams

Open [`diagrams/index.html`](./diagrams/index.html) in a browser, or jump directly:

+ [`01-saga-order-flow.html`](./diagrams/01-saga-order-flow.html) — step through a 3-service saga, inject a failure at any step, watch compensations fire in reverse.
+ [`02-2pc-vs-saga-crash.html`](./diagrams/02-2pc-vs-saga-crash.html) — crash the coordinator mid-flight and compare blast radius: 2PC freezes with locks held, Saga keeps moving.
+ [`03-transactional-outbox.html`](./diagrams/03-transactional-outbox.html) — toggle naive dual-write vs outbox; inject a failure between writes to see the inconsistency, then watch the outbox relay (CDC vs polling) make it atomic.
+ [`04-choreography-vs-orchestration.html`](./diagrams/04-choreography-vs-orchestration.html) — toggle coordination styles for the same saga, add steps, watch choreography's complexity grow faster than orchestration's.
+ [`05-do-you-need-a-distributed-transaction.html`](./diagrams/05-do-you-need-a-distributed-transaction.html) — decision tree from "co-locate the data" through "use a distributed database" with a one-line rationale per leaf.
