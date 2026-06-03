/* ===========================================================
   page.jsx — Lesson composition + mount
   Lays out the lesson: hero → refresher → 3 scenarios → compare
   → takeaway → footer. Mounts into <div id="app">.
   =========================================================== */

function SectionHead({ num, step, title, color, children }) {
  return (
    <div className="section-head">
      <div className="step-chip">
        <span className="step-num" style={color ? { background: color } : null}>{num}</span>
        <span className="step-text">{step}</span>
      </div>
      {title && <h2>{title}</h2>}
      {children && <p>{children}</p>}
    </div>
  );
}

function Callout({ tag, color, children }) {
  return (
    <div className="callout" style={{ '--c': color }}>
      {tag && <span className="tag">{tag}</span>}
      {children}
    </div>
  );
}

/* Paired-verdict card: shows how 2PC and Saga each handle one failure mode.
   `tpc` and `saga` are { verdict: 'bad'|'warn'|'ok'|'na', text: jsx }. */
function EdgeCase({ category, title, tpc, saga }) {
  const verdictLabel = {
    bad:  'Breaks down',
    warn: 'Has a cost',
    ok:   'Handles it',
    na:   'Not applicable',
  };
  const catLabel = {
    failure:       'Failure',
    performance:   'Performance',
    consistency:   'Consistency',
    'saga-gotcha': 'Saga gotcha',
  };
  return (
    <div className="edge">
      <div className="edge-head">
        <span className="ec-cat" data-cat={category}>{catLabel[category] || category}</span>
        <h4>{title}</h4>
      </div>
      <div className="edge-body">
        <div className="edge-side">
          <div className="who">
            Two-Phase Commit
            <span className="verdict" data-v={tpc.verdict}>{verdictLabel[tpc.verdict]}</span>
          </div>
          <p>{tpc.text}</p>
        </div>
        <div className="edge-side">
          <div className="who">
            Saga
            <span className="verdict" data-v={saga.verdict}>{verdictLabel[saga.verdict]}</span>
          </div>
          <p>{saga.text}</p>
        </div>
      </div>
    </div>
  );
}

function Lesson() {
  return (
    <main>
      {/* hero */}
      <section className="lesson-hero">
        <div className="wrap">
          <span className="kicker"><span className="num">01</span> Distributed Systems · Lesson 01</span>
          <h1>Distributed Transactions</h1>
          <p className="lede">
            On one database, "all-or-nothing" is free — you just <span className="mono">BEGIN</span> and <span className="mono">COMMIT</span>.
            Spread that same operation across many services and the guarantee evaporates. Here’s why, and the two classic ways to get it back.
          </p>
          <div className="toc">
            <a href="#need"           className="chip">Do you need it?</a>
            <a href="#problem"        className="chip">The problem</a>
            <a href="#twophase"       className="chip">Two-Phase Commit</a>
            <a href="#saga"           className="chip">Sagas</a>
            <a href="#outbox"         className="chip">Outbox</a>
            <a href="#edges"          className="chip">Edge cases</a>
            <a href="#distributed-db" className="chip">Distributed DBs</a>
            <a href="#compare"        className="chip">Which to use</a>
          </div>
        </div>
      </section>

      {/* recap */}
      <section className="section">
        <div className="wrap">
          <Callout tag="Refresher · ACID on one database" color="var(--green)">
            A normal transaction is <b>atomic</b> — every write inside it lands together or not at all. The database
            holds locks, and a single <b>COMMIT</b> (or <b>ROLLBACK</b>) decides the fate of everything at once. That trick
            depends on one engine controlling all the data. <b>Split the data across services and no single engine is in charge anymore.</b>
          </Callout>
        </div>
      </section>

      {/* 1. do you need it? */}
      <section className="section" id="need">
        <div className="wrap">
          <SectionHead num="1" step="Do you even need a distributed transaction?" color="var(--green)" title="The fastest path is the one you don’t take.">
            Before anything else: every distributed transaction is a tax. If you can avoid the tax, do.
          </SectionHead>
          <div className="preamble">
            <p>
              Distributed transactions are <em>hard</em>. They cost engineering time, runtime complexity, debugging pain, and a perpetual risk of subtle inconsistency bugs. Before reaching for 2PC or sagas, ask one question first:
            </p>
            <p>
              <b>Can the data this operation needs live in the same database?</b>
            </p>
            <p>
              If yes — co-locate it. A single ACID transaction over Postgres handles "all-or-nothing" trivially and costs you nothing. The orders table, the payments table, the inventory table, the ledger — there is no law of nature that says they must live in separate databases. Independent <em>services</em> can share a database; "microservices" does not mean "micro-databases."
            </p>
            <p>
              You actually need a distributed transaction when:
            </p>
            <ul>
              <li>Data lives in genuinely different storage systems (Postgres + DynamoDB + Elasticsearch, etc.)</li>
              <li>The data is owned by separate organizations or teams with different operational responsibilities</li>
              <li>You have already sharded so heavily that consistent reads across shards aren't possible</li>
              <li>Compliance or regulatory boundaries require physical separation</li>
            </ul>
            <p>
              Even then, the next question is whether you need <em>strong</em> consistency (atomic across stores), or <em>eventual</em> consistency (the system will converge over a brief window). The former pushes you toward a distributed database (see <a href="#distributed-db">§ 7</a>). The latter is what sagas are for (<a href="#saga">§ 4</a>).
            </p>
          </div>
          <Callout tag="The order of preference" color="var(--green)">
            <b>1.</b> Co-locate the data — single-DB ACID. Always try this first.<br/>
            <b>2.</b> Distributed database (Spanner / CockroachDB / YugabyteDB) — if you genuinely need strong cross-store consistency.<br/>
            <b>3.</b> Saga + transactional outbox — if eventual consistency is acceptable.<br/>
            <b>4.</b> Hand-rolled 2PC across services — <em>never</em>.
          </Callout>
        </div>
      </section>

      {/* 2. problem */}
      <section className="section" id="problem">
        <div className="wrap">
          <SectionHead num="2" step="The problem" color="var(--coral)" title="A commit you can’t take back">
            Two common ways to sequence the work across services. Both fail.
          </SectionHead>

          <div className="preamble">
            <p>
              A customer clicks <b>Place Order</b>. The request needs to touch three independent services — <b>Orders</b>, <b>Payment</b>, <b>Inventory</b> — each owning its own database.
            </p>
            <p>
              <em>There is no coordinator and no orchestrator here.</em> Some application code (a request handler, or one service calling the next) walks through the calls. The interesting question is: <b>when does each service actually commit its local transaction?</b> Two common patterns, two distinct ways to fail. Both leave the system inconsistent.
            </p>
          </div>

          <Callout tag="Pattern A · Commit, then call" color="var(--coral)">
            Each service writes to its DB and <b>commits its local transaction</b>, then calls the next service. No waiting — the commit happens first, the next call happens second.
            {' '}<em>The failure mode:</em> if the LAST service fails, every step before it has already committed and there is no clean way to undo that work.
          </Callout>
          <ProblemCommitThenCall />

          <Callout tag="Pattern B · Call, then commit" color="var(--warn)">
            Each service does its work tentatively and <b>holds its commit until the next service returns success</b>. The intuition: only commit if downstream worked.
            {' '}<em>The failure mode:</em> the DEEPEST service commits first (it has nothing downstream to wait on). If a MIDDLE service then fails before it can commit, the deepest service&rsquo;s work is stranded.
          </Callout>
          <ProblemCallThenCommit />

          <Callout tag="The root cause" color="var(--ink)">
            Two patterns, two failure shapes, <b>one root cause</b>: once a service has committed locally, no outside party can roll it back. Both 2PC and Saga exist to solve exactly this — in different ways.
          </Callout>
        </div>
      </section>

      {/* 3. 2PC */}
      <section className="section" id="twophase">
        <div className="wrap">
          <SectionHead num="3" step="Approach A — Two-Phase Commit (2PC)" color="var(--blue)" title="Ask everyone first, then commit together">
            The textbook fix for strong consistency: run a vote before anyone commits for real.
          </SectionHead>
          <div className="preamble">
            <p>
              A dedicated <b>coordinator</b> drives the whole transaction. <em>Phase 1 — Prepare:</em> it asks every participant to do the work tentatively, write a redo log, <b>lock the affected rows</b>, and vote yes or no. <em>Phase 2 — Commit:</em> if every vote is YES, the coordinator broadcasts COMMIT and everyone releases their locks. If any vote is NO, it broadcasts ABORT and everyone discards their tentative work.
            </p>
            <p>
              The happy path gives you <b>strong, atomic consistency</b> across services — the same all-or-nothing guarantee a single database offers. The two failure tracks below show what happens when a participant votes NO (clean rollback) and when the coordinator crashes between phase 1 and phase 2 (participants stuck holding locks indefinitely).
            </p>
          </div>
          <TwoPhaseScenario />
          <Callout tag="When it fits" color="var(--blue)">
            2PC gives you <b>immediate, strong consistency</b> and is common inside databases (XA transactions).
            The price: it holds <b>locks</b> across the network and <b>blocks</b> if the coordinator dies — so it scales poorly across many independent services.
          </Callout>
        </div>
      </section>

      {/* 4. saga */}
      <section className="section" id="saga">
        <div className="wrap">
          <SectionHead num="4" step="Approach B — Sagas" color="var(--violet)" title="Commit as you go, undo if you must">
            Drop the global lock entirely. Each step commits locally; if a later step fails, you walk it back with compensations.
          </SectionHead>
          <div className="preamble">
            <p>
              An <b>orchestrator</b> calls each service in order. Each service runs a local transaction and <b>commits immediately</b> — no waiting on votes, no locks held across services. If a later step fails, the orchestrator walks back through every committed step and runs a <em>compensating transaction</em> for each one. Compensations are business-level undos: a refund undoes a charge, a cancel undoes an order.
            </p>
            <p>
              The happy path: each step commits locally and the chain finishes; the system reaches consistency by moving forward, not by locking. The failure track: Inventory fails after Orders and Payment have already committed, so the orchestrator triggers a <b>refund</b>, then <b>cancels the order</b> — undoing each committed step in reverse until the system is consistent again.
            </p>
          </div>
          <SagaScenario />
          <Callout tag="Two saga flavors · choreography vs orchestration" color="var(--violet)">
            <b>Choreography (decentralized)</b> — each service emits an event when it finishes its step; other services subscribe and react. Failure events propagate back to trigger compensations. No central driver. Easy to start; gets hard to trace and debug as the flow grows. Fits flows with ~3 steps and few teams.
            <br/><br/>
            <b>Orchestration (centralized)</b> — a dedicated orchestrator service calls each step explicitly, tracks the saga's state, and triggers compensations on failure. One place owns the logic. Easier visibility, easier recovery. Industry default at scale; tooling: <b>Temporal</b> (from Uber's Cadence team), <b>AWS Step Functions</b>.
            <br/><br/>
            The diagram above shows <em>orchestration</em> — that's how production sagas at Uber, Netflix, Amazon, and DoorDash run.
          </Callout>
          <Callout tag="In production · queue + worker" color="var(--coral)">
            The compensations above are drawn as direct orchestrator-to-service arrows to keep the <em>pattern</em> clear. In real systems they almost always go through a <b>message queue</b> with a <b>worker</b> consumer: the orchestrator publishes the compensation as a message and moves on; a worker pulls it, calls the service with an idempotency key, and acks on success. That hand-off is what gives saga compensations their retry and idempotency story.
            {' '}<b>See <a href="#edges">§ 6 Edge cases · Compensation retry</a></b> for the production shape with redelivery and a failing Refund API, and <a href="#outbox">§ 5 Outbox</a> for how the orchestrator gets the message into the queue in the first place.
          </Callout>
          <Callout tag="When it fits" color="var(--violet)">
            Sagas trade strict isolation for <b>availability and scale</b> — the standard choice for long-running, cross-service workflows
            (microservices, e-commerce checkout, travel booking). The price: <b>eventual consistency</b> and the work of designing a compensating action for every step.
          </Callout>
        </div>
      </section>

      {/* 5. outbox */}
      <section className="section" id="outbox">
        <div className="wrap">
          <SectionHead num="5" step="The dual-write problem &amp; transactional outbox" color="var(--coral)" title="How does the message get into the queue in the first place?">
            The queue solved compensation retries. But it quietly created a new atomicity problem of its own.
          </SectionHead>
          <div className="preamble">
            <p>
              Look back at the queue-based compensation flow. The orchestrator <em>publishes a message</em> to the queue and moves on. Sounds simple — but the orchestrator is now doing <b>two writes</b>:
            </p>
            <ol>
              <li>Update its own state DB ("step 3 failed, compensation scheduled")</li>
              <li>Publish the compensation message to the queue</li>
            </ol>
            <p>
              These are two writes to two different systems. If write 1 succeeds but write 2 fails, the orchestrator's DB says "compensation in progress" but the queue is empty. The compensation never runs. If write 2 succeeds but write 1 fails, even worse: a message goes out for work the orchestrator doesn't remember scheduling.
            </p>
            <p>
              This is the <b>dual-write problem</b>. It is the <em>same</em> atomicity puzzle we started the lesson with — we just shifted it from the business operation to the messaging plumbing.
            </p>
            <p>
              Fix: the <b>transactional outbox pattern</b>.
            </p>
            <ol>
              <li>The orchestrator's DB has a dedicated <code>outbox_events</code> table</li>
              <li>When the orchestrator wants to publish a message, it writes the event row to the outbox table in the <em>same local transaction</em> as its state update. One ACID transaction — atomic by construction</li>
              <li>A separate <b>relay</b> process reads new outbox rows and publishes them to the queue</li>
              <li>The relay marks each row as published once delivery is confirmed (or just deletes it)</li>
            </ol>
            <p>
              Because the outbox row commits with the state update, the event is durable the moment the state change is durable. The actual publish step happens later, can be retried freely, and the row's unique ID doubles as a natural idempotency key.
            </p>
            <p>
              Two ways the relay reads from the outbox:
            </p>
            <ul>
              <li><b>CDC (Change Data Capture)</b> — the relay tails the database's transaction log and sees the new row as soon as it commits. Low latency. Tools: <b>Debezium</b>, <b>AWS DMS</b>, native CDC in Postgres / MySQL / others.</li>
              <li><b>Polling</b> — the relay queries the outbox table on an interval. Simpler to operate, higher latency, adds DB load. Fine for low-throughput systems.</li>
            </ul>
            <p>
              The pattern is everywhere once you start looking: not just orchestrator state, but anywhere a service needs to change its data <em>and</em> tell the world about it. Event-sourced systems, Kafka producers, change feeds — same shape underneath.
            </p>
          </div>
          <Callout tag="Why this works" color="var(--coral)">
            One ACID transaction is the only thing we trust. The outbox makes "decide" and "announce" into a single transactional act inside that one trusted boundary. Everything downstream — the relay, the queue, the worker — can fail, retry, restart, and the announcement is never lost or duplicated relative to the decision.
          </Callout>
        </div>
      </section>

      {/* 6. edge cases */}
      <section className="section" id="edges">
        <div className="wrap">
          <SectionHead num="6" step="Edge cases & failures" color="var(--warn)" title="When each one bites you">
            Both patterns work on the happy path. The differences show up at the edges — when something crashes, lags, or has to be undone. Below: five common failure modes and how each pattern handles (or fails to handle) them.
          </SectionHead>

          <Callout tag="The consistency trade-off, made concrete" color="var(--ink)">
            <b>Two-Phase Commit</b> chooses <b>strong consistency</b> — every observer sees a single atomic outcome, but the system has to <em>block</em> to maintain that guarantee.
            {' '}<b>Saga</b> chooses <b>eventual consistency</b> — work commits as it goes, observers may see a brief in-between state, but the system never blocks.
            Most of the edges below are a direct consequence of that single choice.
          </Callout>

          <div className="preamble">
            <p>
              Three failure tracks below, switchable from the tabs at the top of the player:
            </p>
            <p>
              <b>Coordinator crash</b> — split-screen 2PC vs Saga. Both drivers die at the same moment, mid-flight. 2PC participants freeze holding locks; Saga services keep their committed work and the orchestrator restarts from durable state.
              {' '}<b>Slow participant</b> — split-screen. One service drags. 2PC holds locks across every concurrent transaction; Saga only delays the slow step itself.
              {' '}<b>Compensation retry · direct</b> — Saga only. The simpler shape: the orchestrator calls the Refund API itself and retries in-process when it fails. Easier to grasp; rarely how production builds it.
              {' '}<b>Compensation retry · with queue</b> — Saga only. The orchestrator hands the refund off to a <em>compensation queue</em>; a worker pulls it, calls the API, fails on a 503, the queue redelivers, and an idempotency key keeps the customer from being refunded twice. <em>The production shape.</em>
            </p>
          </div>

          <EdgesScenario />

          <div className="edge-list">
            <EdgeCase
              category="failure"
              title="Coordinator crashes mid-decision"
              tpc={{
                verdict: 'bad',
                text: <>The coordinator collects all votes and then dies <em>before</em> broadcasting commit. Participants are stuck — they don’t know whether to commit or abort, and they cannot safely decide on their own. <b>Locks stay held</b>; concurrent transactions on those rows wait until an operator intervenes or runs a heuristic recovery.</>,
              }}
              saga={{
                verdict: 'ok',
                text: <>The orchestrator persists its state durably (its own DB, or a workflow runtime like <b>Temporal</b>). On restart it <b>resumes from where it left off</b>. No locks were held on its behalf, so unrelated work kept moving the whole time it was down.</>,
              }}
            />

            <EdgeCase
              category="performance"
              title="One participant is slow"
              tpc={{
                verdict: 'bad',
                text: <>Locks are held all the way through <em>prepare</em>. The slowest participant sets the pace for the entire transaction <b>and</b> for every unrelated transaction that touches the same rows. One sluggish service can collapse throughput across the system.</>,
              }}
              saga={{
                verdict: 'ok',
                text: <>Each step commits and releases its lock immediately. A slow service delays only its own step; everything earlier is already final, everything later just queues. <b>Lock duration is local</b>, not global.</>,
              }}
            />

            <EdgeCase
              category="saga-gotcha"
              title="A compensation itself fails"
              tpc={{
                verdict: 'na',
                text: <>There’s nothing to compensate. Failure during prepare means each participant discards its tentative work and releases locks — recovery is built into the protocol.</>,
              }}
              saga={{
                verdict: 'warn',
                text: <>The refund API is down right when you need it. The order is cancelled but the customer’s card is still charged. You need <b>retry-with-backoff</b> plus <b>idempotency keys</b> (so retries don’t double-refund). Compensations are first-class engineering work, not an afterthought.</>,
              }}
            />

            <EdgeCase
              category="consistency"
              title="Another query reads mid-flight state"
              tpc={{
                verdict: 'ok',
                text: <>Locks prevent any other reader from seeing the half-done state. Either everything happened or nothing did, from any outside view. <b>Strong consistency by construction.</b></>,
              }}
              saga={{
                verdict: 'warn',
                text: <>Between step 2 and step 3, a separate query can see a charged payment with no reserved inventory. This is the <b>eventual-consistency window</b>. The system will converge, but every reader has to tolerate that brief inconsistency (or be designed to ignore it).</>,
              }}
            />

            <EdgeCase
              category="saga-gotcha"
              title="An external action can’t be undone"
              tpc={{
                verdict: 'na',
                text: <>Nothing externally visible happens until everyone has voted. The protocol naturally defers irreversible side effects — but only because it refuses to start them across services in the first place.</>,
              }}
              saga={{
                verdict: 'warn',
                text: <>The confirmation email already went out. The shipping label already printed. Compensation can issue store credit and send a "we’re sorry" mail, but the original action can’t be physically reversed. Best practice: put irreversible steps <b>last</b> in the chain, or wrap them in a <em>reserve-then-confirm</em> pattern.</>,
              }}
            />
          </div>
        </div>
      </section>

      {/* 7. distributed databases */}
      <section className="section" id="distributed-db">
        <div className="wrap">
          <SectionHead num="7" step="Distributed databases — letting the DB do 2PC for you" color="var(--green)" title="If you truly need strong consistency, don’t roll your own.">
            There is a third option that the lesson has been hinting at: use a database that already solves this.
          </SectionHead>
          <div className="preamble">
            <p>
              Sometimes you genuinely need atomic transactions across data that would otherwise live in many service databases, and a saga's eventual-consistency window is too loose. The right answer there is rarely "build 2PC across HTTP services" — it's "use a database that already implements 2PC internally."
            </p>
            <p>
              A <b>distributed database</b> looks like a single Postgres or MySQL from your application code, but underneath it's a cluster of nodes (often across regions) coordinating with each other. Internally, the DB does:
            </p>
            <ul>
              <li><b>Sharding</b> by key range across nodes → horizontal write scale</li>
              <li><b>Replication</b> within each shard via consensus (<b>Paxos</b> / <b>Raft</b>) → survive node failures without data loss</li>
              <li><b>Internal 2PC</b> for transactions that span multiple shards → atomic writes across the whole cluster</li>
            </ul>
            <p>
              The key insight: <b>the coordinator and participants in this 2PC are all components of the same DB system, on the same trust boundary.</b> Tight clock coupling, well-understood failure modes, recovery procedures the DB authors have already debugged. None of the "across HTTP services, across teams, across deploy schedules" problems apply.
            </p>
            <p>
              The headliners:
            </p>
            <ul>
              <li><b>Google Spanner</b> — uses GPS + atomic clocks (<em>TrueTime</em>) to bound clock uncertainty, then orders transactions across geographic regions deterministically. The original, mostly Google-only until they offered it as a managed service.</li>
              <li><b>CockroachDB</b> — open-source, PostgreSQL-compatible, uses Raft for replication and hybrid logical clocks. The most accessible "Spanner-clone" you can self-host.</li>
              <li><b>YugabyteDB</b> — similar idea, also PostgreSQL-compatible. Sharded by key range with Raft replication.</li>
              <li><b>TiDB</b> — MySQL-compatible, separated SQL + KV storage layer (TiKV underneath).</li>
            </ul>
            <p>
              Trade-offs:
            </p>
            <ul>
              <li>More expensive than a single DB — more nodes, more operational complexity, more concepts to learn</li>
              <li>Cross-shard transactions pay a latency penalty (network round-trips for the internal 2PC)</li>
              <li>Schema design constraints (key choice matters more — bad keys cause cross-shard transactions)</li>
              <li>Not a magic bullet — if a single Postgres still fits, prefer that</li>
            </ul>
          </div>
          <Callout tag="When to reach for one" color="var(--green)">
            <b>Use a distributed DB</b> if you need strong consistency across what would otherwise be many service databases, and you have already accepted that a single DB will not fit. <b>Don't reach for one</b> if a vanilla Postgres handles your load — the operational cost is real. <b>Don't reach for one</b> just because the architecture diagram has multiple services — that's what eventually-consistent sagas are for.
          </Callout>
        </div>
      </section>

      {/* 8. compare */}
      <section className="section" id="compare">
        <div className="wrap">
          <SectionHead num="8" step="Which one?" color="var(--ink)" title="Same goal, opposite bets">
            Both keep the system consistent. They just disagree about <i>when</i>.
          </SectionHead>
          <div className="compare">
            <div className="cmp-card tpc">
              <h3>Two-Phase Commit</h3>
              <div className="sub">// lock first, commit together</div>
              <div className="consistency">
                <span className="lbl">Consistency:</span>
                <span className="val">Strong · immediate</span>
              </div>
              <ul>
                <li><span className="ic up">✓</span><span>Atomic across services — observers never see a half-done state</span></li>
                <li><span className="ic up">✓</span><span>Simple mental model: one vote, one outcome</span></li>
                <li><span className="ic dn">✕</span><span>Holds locks across the network for the duration of both phases</span></li>
                <li><span className="ic dn">✕</span><span>Coordinator crash → participants block holding locks</span></li>
                <li><span className="ic dn">✕</span><span>Slow participant slows every concurrent transaction</span></li>
                <li><span className="ic dn">✕</span><span>Scales poorly past a few services</span></li>
              </ul>
            </div>
            <div className="cmp-card saga">
              <h3>Saga</h3>
              <div className="sub">// commit as you go, compensate on failure</div>
              <div className="consistency">
                <span className="lbl">Consistency:</span>
                <span className="val">Eventual · converges</span>
              </div>
              <ul>
                <li><span className="ic up">✓</span><span>No global locks — each step releases immediately</span></li>
                <li><span className="ic up">✓</span><span>No single blocking coordinator — orchestrator restarts safely</span></li>
                <li><span className="ic up">✓</span><span>Built for long, cross-service workflows</span></li>
                <li><span className="ic dn">✕</span><span>Observers can see a brief in-between state</span></li>
                <li><span className="ic dn">✕</span><span>You must design (and test) a compensating action for every step</span></li>
                <li><span className="ic dn">✕</span><span>Compensations need retry + idempotency to be safe</span></li>
              </ul>
            </div>
          </div>

          <div className="takeaway">
            <h3>The one-line takeaway</h3>
            <p>
              Once data lives in many services, free atomicity is gone. <b>2PC keeps strong consistency by locking the world and voting</b> — atomic, but blocking and fragile.
              <b> Sagas accept eventual consistency by committing locally and compensating on failure</b> — non-blocking and scalable, but with a brief window where the system is mid-flight.
              Pick based on how long the operation runs and whether your observers can tolerate that window.
            </p>
            <div className="pillrow">
              <span className="p">short + must-be-exact → 2PC</span>
              <span className="p">long + cross-service → Saga</span>
              <span className="p">avoid dual writes → Outbox + events</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="foot wrap">
        <span>Personal Learning Repo · Distributed Systems / 01</span>
        <a href="../../" style={{ color: 'inherit' }}>← back to the tree</a>
      </footer>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(<Lesson />);
