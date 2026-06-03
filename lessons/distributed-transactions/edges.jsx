/* ===========================================================
   edges.jsx — three edge-case scenarios in one player
   Tracks:
     crash — coordinator/orchestrator crash, 2PC vs Saga (split-screen)
     slow  — one slow participant/service, 2PC vs Saga (split-screen)
     retry — compensation itself fails, Saga only (single panel)
   =========================================================== */
function EdgesScenario() {

  /* ── Split-screen topology shared by crash + slow tracks ── */
  // Left half = 2PC (suffix L). Right half = Saga (suffix R).
  const SPLIT = {
    tcL:  { x: 25, y: 22, name: 'Coordinator',  glyph: 'TC', coord: true },
    invL: { x: 13, y: 72, name: 'Inventory',    glyph: 'IN' },
    payL: { x: 37, y: 72, name: 'Payment',      glyph: 'PY' },
    oxR:  { x: 75, y: 22, name: 'Orchestrator', glyph: 'OX', coord: true },
    ordR: { x: 63, y: 72, name: 'Orders',       glyph: 'OD' },
    payR: { x: 87, y: 72, name: 'Payment',      glyph: 'PY' },
  };
  const SPLIT_WIRES = [
    // 2PC half
    { x1: 25, y1: 22, x2: 13, y2: 72 },
    { x1: 25, y1: 22, x2: 37, y2: 72 },
    // Saga half
    { x1: 75, y1: 22, x2: 63, y2: 72 },
    { x1: 75, y1: 22, x2: 87, y2: 72 },
  ];
  const SPLIT_PACKET_IDS = ['p1', 'p2', 'p3', 'p4', 'q1', 'q2'];

  /* ── Saga-only topology for the retry track ──────────────── */
  const SAGA = {
    ox:  { x: 50, y: 18, name: 'Orchestrator', glyph: 'OX', coord: true },
    ord: { x: 18, y: 60, name: 'Orders',       glyph: 'OD' },
    pay: { x: 50, y: 60, name: 'Payment',      glyph: 'PY' },
    inv: { x: 82, y: 60, name: 'Inventory',    glyph: 'IN' },
  };
  const SAGA_WIRES = [
    { x1: 50, y1: 18, x2: 18, y2: 60 },
    { x1: 50, y1: 18, x2: 50, y2: 60 },
    { x1: 50, y1: 18, x2: 82, y2: 60 },
  ];
  const SAGA_PACKET_IDS = ['call', 'err'];

  /* ── Track 1: coordinator crash (split-screen) ───────────── */
  const crashSteps = [
    {
      title: 'Both protocols running normally',
      text: 'Each side has a driver — a coordinator (left) or orchestrator (right) — fanning work out to its services.',
      states: { tcL: 'active', invL: 'active', payL: 'active',  oxR: 'active', ordR: 'active', payR: 'idle' },
      labels: { invL: 'preparing…', payL: 'preparing…', ordR: 'committing…' },
      packets: {},
    },
    {
      title: 'Mid-flight: 2PC has votes, Saga finished step 1',
      text: '2PC participants voted YES and are holding locks, waiting for COMMIT. Saga just finished its first local commit and is starting the next step.',
      states: { tcL: 'active', invL: 'prepared', payL: 'prepared',  oxR: 'active', ordR: 'ok', payR: 'active' },
      labels: { invL: '🔒 prepared', payL: '🔒 prepared', ordR: 'committed', payR: 'committing…' },
      packets: {},
    },
    {
      title: 'Both crash at the worst possible moment',
      text: 'The 2PC coordinator dies before broadcasting COMMIT. The Saga orchestrator dies before kicking off step 2.',
      tone: 'var(--fail)',
      states: { tcL: 'fail', invL: 'prepared', payL: 'prepared',  oxR: 'fail', ordR: 'ok', payR: 'idle' },
      labels: { tcL: '✗ crashed', invL: '🔒 prepared', payL: '🔒 prepared', oxR: '✗ crashed', ordR: 'committed' },
      packets: {},
    },
    {
      title: 'Aftermath: same crash, opposite blast radius',
      text: '2PC participants can\'t safely decide on their own. They sit holding locks indefinitely while concurrent transactions queue up. Saga\'s services already finished their local commits before the orchestrator died — they\'re free.',
      why: 'Same failure, very different damage.',
      tone: 'var(--fail)',
      states: { tcL: 'fail', invL: 'locked', payL: 'locked',  oxR: 'fail', ordR: 'ok', payR: 'idle' },
      labels: { tcL: '✗ crashed', invL: '🔒 waiting…', payL: '🔒 waiting…', oxR: '✗ crashed', ordR: 'committed · free' },
      packets: {
        q1: { x: 25, y: 95, label: '⚠ other txns queued',   color: 'var(--fail)' },
        q2: { x: 75, y: 95, label: '✓ state persisted',     color: 'var(--ok)'   },
      },
    },
    {
      title: 'Saga orchestrator restarts and resumes',
      text: 'A new orchestrator instance reads the durable saga state and continues at step 2 — no manual intervention. The 2PC participants are still locked.',
      states: { tcL: 'fail', invL: 'locked', payL: 'locked',  oxR: 'active', ordR: 'ok', payR: 'active' },
      labels: { tcL: '✗ crashed', invL: '🔒 waiting…', payL: '🔒 waiting…', ordR: 'committed', payR: 'committing…' },
      packets: {
        q1: { x: 25, y: 95, label: '⚠ still queued',          color: 'var(--fail)' },
        q2: { x: 75, y: 10, label: '↺ resumed from state',    color: 'var(--ok)'   },
      },
    },
    {
      title: 'Saga done. 2PC still needs operator intervention',
      text: 'The saga completed end-to-end. The 2PC participants are still locked — the only safe resolutions are an operator decision or a heuristic recovery that risks divergence.',
      tone: 'var(--ok)',
      states: { tcL: 'fail', invL: 'locked', payL: 'locked',  oxR: 'ok', ordR: 'ok', payR: 'ok' },
      labels: { tcL: '✗ crashed', invL: '🔒 still locked', payL: '🔒 still locked', ordR: 'committed', payR: 'committed' },
      packets: {
        q1: { x: 25, y: 95, label: '⚠ operator needed', color: 'var(--fail)' },
      },
    },
  ];

  /* ── Track 2: one slow participant/service (split-screen) ── */
  const slowSteps = [
    {
      title: 'Both protocols kick off',
      text: '2PC sends PREPARE to both participants. Saga starts its first local step.',
      states: { tcL: 'active', invL: 'active', payL: 'active',  oxR: 'active', ordR: 'active', payR: 'idle' },
      labels: { invL: 'preparing…', payL: 'preparing…', ordR: 'committing…' },
      packets: {},
    },
    {
      title: 'Payment is fast, Inventory is slow',
      text: 'On both sides, Payment finishes quickly. Inventory is taking its time.',
      states: { tcL: 'active', invL: 'active', payL: 'prepared',  oxR: 'active', ordR: 'ok', payR: 'idle' },
      labels: { invL: 'still preparing…', payL: '🔒 prepared (waiting)', ordR: 'committed · free' },
      packets: {},
    },
    {
      title: '2PC: locks held everywhere · Saga: only the slow step is in flight',
      text: 'Payment (2PC) holds its lock for as long as Inventory is slow — concurrent transactions on Payment\'s rows are blocked. Saga\'s Orders already committed and released its lock; unrelated transactions on Orders proceed normally.',
      why: 'Lock duration in 2PC is global. In Saga it\'s local to one step.',
      tone: 'var(--warn)',
      states: { tcL: 'active', invL: 'active', payL: 'prepared',  oxR: 'active', ordR: 'ok', payR: 'idle' },
      labels: { invL: 'still preparing…', payL: '🔒 holding lock', ordR: 'serving others ✓' },
      packets: {
        q1: { x: 25, y: 95, label: '⚠ other txns blocked', color: 'var(--fail)' },
        q2: { x: 75, y: 95, label: '✓ other txns OK',      color: 'var(--ok)'   },
      },
    },
    {
      title: 'Saga starts step 2 (Payment) — independently',
      text: 'Saga\'s orchestrator moves on to Payment without waiting on a slow Inventory; Inventory will run as step 3 when its turn comes. 2PC, meanwhile, is still in PREPARE.',
      states: { tcL: 'active', invL: 'active', payL: 'prepared',  oxR: 'active', ordR: 'ok', payR: 'active' },
      labels: { invL: 'still preparing…', payL: '🔒 holding lock', ordR: 'committed', payR: 'committing…' },
      packets: {
        q1: { x: 25, y: 95, label: '⚠ throughput tanked', color: 'var(--fail)' },
      },
    },
    {
      title: 'Slow one finally finishes',
      text: 'Inventory completes on both sides. 2PC can now broadcast COMMIT; Saga continues forward.',
      states: { tcL: 'active', invL: 'prepared', payL: 'prepared',  oxR: 'active', ordR: 'ok', payR: 'ok' },
      labels: { invL: '🔒 prepared', payL: '🔒 prepared', ordR: 'committed', payR: 'committed' },
      packets: {},
    },
    {
      title: 'Both finish — at very different costs',
      text: '2PC commits atomically (correct), but the system absorbed the slowdown across every concurrent transaction touching those rows. Saga absorbed it only at the slow step.',
      tone: 'var(--ok)',
      states: { tcL: 'ok', invL: 'ok', payL: 'ok',  oxR: 'ok', ordR: 'ok', payR: 'ok' },
      labels: { invL: 'committed', payL: 'committed', ordR: 'committed', payR: 'committed' },
      packets: {},
    },
  ];

  /* ── Track 3: compensation itself fails (Saga only) ──────── */
  const retrySteps = [
    {
      title: 'Forward steps committed; Inventory fails',
      text: 'Orders and Payment have committed locally. Inventory is out of stock — the forward path stops. Time to compensate backwards.',
      tone: 'var(--fail)',
      states: { ox: 'active', ord: 'ok', pay: 'ok', inv: 'fail' },
      labels: { ord: 'committed', pay: 'charged $129', inv: 'OUT OF STOCK' },
      packets: {},
    },
    {
      title: 'Compensate payment → call refund API',
      text: 'The orchestrator asks Payment to issue a refund. Payment calls the external Refund API with an idempotency key derived from the order.',
      states: { ox: 'active', ord: 'ok', pay: 'undo', inv: 'fail' },
      labels: { ord: 'committed', pay: 'refunding…', inv: 'failed' },
      packets: {
        call: { x: 50, y: 80, label: 'refund $129 [key: ord-1042]', color: 'var(--violet)' },
      },
    },
    {
      title: 'Refund API is down',
      text: 'The compensation call fails. The customer\'s card is still charged. Without retries, the system stays inconsistent — a Saga\'s worst failure mode.',
      tone: 'var(--fail)',
      states: { ox: 'active', ord: 'ok', pay: 'fail', inv: 'fail' },
      labels: { ord: 'committed', pay: '✗ refund failed', inv: 'failed' },
      packets: {
        err: { x: 50, y: 88, label: '⚠ Refund API 503', color: 'var(--fail)' },
      },
    },
    {
      title: 'Retry with the same idempotency key',
      text: 'Back off and try again. The key (ord-1042) tells the API "if you already saw this, don\'t process it twice." Safe to retry as many times as needed.',
      states: { ox: 'active', ord: 'ok', pay: 'undo', inv: 'fail' },
      labels: { ord: 'committed', pay: 'retrying…', inv: 'failed' },
      packets: {
        call: { x: 50, y: 80, label: 'refund $129 [key: ord-1042]', color: 'var(--violet)' },
      },
    },
    {
      title: 'Succeeds — exactly one refund issued',
      text: 'The Refund API recognises the key, processes the refund once, and confirms. Even if earlier attempts had partially succeeded, idempotency ensures the customer is refunded exactly once.',
      why: 'Compensations must be idempotent — otherwise retries become bugs.',
      tone: 'var(--ok)',
      states: { ox: 'active', ord: 'ok', pay: 'undo', inv: 'fail' },
      labels: { ord: 'committed', pay: 'refunded ✓', inv: 'failed' },
      packets: {},
    },
    {
      title: 'Continue walking backwards → cancel order',
      text: 'With payment refunded, the orchestrator moves on to cancel the order. The saga walks back step-by-step until the system is consistent again.',
      states: { ox: 'active', ord: 'undo', pay: 'undo', inv: 'fail' },
      labels: { ord: 'cancelled', pay: 'refunded', inv: 'released' },
      packets: {
        call: { x: 18, y: 45, label: 'cancel order', color: 'var(--violet)' },
      },
    },
  ];

  /* ── Renderers ───────────────────────────────────────────── */
  const renderSplitStage = (step) => {
    const wires = SPLIT_WIRES.map(w => ({ ...w, active: true }));
    const pkts = step.packets || {};
    return (
      <React.Fragment>
        <div className="split-divider"></div>
        <div className="split-label tpc">2PC</div>
        <div className="split-label saga">Saga</div>
        <FlowWires wires={wires} />
        {Object.entries(SPLIT).map(([id, n]) => (
          <Node key={id} {...n}
            state={step.states[id]}
            label={(step.labels && step.labels[id]) || undefined} />
        ))}
        {SPLIT_PACKET_IDS.map(id => {
          const p = pkts[id];
          return <Packet key={id}
            x={p ? p.x : 50} y={p ? p.y : 50}
            label={p ? p.label : ''}
            color={p ? p.color : 'var(--ink)'}
            visible={!!p} />;
        })}
      </React.Fragment>
    );
  };

  const renderSagaStage = (step) => {
    const wires = SAGA_WIRES.map(w => ({ ...w, active: true }));
    const pkts = step.packets || {};
    return (
      <React.Fragment>
        <FlowWires wires={wires} />
        {Object.entries(SAGA).map(([id, n]) => (
          <Node key={id} {...n}
            state={step.states[id]}
            label={(step.labels && step.labels[id]) || undefined} />
        ))}
        {SAGA_PACKET_IDS.map(id => {
          const p = pkts[id];
          return <Packet key={id}
            x={p ? p.x : 50} y={p ? p.y : 50}
            label={p ? p.label : ''}
            color={p ? p.color : 'var(--ink)'}
            visible={!!p} />;
        })}
      </React.Fragment>
    );
  };

  const renderStage = (step, { trackId }) => {
    if (trackId === 'retry') return renderSagaStage(step);
    return renderSplitStage(step);
  };

  return (
    <ScenarioPlayer
      title="When the patterns bite"
      badge="EDGE CASES" badgeColor="var(--warn)"
      legend={[
        { label: 'committed / free',  color: 'var(--ok)',     fill: 'var(--green-t)'  },
        { label: 'prepared / locked', color: 'var(--warn)',   fill: 'var(--amber-t)'  },
        { label: 'failed / crashed',  color: 'var(--fail)',   fill: 'var(--coral-t)'  },
        { label: 'compensating',      color: 'var(--violet)', fill: 'var(--violet-t)' },
      ]}
      tracks={[
        { id: 'crash', label: 'Coordinator crash',   steps: crashSteps },
        { id: 'slow',  label: 'Slow participant',    steps: slowSteps  },
        { id: 'retry', label: 'Compensation retry',  steps: retrySteps },
      ]}
      renderStage={renderStage}
    />
  );
}
window.EdgesScenario = EdgesScenario;
