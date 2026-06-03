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

  /* ── Saga-only topology for the DIRECT retry track ──────── */
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

  /* ── Queue-driven retry topology (Saga compensation, the way
       it actually looks in production) ───────────────────────── */
  const QUEUE_RETRY_N = {
    orch:   { x: 50, y: 12, name: 'Orchestrator',  glyph: 'OX', coord: true },
    queue:  { x: 22, y: 42, name: 'Comp queue',    glyph: 'MQ' },
    worker: { x: 50, y: 42, name: 'Refund worker', glyph: 'RW' },
    api:    { x: 80, y: 42, name: 'Refund API',    glyph: '$$' },
    ord:    { x: 16, y: 75, name: 'Orders',        glyph: 'OD' },
    pay:    { x: 50, y: 75, name: 'Payment',       glyph: 'PY' },
    inv:    { x: 84, y: 75, name: 'Inventory',     glyph: 'IN' },
  };
  const QUEUE_RETRY_WIRES = [
    { x1: 50, y1: 12, x2: 22, y2: 42 },  // orch → queue (publish)
    { x1: 22, y1: 42, x2: 50, y2: 42 },  // queue → worker (deliver / redeliver)
    { x1: 50, y1: 42, x2: 80, y2: 42 },  // worker ↔ api
    { x1: 50, y1: 42, x2: 50, y2: 75 },  // worker → pay (state update)
  ];
  const QUEUE_RETRY_PACKET_IDS = ['pub', 'msg', 'apicall', 'apiresp', 'state'];

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

  /* ── Track 3a: compensation retry · DIRECT (no queue) ────
       The simpler shape: orchestrator calls the Refund API itself
       and retries on failure. Easier to reason about; rarely how
       production systems actually build it. ─────────────────── */
  const directRetrySteps = [
    {
      title: 'Inventory failed — orchestrator will call the Refund API directly',
      text: 'Orders and Payment have committed locally. Inventory refused. The simplest way to compensate: the orchestrator itself calls the Refund API, and retries in-process if anything goes wrong.',
      tone: 'var(--fail)',
      states: { ox: 'active', ord: 'ok', pay: 'ok', inv: 'fail' },
      labels: { ord: 'committed', pay: 'charged $129', inv: 'OUT OF STOCK' },
      packets: {},
    },
    {
      title: 'Orchestrator calls the Refund API',
      text: 'Orchestrator asks Payment to issue a refund, with an idempotency key derived from the order (ord-1042). It blocks waiting on the response.',
      states: { ox: 'active', ord: 'ok', pay: 'undo', inv: 'fail' },
      labels: { ord: 'committed', pay: 'refunding…', inv: 'failed' },
      packets: {
        call: { x: 50, y: 38, label: 'refund $129 [key: ord-1042]', color: 'var(--violet)' },
      },
    },
    {
      title: 'Refund API is down — call fails',
      text: 'The compensation call returns a 503. The customer\'s card is still charged. The orchestrator is still on the hook for this refund, and now has to manage the retry loop itself.',
      tone: 'var(--fail)',
      states: { ox: 'active', ord: 'ok', pay: 'fail', inv: 'fail' },
      labels: { ord: 'committed', pay: '✗ refund failed', inv: 'failed' },
      packets: {
        err: { x: 50, y: 88, label: '⚠ Refund API 503', color: 'var(--fail)' },
      },
    },
    {
      title: 'Orchestrator retries with the same key',
      text: 'Back off and try again. The key (ord-1042) tells the API "if you already saw this, don\'t process it twice." Safe to retry — but the orchestrator is the one looping, holding the whole flow open while the API recovers.',
      states: { ox: 'active', ord: 'ok', pay: 'undo', inv: 'fail' },
      labels: { ord: 'committed', pay: 'retrying…', inv: 'failed' },
      packets: {
        call: { x: 50, y: 38, label: 'refund $129 [key: ord-1042]', color: 'var(--violet)' },
      },
    },
    {
      title: 'Succeeds — exactly one refund issued',
      text: 'The Refund API recognises the key, processes the refund once, and confirms. Idempotency ensures the customer is refunded exactly once even though we called twice.',
      why: 'Works — but the orchestrator was tied up sitting on this for the whole retry window. Anything else it could be doing was waiting too.',
      tone: 'var(--ok)',
      states: { ox: 'active', ord: 'ok', pay: 'undo', inv: 'fail' },
      labels: { ord: 'committed', pay: 'refunded ✓', inv: 'failed' },
      packets: {},
    },
    {
      title: 'Continue walking backwards → cancel order',
      text: 'With Payment refunded, the orchestrator moves on to cancel the order. Same pattern: direct call, retry in-process if it fails.',
      states: { ox: 'active', ord: 'undo', pay: 'undo', inv: 'fail' },
      labels: { ord: 'cancelled', pay: 'refunded', inv: 'released' },
      packets: {
        call: { x: 18, y: 45, label: 'cancel order', color: 'var(--violet)' },
      },
    },
  ];

  /* ── Track 3b: compensation via queue + worker (production shape) ─
       Same scenario as 3a, but the orchestrator hands the work off
       to a queue. A worker handles the retry loop. The orchestrator
       is free as soon as it publishes. ─────────────────────────── */
  const queueRetrySteps = [
    {
      title: 'Inventory failed — time to walk back the committed steps',
      text: 'Orders and Payment have committed locally. Inventory refused. The orchestrator needs to compensate — but in production it does NOT call the Refund API directly. Instead it hands the work off to a compensation queue, so retries live outside the orchestrator and the orchestrator stays free.',
      states: { orch: 'active', queue: 'idle', worker: 'idle', api: 'idle', ord: 'ok', pay: 'ok', inv: 'fail' },
      labels: { queue: 'empty', worker: 'idle', api: 'idle', ord: 'committed', pay: 'charged $129', inv: 'OUT OF STOCK' },
      packets: {},
    },
    {
      title: 'Orchestrator publishes a refund job to the queue',
      text: 'One durable write — { type: "refund", orderId: "ord-1042" }. The orchestrator hands off and moves on. It doesn\'t wait around for the actual API call.',
      states: { orch: 'active', queue: 'active', worker: 'idle', api: 'idle', ord: 'ok', pay: 'ok', inv: 'fail' },
      labels: { queue: '1 msg · pending', worker: 'idle', api: 'idle', pay: 'charged $129', inv: 'failed' },
      packets: {
        pub: { x: 36, y: 27, label: 'refund · ord-1042', color: 'var(--violet)' },
      },
    },
    {
      title: 'Worker consumes the message and calls the Refund API',
      text: 'Refund Worker pulls the next message off the queue and calls the API with an idempotency key derived from the order. The queue holds the message as in-flight until the worker acks it.',
      states: { orch: 'idle', queue: 'active', worker: 'active', api: 'active', ord: 'ok', pay: 'ok', inv: 'fail' },
      labels: { queue: 'in-flight · 1', worker: 'calling API…', api: 'processing…', pay: 'charged $129', inv: 'failed' },
      packets: {
        msg:     { x: 36, y: 42, label: 'refund req', color: 'var(--blue)' },
        apicall: { x: 65, y: 42, label: 'refund $129 [key: ord-1042]', color: 'var(--blue)' },
      },
    },
    {
      title: 'API returns 503 — Worker doesn\'t ack',
      text: 'The Refund API is down. The worker doesn\'t send an ack to the queue, so the message stays as in-flight. After the visibility timeout the queue will redeliver it automatically — no manual retry logic in the orchestrator, no spinning loop in the worker.',
      tone: 'var(--fail)',
      states: { orch: 'idle', queue: 'active', worker: 'fail', api: 'fail', ord: 'ok', pay: 'ok', inv: 'fail' },
      labels: { queue: 'redelivery pending', worker: '✗ no ack', api: '✗ 503', pay: 'charged $129', inv: 'failed' },
      packets: {
        apiresp: { x: 65, y: 36, label: '✗ 503 error', color: 'var(--fail)' },
      },
    },
    {
      title: 'Queue redelivers — Worker retries with the same key',
      text: 'After backoff, the queue hands the same message to the worker again (still keyed by ord-1042). The worker calls the API a second time. The key is what makes this safe: if the API actually processed the first attempt and we just didn\'t hear the response, the second call dedupes instead of refunding twice.',
      states: { orch: 'idle', queue: 'active', worker: 'active', api: 'active', ord: 'ok', pay: 'ok', inv: 'fail' },
      labels: { queue: 'in-flight · 1', worker: 'retrying…', api: 'processing…', pay: 'charged $129', inv: 'failed' },
      packets: {
        msg:     { x: 36, y: 42, label: 'redeliver', color: 'var(--blue)' },
        apicall: { x: 65, y: 42, label: 'refund $129 [key: ord-1042]', color: 'var(--blue)' },
      },
    },
    {
      title: 'API succeeds — Worker updates Payment and acks the queue',
      text: 'The API processes the refund and returns 200. The worker writes the state update to Payment, then sends the ack to the queue. The message is removed from the queue.',
      why: 'The orchestrator was free this entire time. Retries lived inside the queue + worker. Idempotency keys made them safe. This is the production shape of saga compensations.',
      tone: 'var(--ok)',
      states: { orch: 'idle', queue: 'ok', worker: 'ok', api: 'ok', ord: 'ok', pay: 'undo', inv: 'fail' },
      labels: { queue: 'empty', worker: 'done', api: 'OK ✓', pay: 'refunded ✓', inv: 'failed' },
      packets: {
        apiresp: { x: 65, y: 42, label: '✓ refunded', color: 'var(--ok)' },
        state:   { x: 50, y: 58, label: 'state update', color: 'var(--ok)' },
      },
    },
    {
      title: 'Same machinery for the next compensation',
      text: 'The orchestrator publishes the next compensation — { type: "cancel", orderId: "ord-1042" } — to the same queue. A worker (the same one or another consumer) processes it the same way. Step by step, the saga walks back until the system is consistent.',
      states: { orch: 'active', queue: 'active', worker: 'active', api: 'idle', ord: 'undo', pay: 'undo', inv: 'fail' },
      labels: { queue: '1 msg · cancel', worker: 'cancelling…', api: 'idle', ord: 'cancelling…', pay: 'refunded' },
      packets: {
        pub: { x: 36, y: 27, label: 'cancel · ord-1042', color: 'var(--violet)' },
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

  const renderQueueRetryStage = (step) => {
    const wires = QUEUE_RETRY_WIRES.map(w => ({ ...w, active: true }));
    const pkts = step.packets || {};
    return (
      <React.Fragment>
        <FlowWires wires={wires} />
        {Object.entries(QUEUE_RETRY_N).map(([id, n]) => (
          <Node key={id} {...n}
            state={step.states[id]}
            label={(step.labels && step.labels[id]) || undefined} />
        ))}
        {QUEUE_RETRY_PACKET_IDS.map(id => {
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
    if (trackId === 'retry-direct') return renderSagaStage(step);
    if (trackId === 'retry-queue')  return renderQueueRetryStage(step);
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
        { id: 'crash',        label: 'Coordinator crash',          steps: crashSteps        },
        { id: 'slow',         label: 'Slow participant',           steps: slowSteps         },
        { id: 'retry-direct', label: 'Comp retry · direct',        steps: directRetrySteps  },
        { id: 'retry-queue',  label: 'Comp retry · with queue',    steps: queueRetrySteps   },
      ]}
      renderStage={renderStage}
    />
  );
}
window.EdgesScenario = EdgesScenario;
