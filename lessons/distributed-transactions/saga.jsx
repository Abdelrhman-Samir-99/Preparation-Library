/* ===========================================================
   saga.jsx — Saga (orchestration)
   Orchestrator + 4 services. Tracks:
     happy — each step commits locally, no global lock
     fail  — Inventory fails → compensating actions undo earlier
             committed steps in reverse (refund, cancel)
   =========================================================== */
function SagaScenario() {
  const N = {
    ox:  { x: 50, y: 18, name: 'Orchestrator', glyph: 'OX', coord: true },
    ord: { x: 14, y: 74, name: 'Orders',    glyph: 'OD' },
    pay: { x: 38, y: 74, name: 'Payment',   glyph: 'PY' },
    inv: { x: 62, y: 74, name: 'Inventory', glyph: 'IN' },
    shp: { x: 86, y: 74, name: 'Shipping',  glyph: 'SH' },
  };
  const wireBase = [
    { x1: 50, y1: 18, x2: 14, y2: 74 },
    { x1: 50, y1: 18, x2: 38, y2: 74 },
    { x1: 50, y1: 18, x2: 62, y2: 74 },
    { x1: 50, y1: 18, x2: 86, y2: 74 },
  ];
  const MID = { ord: { x: 32, y: 46 }, pay: { x: 44, y: 46 }, inv: { x: 56, y: 46 }, shp: { x: 68, y: 46 } };

  const happy = [
    {
      title: 'No global lock, no votes',
      text: 'A Saga splits the big transaction into a sequence of local transactions — one per service. Each commits on its own, immediately. An orchestrator simply calls them in order.',
      states: { ox: 'active', ord: 'idle', pay: 'idle', inv: 'idle', shp: 'idle' }, packets: {},
    },
    {
      title: 'Step 1 — Create order',
      text: 'The orchestrator tells Orders to create the order. It commits locally and is done — no lock held for anyone else.',
      states: { ox: 'active', ord: 'ok', pay: 'idle', inv: 'idle', shp: 'idle' },
      labels: { ord: 'committed' },
      packets: { ord: { ...MID.ord, label: 'createOrder', color: 'var(--blue)' } },
    },
    {
      title: 'Step 2 — Take payment',
      text: 'Next, Payment charges the card and commits. The previous step is already final.',
      states: { ox: 'active', ord: 'ok', pay: 'ok', inv: 'idle', shp: 'idle' },
      labels: { ord: 'committed', pay: 'charged $129' },
      packets: { pay: { ...MID.pay, label: 'charge', color: 'var(--blue)' } },
    },
    {
      title: 'Step 3 — Reserve stock',
      text: 'Inventory reserves the item and commits.',
      states: { ox: 'active', ord: 'ok', pay: 'ok', inv: 'ok', shp: 'idle' },
      labels: { ord: 'committed', pay: 'charged $129', inv: 'reserved' },
      packets: { inv: { ...MID.inv, label: 'reserve', color: 'var(--blue)' } },
    },
    {
      title: 'Step 4 — Schedule shipping',
      text: 'Finally Shipping books the delivery and commits. The full chain is complete.',
      states: { ox: 'active', ord: 'ok', pay: 'ok', inv: 'ok', shp: 'ok' },
      labels: { ord: 'committed', pay: 'charged $129', inv: 'reserved', shp: 'booked' },
      packets: { shp: { ...MID.shp, label: 'schedule', color: 'var(--blue)' } },
    },
    {
      title: 'Done — eventually consistent',
      text: 'Each step committed as it went; no global lock was ever held, so throughput stays high.',
      why: 'The trade-off: for a moment the order was only half-complete and visible to others.',
      tone: 'var(--ok)',
      states: { ox: 'ok', ord: 'ok', pay: 'ok', inv: 'ok', shp: 'ok' },
      labels: { ord: 'committed', pay: 'charged $129', inv: 'reserved', shp: 'booked' }, packets: {},
    },
  ];

  const fail = [
    {
      title: 'Forward steps commit',
      text: 'Orders and Payment have already run and committed locally — that work is final and visible.',
      states: { ox: 'active', ord: 'ok', pay: 'ok', inv: 'idle', shp: 'idle' },
      labels: { ord: 'committed', pay: 'charged $129' }, packets: {},
    },
    {
      title: 'Step 3 fails ✗',
      text: 'Inventory tries to reserve the item but it’s out of stock. The forward path can’t continue.',
      tone: 'var(--fail)',
      states: { ox: 'active', ord: 'ok', pay: 'ok', inv: 'fail', shp: 'idle' },
      labels: { ord: 'committed', pay: 'charged $129', inv: 'OUT OF STOCK' },
      packets: { inv: { ...MID.inv, label: 'reserve ✗', color: 'var(--fail)' } },
    },
    {
      title: 'Run compensations — in reverse',
      text: 'We can’t "roll back" commits that already happened in other services. Instead the Saga runs a compensating transaction for each completed step, walking backwards.',
      states: { ox: 'active', ord: 'ok', pay: 'ok', inv: 'fail', shp: 'idle' },
      labels: { ox: 'compensating', ord: 'committed', pay: 'charged $129', inv: 'failed' }, packets: {},
    },
    {
      title: 'Undo payment → refund',
      text: 'The orchestrator tells Payment to refund the $129 — the compensating action for "charge."',
      states: { ox: 'active', ord: 'ok', pay: 'undo', inv: 'fail', shp: 'idle' },
      labels: { ord: 'committed', pay: 'refunded', inv: 'failed' },
      packets: { pay: { ...MID.pay, label: 'refund $129', color: 'var(--violet)' } },
    },
    {
      title: 'Undo order → cancel',
      text: 'Then Orders cancels the order — the compensating action for "createOrder."',
      states: { ox: 'active', ord: 'undo', pay: 'undo', inv: 'fail', shp: 'idle' },
      labels: { ord: 'cancelled', pay: 'refunded', inv: 'failed' },
      packets: { ord: { ...MID.ord, label: 'cancel order', color: 'var(--violet)' } },
    },
    {
      title: 'Consistent again',
      text: 'Every committed step has been semantically undone by its compensation. The system is consistent — reached by moving forward, not by locking.',
      why: 'The cost: you must design a correct compensating action for every step.',
      tone: 'var(--violet)',
      states: { ox: 'ok', ord: 'undo', pay: 'undo', inv: 'idle', shp: 'idle' },
      labels: { ord: 'cancelled', pay: 'refunded', inv: 'released' }, packets: {},
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
        {['ord', 'pay', 'inv', 'shp'].map(id => {
          const p = pkts[id];
          return <Packet key={id}
            x={p ? p.x : 50} y={p ? p.y : 46}
            label={p ? p.label : ''}
            color={p ? p.color : 'var(--ink)'}
            visible={!!p} />;
        })}
      </React.Fragment>
    );
  };

  return (
    <ScenarioPlayer
      title="Place Order · orchestrator + 4 local transactions"
      badge="SAGA" badgeColor="var(--violet)"
      legend={[
        { label: 'committed locally',     color: 'var(--ok)',     fill: 'var(--green-t)'  },
        { label: 'failed',                color: 'var(--fail)',   fill: 'var(--coral-t)'  },
        { label: 'compensated (undone)',  color: 'var(--violet)', fill: 'var(--violet-t)' },
      ]}
      tracks={[
        { id: 'happy', label: 'Happy path',     steps: happy },
        { id: 'fail',  label: 'Inventory fails', steps: fail },
      ]}
      renderStage={renderStage}
    />
  );
}
window.SagaScenario = SagaScenario;
