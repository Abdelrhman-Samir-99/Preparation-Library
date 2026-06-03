/* ===========================================================
   problem.jsx — "The Problem"
   No coordinator, no orchestrator. Two common commit-ordering
   patterns the app might use, with the failure mode each one
   was designed to avoid:

     Pattern A — commit-then-call  → LAST service fails
     Pattern B — call-then-commit  → MIDDLE service fails
   =========================================================== */

// Shared topology + renderer for both pattern scenarios.
const PROBLEM_N = {
  ord: { x: 18, y: 50, name: 'Orders',    glyph: 'OD' },
  pay: { x: 50, y: 50, name: 'Payment',   glyph: 'PY' },
  inv: { x: 82, y: 50, name: 'Inventory', glyph: 'IN' },
};
const PROBLEM_WIRES = [
  { x1: 18, y1: 50, x2: 50, y2: 50 },
  { x1: 50, y1: 50, x2: 82, y2: 50 },
];

function renderProblemStage(step) {
  const wires = PROBLEM_WIRES.map(w => ({ ...w, active: true }));
  const pkts = step.packets || {};
  return (
    <React.Fragment>
      <FlowWires wires={wires} />
      {Object.entries(PROBLEM_N).map(([id, n]) => (
        <Node key={id} {...n}
          state={step.states[id]}
          label={(step.labels && step.labels[id]) || undefined} />
      ))}
      {['m1', 'warn'].map(id => {
        const p = pkts[id];
        return <Packet key={id}
          x={p ? p.x : 50} y={p ? p.y : 50}
          label={p ? p.label : ''}
          color={p ? p.color : 'var(--ink)'}
          arrow={p ? p.arrow : undefined}
          visible={!!p && p.visible} />;
      })}
    </React.Fragment>
  );
}

/* ============================================================
   Pattern A — Commit-then-call
   Each service writes + COMMITS locally, then calls the next.
   Failure of the LAST service strands all the earlier commits.
   ============================================================ */
function ProblemCommitThenCall() {
  const steps = [
    {
      title: 'Pattern A · commit-then-call',
      text: 'Each service writes to its own DB and commits its local transaction as soon as it is done, then proceeds to call the next service. No waiting on downstream — the commit happens first, the next call happens second.',
      states: { ord: 'active', pay: 'idle', inv: 'idle' },
      packets: {},
    },
    {
      title: 'Orders commits, then calls Payment',
      text: 'Orders writes the new order and commits to its DB. Then it calls Payment.',
      states: { ord: 'ok', pay: 'active', inv: 'idle' },
      labels: { ord: 'committed' },
      packets: { m1: { x: 34, y: 40, label: 'create + commit done', color: 'var(--blue)', arrow: 'right', visible: true } },
    },
    {
      title: 'Payment commits, then calls Inventory',
      text: 'Payment charges $129 and commits. Then it calls Inventory.',
      states: { ord: 'ok', pay: 'ok', inv: 'active' },
      labels: { ord: 'committed', pay: 'committed' },
      packets: { m1: { x: 66, y: 40, label: 'charge + commit done', color: 'var(--blue)', arrow: 'right', visible: true } },
    },
    {
      title: 'Inventory fails ✗',
      text: 'Inventory is out of stock and refuses the reservation. By this point Orders and Payment have already committed — the failure has nowhere clean to go.',
      tone: 'var(--fail)',
      states: { ord: 'ok', pay: 'ok', inv: 'fail' },
      labels: { ord: 'committed', pay: 'committed', inv: 'OUT OF STOCK' },
      packets: { m1: { x: 82, y: 36, label: 'reserve ✗', color: 'var(--fail)', visible: true } },
    },
    {
      title: 'The LAST service strands everyone behind it',
      text: 'Orders has an order. Payment has the customer\'s money. Inventory has nothing. Both upstream commits are final — there is no transaction that can roll them back from the outside.',
      why: 'In commit-then-call, every step before the failure has already committed. The last service\'s failure does the most damage.',
      tone: 'var(--fail)',
      states: { ord: 'ok', pay: 'fail', inv: 'fail' },
      labels: { ord: 'committed', pay: '⚠ money taken', inv: 'no stock' },
      packets: { warn: { x: 50, y: 18, label: '⚠ CHARGED, NO STOCK', color: 'var(--fail)', visible: true } },
    },
  ];

  return (
    <ScenarioPlayer
      title="Place Order — when the last service fails"
      badge="COMMIT-THEN-CALL" badgeColor="var(--coral)"
      legend={[
        { label: 'committed', color: 'var(--ok)',   fill: 'var(--green-t)' },
        { label: 'active',    color: 'var(--blue)', fill: 'var(--blue-t)'  },
        { label: 'failed',    color: 'var(--fail)', fill: 'var(--coral-t)' },
      ]}
      tracks={[{ id: 'last-fails', label: 'Last service fails', steps }]}
      renderStage={renderProblemStage}
    />
  );
}
window.ProblemCommitThenCall = ProblemCommitThenCall;

/* ============================================================
   Pattern B — Call-then-commit
   Each service does its work tentatively, calls the next, waits
   for success, THEN commits its own work. The DEEPEST service
   commits first (it has nothing downstream to wait on). If a
   MIDDLE service fails after the deepest already committed, the
   downstream is stranded.
   ============================================================ */
function ProblemCallThenCommit() {
  const steps = [
    {
      title: 'Pattern B · call-then-commit',
      text: 'Different idea: each service does its work but holds the commit until the next service returns success. Only commit if downstream worked.',
      states: { ord: 'active', pay: 'idle', inv: 'idle' },
      packets: {},
    },
    {
      title: 'Orders calls Payment — tentative, not committed',
      text: 'Orders has done the DB write but has NOT committed yet. It calls Payment and waits for an OK before committing its own work.',
      states: { ord: 'prepared', pay: 'active', inv: 'idle' },
      labels: { ord: 'tentative · waiting' },
      packets: { m1: { x: 34, y: 40, label: 'create + wait for OK', color: 'var(--blue)', arrow: 'right', visible: true } },
    },
    {
      title: 'Payment calls Inventory — also tentative',
      text: 'Same shape: Payment has done its work but is holding its commit, waiting for Inventory to come back successful.',
      states: { ord: 'prepared', pay: 'prepared', inv: 'active' },
      labels: { ord: 'tentative · waiting', pay: 'tentative · waiting' },
      packets: { m1: { x: 66, y: 40, label: 'charge + wait for OK', color: 'var(--blue)', arrow: 'right', visible: true } },
    },
    {
      title: 'Inventory commits ✓ — nothing downstream to wait on',
      text: 'Inventory has no service to call next, so the pattern reduces to "just commit." It writes the reservation and returns OK to Payment.',
      states: { ord: 'prepared', pay: 'prepared', inv: 'ok' },
      labels: { ord: 'tentative · waiting', pay: 'tentative · waiting', inv: 'reserved ✓' },
      packets: { m1: { x: 66, y: 40, label: 'OK ✓', color: 'var(--ok)', arrow: 'left', visible: true } },
    },
    {
      title: 'Payment tries to commit ✗',
      text: 'Payment received success from Inventory, so now it tries to commit its own work — and the commit itself fails. Its DB connection just died, or the payment processor returned a late timeout right after the green light.',
      tone: 'var(--fail)',
      states: { ord: 'prepared', pay: 'fail', inv: 'ok' },
      labels: { ord: 'tentative · waiting', pay: 'commit ✗', inv: 'reserved' },
      packets: { m1: { x: 50, y: 36, label: 'commit ✗', color: 'var(--fail)', visible: true } },
    },
    {
      title: 'The MIDDLE service strands the deepest one',
      text: 'Inventory has already committed. Payment failed before it could commit, so it rolls back. Orders rolls back too, since it never got OK from Payment. The middle of the chain failed AFTER the deepest already committed — and there is no way to undo Inventory\'s commit from outside that service.',
      why: 'Waiting for downstream success does not save you. The deepest service commits first, so a failure higher up the chain leaves committed work stranded — the exact thing we were trying to avoid.',
      tone: 'var(--fail)',
      states: { ord: 'idle', pay: 'fail', inv: 'ok' },
      labels: { ord: 'rolled back', pay: '⚠ never committed', inv: '⚠ stock reserved' },
      packets: { warn: { x: 50, y: 18, label: '⚠ STOCK HELD, NO ORDER', color: 'var(--fail)', visible: true } },
    },
  ];

  return (
    <ScenarioPlayer
      title="Place Order — when the middle service fails"
      badge="CALL-THEN-COMMIT" badgeColor="var(--warn)"
      legend={[
        { label: 'tentative · waiting', color: 'var(--warn)', fill: 'var(--amber-t)' },
        { label: 'committed',           color: 'var(--ok)',   fill: 'var(--green-t)' },
        { label: 'failed',              color: 'var(--fail)', fill: 'var(--coral-t)' },
      ]}
      tracks={[{ id: 'middle-fails', label: 'Middle service fails', steps }]}
      renderStage={renderProblemStage}
    />
  );
}
window.ProblemCallThenCommit = ProblemCallThenCommit;
