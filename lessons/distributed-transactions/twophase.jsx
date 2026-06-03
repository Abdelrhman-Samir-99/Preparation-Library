/* ===========================================================
   twophase.jsx — Two-Phase Commit
   Coordinator + 3 participants. Tracks:
     happy — prepare → vote YES → commit
     abort — one NO → coordinator broadcasts ABORT
   Final step: rewind to "all YES" then crash the coordinator —
   participants block holding locks.
   =========================================================== */
function TwoPhaseScenario() {
  const N = {
    tm:  { x: 50, y: 19, name: 'Coordinator', glyph: 'TC', coord: true },
    pay: { x: 20, y: 74, name: 'Payment',   glyph: 'PY' },
    inv: { x: 50, y: 74, name: 'Inventory', glyph: 'IN' },
    shp: { x: 80, y: 74, name: 'Shipping',  glyph: 'SH' },
  };
  const wireBase = [
    { x1: 50, y1: 19, x2: 20, y2: 74 },
    { x1: 50, y1: 19, x2: 50, y2: 74 },
    { x1: 50, y1: 19, x2: 80, y2: 74 },
  ];
  // Packet anchor mid-wire toward each participant
  const MID = { pay: { x: 35, y: 47 }, inv: { x: 50, y: 47 }, shp: { x: 65, y: 47 } };

  const happy = [
    {
      title: 'Meet the coordinator',
      text: 'A dedicated transaction coordinator drives everything. Its single job: make sure all participants commit, or none do.',
      states: { tm: 'active', pay: 'idle', inv: 'idle', shp: 'idle' }, packets: {},
    },
    {
      title: 'Phase 1 — "Can you commit?"',
      text: 'The coordinator asks every participant to PREPARE. Each does its work tentatively and locks the affected rows — but does not commit yet.',
      states: { tm: 'active', pay: 'active', inv: 'active', shp: 'active' },
      labels: { tm: 'asking…', pay: 'preparing…', inv: 'preparing…', shp: 'preparing…' },
      packets: {
        pay: { ...MID.pay, label: 'prepare?', color: 'var(--blue)' },
        inv: { ...MID.inv, label: 'prepare?', color: 'var(--blue)' },
        shp: { ...MID.shp, label: 'prepare?', color: 'var(--blue)' },
      },
    },
    {
      title: 'Everyone votes YES',
      text: 'Each participant has written to its log and can guarantee a commit, so all reply "YES, prepared." They keep holding their locks.',
      states: { tm: 'active', pay: 'prepared', inv: 'prepared', shp: 'prepared' },
      labels: { pay: '🔒 prepared', inv: '🔒 prepared', shp: '🔒 prepared' },
      packets: {
        pay: { x: 32, y: 42, label: 'YES ✓', color: 'var(--ok)' },
        inv: { x: 50, y: 42, label: 'YES ✓', color: 'var(--ok)' },
        shp: { x: 68, y: 42, label: 'YES ✓', color: 'var(--ok)' },
      },
    },
    {
      title: 'Phase 2 — Commit',
      text: 'All votes were YES, so the coordinator broadcasts COMMIT to everyone.',
      states: { tm: 'active', pay: 'prepared', inv: 'prepared', shp: 'prepared' },
      labels: { pay: '🔒 prepared', inv: '🔒 prepared', shp: '🔒 prepared' },
      packets: {
        pay: { ...MID.pay, label: 'COMMIT', color: 'var(--ink)' },
        inv: { ...MID.inv, label: 'COMMIT', color: 'var(--ink)' },
        shp: { ...MID.shp, label: 'COMMIT', color: 'var(--ink)' },
      },
    },
    {
      title: 'Committed — atomic across services',
      text: 'Every participant commits and releases its locks. All-or-nothing held: the order is now consistent everywhere at once.',
      why: 'Strong, immediate consistency — but it cost us locks and two network round-trips.',
      tone: 'var(--ok)',
      states: { tm: 'ok', pay: 'ok', inv: 'ok', shp: 'ok' },
      labels: { pay: 'committed', inv: 'committed', shp: 'committed' }, packets: {},
    },
  ];

  const abort = [
    {
      title: 'Phase 1 — Prepare',
      text: 'Same start: the coordinator asks all three participants to prepare and lock their rows.',
      states: { tm: 'active', pay: 'active', inv: 'active', shp: 'active' },
      labels: { tm: 'asking…', pay: 'preparing…', inv: 'preparing…', shp: 'preparing…' },
      packets: {
        pay: { ...MID.pay, label: 'prepare?', color: 'var(--blue)' },
        inv: { ...MID.inv, label: 'prepare?', color: 'var(--blue)' },
        shp: { ...MID.shp, label: 'prepare?', color: 'var(--blue)' },
      },
    },
    {
      title: 'One participant votes NO',
      text: 'Inventory can’t reserve the stock, so it votes NO. Payment and Shipping voted YES and are now sitting on locks.',
      tone: 'var(--fail)',
      states: { tm: 'active', pay: 'prepared', inv: 'fail', shp: 'prepared' },
      labels: { pay: '🔒 prepared', inv: 'votes NO', shp: '🔒 prepared' },
      packets: {
        pay: { x: 32, y: 42, label: 'YES ✓', color: 'var(--ok)' },
        inv: { x: 50, y: 42, label: 'NO ✗',  color: 'var(--fail)' },
        shp: { x: 68, y: 42, label: 'YES ✓', color: 'var(--ok)' },
      },
    },
    {
      title: 'Phase 2 — Abort',
      text: 'A single NO is enough. The coordinator tells everyone to ABORT and throw away the tentative work.',
      states: { tm: 'fail', pay: 'prepared', inv: 'fail', shp: 'prepared' },
      labels: { pay: '🔒 prepared', inv: 'aborted', shp: '🔒 prepared' },
      packets: {
        pay: { ...MID.pay, label: 'ABORT', color: 'var(--fail)' },
        inv: { ...MID.inv, label: 'ABORT', color: 'var(--fail)' },
        shp: { ...MID.shp, label: 'ABORT', color: 'var(--fail)' },
      },
    },
    {
      title: 'Rolled back cleanly',
      text: 'Payment and Shipping discard their tentative writes and release their locks. Nothing committed anywhere — the system stayed consistent.',
      why: 'Atomicity preserved: one NO cancels the entire transaction.',
      states: { tm: 'idle', pay: 'idle', inv: 'idle', shp: 'idle' },
      labels: { pay: 'rolled back', inv: 'rolled back', shp: 'rolled back' }, packets: {},
    },
    {
      title: 'The catch: 2PC blocks',
      text: 'Now rewind: suppose all three voted YES — then the coordinator crashes before sending COMMIT. The participants are stuck holding locks, unable to commit or abort on their own. They wait… and block.',
      why: 'This single-point-of-failure fragility is a big reason teams reach for Sagas.',
      tone: 'var(--fail)',
      states: { tm: 'fail', pay: 'locked', inv: 'locked', shp: 'locked' },
      labels: { tm: '✗ crashed', pay: '🔒 waiting…', inv: '🔒 waiting…', shp: '🔒 waiting…' }, packets: {},
    },
  ];

  const renderStage = (step) => {
    const wires = wireBase.map(w => ({ ...w, active: true }));
    const pkts = step.packets || {};
    return (
      <React.Fragment>
        <FlowWires wires={wires} />
        {Object.entries(N).map(([id, n]) => (
          <Node key={id} {...n}
            state={step.states[id]}
            label={(step.labels && step.labels[id]) || undefined} />
        ))}
        {['pay', 'inv', 'shp', 'warn'].map(id => {
          const p = pkts[id];
          return <Packet key={id}
            x={p ? p.x : 50} y={p ? p.y : 47}
            label={p ? p.label : ''}
            color={p ? p.color : 'var(--ink)'}
            visible={!!p} />;
        })}
      </React.Fragment>
    );
  };

  return (
    <ScenarioPlayer
      title="Place Order · coordinator + 3 participants"
      badge="2-PHASE COMMIT" badgeColor="var(--blue)"
      legend={[
        { label: 'preparing',          color: 'var(--blue)', fill: 'var(--blue-t)'  },
        { label: 'prepared / locked',  color: 'var(--warn)', fill: 'var(--amber-t)' },
        { label: 'committed',          color: 'var(--ok)',   fill: 'var(--green-t)' },
        { label: 'failed / abort',     color: 'var(--fail)', fill: 'var(--coral-t)' },
      ]}
      tracks={[
        { id: 'happy', label: 'Happy path',  steps: happy },
        { id: 'abort', label: 'A vote fails', steps: abort },
      ]}
      renderStage={renderStage}
    />
  );
}
window.TwoPhaseScenario = TwoPhaseScenario;
