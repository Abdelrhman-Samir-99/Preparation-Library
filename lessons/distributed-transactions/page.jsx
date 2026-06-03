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
            <a href="#problem"  className="chip">① The problem</a>
            <a href="#twophase" className="chip">② Two-Phase Commit</a>
            <a href="#saga"     className="chip">③ Sagas</a>
            <a href="#edges"    className="chip">④ Edge cases</a>
            <a href="#compare"  className="chip">⑤ Which to use</a>
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

      {/* 1. problem */}
      <section className="section" id="problem">
        <div className="wrap">
          <SectionHead num="1" step="The problem" color="var(--coral)" title="A commit you can’t take back">
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

      {/* 2. 2PC */}
      <section className="section" id="twophase">
        <div className="wrap">
          <SectionHead num="2" step="Approach A — Two-Phase Commit (2PC)" color="var(--blue)" title="Ask everyone first, then commit together">
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

      {/* 3. saga */}
      <section className="section" id="saga">
        <div className="wrap">
          <SectionHead num="3" step="Approach B — Sagas" color="var(--violet)" title="Commit as you go, undo if you must">
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
          <Callout tag="When it fits" color="var(--violet)">
            Sagas trade strict isolation for <b>availability and scale</b> — the standard choice for long-running, cross-service workflows
            (microservices, e-commerce checkout, travel booking). The price: <b>eventual consistency</b> and the work of designing a compensating action for every step.
          </Callout>
        </div>
      </section>

      {/* 4. edge cases */}
      <section className="section" id="edges">
        <div className="wrap">
          <SectionHead num="4" step="Edge cases & failures" color="var(--warn)" title="When each one bites you">
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
              {' '}<b>Compensation retry</b> — Saga only. The refund API is down at the worst moment; idempotency keys let us safely retry until it succeeds.
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

      {/* 5. compare */}
      <section className="section" id="compare">
        <div className="wrap">
          <SectionHead num="5" step="Which one?" color="var(--ink)" title="Same goal, opposite bets">
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
