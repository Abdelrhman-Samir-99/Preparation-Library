/* ===========================================================
   page.jsx — Lesson composition + mount
   Lays out the lesson: hero → refresher → 3 scenarios → compare
   → takeaway → footer. Mounts into <div id="app">.
   =========================================================== */

function SectionHead({ step, title, children }) {
  return (
    <div className="section-head">
      <span className="step-chip">{step}</span>
      <h2>{title}</h2>
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
            <a href="#compare"  className="chip">④ Which to use</a>
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
          <SectionHead step="① The problem" title="A commit you can’t take back">
            Watch a single "Place Order" fan out across three services. Step through it — the failure at the end has no clean undo.
          </SectionHead>
          <ProblemScenario />
        </div>
      </section>

      {/* 2. 2PC */}
      <section className="section" id="twophase">
        <div className="wrap">
          <SectionHead step="② Approach A — Two-Phase Commit (2PC)" title="Ask everyone first, then commit together">
            The textbook fix for strong consistency: a coordinator runs a vote before anyone commits for real. Try the happy path, then make a vote fail.
          </SectionHead>
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
          <SectionHead step="③ Approach B — Sagas" title="Commit as you go, undo if you must">
            Drop the global lock entirely. Each step commits locally; if a later step fails, you run <i>compensating</i> actions to walk it back. Try the happy path, then fail the inventory step.
          </SectionHead>
          <SagaScenario />
          <Callout tag="When it fits" color="var(--violet)">
            Sagas trade strict isolation for <b>availability and scale</b> — the standard choice for long-running, cross-service workflows
            (microservices, e-commerce checkout, travel booking). The price: <b>eventual consistency</b> and the work of designing a compensating action for every step.
          </Callout>
        </div>
      </section>

      {/* 4. compare */}
      <section className="section" id="compare">
        <div className="wrap">
          <SectionHead step="④ Which one?" title="Same goal, opposite bets">
            Both keep the system consistent. They just disagree about <i>when</i>.
          </SectionHead>
          <div className="compare">
            <div className="cmp-card tpc">
              <h3>Two-Phase Commit</h3>
              <div className="sub">// lock first, commit together</div>
              <ul>
                <li><span className="ic up">✓</span><span>Strong, immediate consistency</span></li>
                <li><span className="ic up">✓</span><span>Simple mental model: one atomic outcome</span></li>
                <li><span className="ic dn">✕</span><span>Holds locks across the network</span></li>
                <li><span className="ic dn">✕</span><span>Coordinator crash → participants block</span></li>
                <li><span className="ic dn">✕</span><span>Scales poorly past a few services</span></li>
              </ul>
            </div>
            <div className="cmp-card saga">
              <h3>Saga</h3>
              <div className="sub">// commit as you go, compensate on failure</div>
              <ul>
                <li><span className="ic up">✓</span><span>No global locks — high throughput</span></li>
                <li><span className="ic up">✓</span><span>No single blocking coordinator</span></li>
                <li><span className="ic up">✓</span><span>Built for long, cross-service workflows</span></li>
                <li><span className="ic dn">✕</span><span>Only eventually consistent</span></li>
                <li><span className="ic dn">✕</span><span>You must design every compensation</span></li>
              </ul>
            </div>
          </div>

          <div className="takeaway">
            <h3>The one-line takeaway</h3>
            <p>
              You can’t get free atomicity once data lives in many services. <b>2PC buys consistency with locks and a vote</b>;
              <b> Sagas buy availability with local commits and undo logic.</b> Pick based on how long the operation runs and how much you can tolerate a brief in-between state.
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
