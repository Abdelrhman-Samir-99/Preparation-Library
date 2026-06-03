/* ===========================================================
   problem.jsx — "The Problem": partial failure / dual-write
   3 services, no coordinator. Payment commits, Inventory fails →
   the system ends up in an inconsistent state that can't be
   atomically undone.
   =========================================================== */
function ProblemScenario() {
  // Node layout (percent of stage, centered via translate(-50%,-50%) in CSS)
  const N = {
    ord: { x: 18, y: 50, name: 'Orders',    glyph: 'OD' },
    pay: { x: 50, y: 50, name: 'Payment',   glyph: 'PY' },
    inv: { x: 82, y: 50, name: 'Inventory', glyph: 'IN' },
  };
  const wireBase = [
    { x1: 18, y1: 50, x2: 50, y2: 50 },
    { x1: 50, y1: 50, x2: 82, y2: 50 },
  ];

  const tracks = [
    {
      id: 'inventory-fails',
      label: 'Inventory fails',
      steps: [
        {
          title: 'One click, many services',
          text: 'A customer hits "Place Order." There is no coordinator — the app simply calls Orders, then Payment, then Inventory, committing each step\'s local transaction as soon as it returns OK.',
          states: { ord: 'active', pay: 'idle', inv: 'idle' },
          packets: {},
        },
        {
          title: 'Order created ✓',
          text: 'The Orders service writes the new order to its own database and commits.',
          states: { ord: 'ok', pay: 'active', inv: 'idle' },
          labels: { ord: 'order saved' },
          packets: { m1: { x: 34, y: 40, label: 'createOrder', color: 'var(--blue)', arrow: 'right', visible: true } },
        },
        {
          title: 'Charge the card ✓',
          text: 'The Payment service charges $129 and commits that to its database too. So far, so good.',
          states: { ord: 'ok', pay: 'ok', inv: 'active' },
          labels: { ord: 'order saved', pay: 'charged $129' },
          packets: { m1: { x: 66, y: 40, label: 'reserve item', color: 'var(--blue)', arrow: 'right', visible: true } },
        },
        {
          title: 'Reserve the stock ✗',
          text: 'But Inventory is out of stock. It fails and refuses the reservation — the forward path dies right here.',
          tone: 'var(--fail)',
          states: { ord: 'ok', pay: 'ok', inv: 'fail' },
          labels: { ord: 'order saved', pay: 'charged $129', inv: 'OUT OF STOCK' },
          packets: { m1: { x: 82, y: 36, label: 'reserve ✗', color: 'var(--fail)', visible: true } },
        },
        {
          title: 'Now what? — an inconsistent system',
          text: 'The card is charged, but there is nothing to ship. Payment\'s DB says "paid"; Inventory\'s says "nothing reserved." No single database transaction can undo a commit that already happened inside another service.',
          why: 'This split-brain state is exactly the problem distributed transactions exist to prevent.',
          tone: 'var(--fail)',
          states: { ord: 'ok', pay: 'fail', inv: 'fail' },
          labels: { ord: 'order saved', pay: '⚠ money taken', inv: 'no stock' },
          packets: { warn: { x: 50, y: 18, label: '⚠ INCONSISTENT STATE', color: 'var(--fail)', visible: true } },
        },
      ],
    },
    {
      id: 'payment-fails',
      label: 'Payment fails',
      steps: [
        {
          title: 'Same setup, different call order',
          text: 'Same three services, same naive sequencing — but this time the app reserves stock before charging the card. Maybe it wants to lock the item in before taking money.',
          states: { ord: 'active', pay: 'idle', inv: 'idle' },
          packets: {},
        },
        {
          title: 'Order created ✓',
          text: 'Orders writes the new order to its database and commits, just like before.',
          states: { ord: 'ok', pay: 'idle', inv: 'active' },
          labels: { ord: 'order saved' },
          packets: { m1: { x: 66, y: 35, label: 'reserve item', color: 'var(--blue)', arrow: 'right', visible: true } },
        },
        {
          title: 'Stock reserved ✓',
          text: 'Inventory writes the reservation and commits — the item is now held for this order. Two services have committed locally; only the card charge is left.',
          states: { ord: 'ok', pay: 'active', inv: 'ok' },
          labels: { ord: 'order saved', inv: 'reserved' },
          packets: { m1: { x: 34, y: 35, label: 'charge $129', color: 'var(--blue)', arrow: 'left', visible: true } },
        },
        {
          title: 'Charge the card ✗',
          text: 'Payment fails — card declined. The forward path dies here instead of at Inventory.',
          tone: 'var(--fail)',
          states: { ord: 'ok', pay: 'fail', inv: 'ok' },
          labels: { ord: 'order saved', pay: 'CARD DECLINED', inv: 'reserved' },
          packets: { m1: { x: 50, y: 36, label: 'charge ✗', color: 'var(--fail)', visible: true } },
        },
        {
          title: 'A different mess, same root cause',
          text: 'Now the order is saved and stock is reserved — held for a customer who never paid. No single transaction can release the inventory once it has committed in its own service. Swap the call order, swap which side breaks: the underlying problem is the same.',
          why: 'Whichever step happens to fail last is the one that strands the system.',
          tone: 'var(--fail)',
          states: { ord: 'ok', pay: 'fail', inv: 'ok' },
          labels: { ord: 'order saved', pay: '⚠ no payment', inv: '⚠ stock held' },
          packets: { warn: { x: 50, y: 18, label: '⚠ STOCK HELD, NEVER PAID', color: 'var(--fail)', visible: true } },
        },
      ],
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
  };

  return (
    <ScenarioPlayer
      title="Place Order · 3 services, 3 databases"
      badge="THE PROBLEM" badgeColor="var(--fail)"
      legend={[
        { label: 'committed', color: 'var(--ok)',   fill: 'var(--green-t)' },
        { label: 'active',    color: 'var(--blue)', fill: 'var(--blue-t)'  },
        { label: 'failed',    color: 'var(--fail)', fill: 'var(--coral-t)' },
      ]}
      tracks={tracks}
      renderStage={renderStage}
    />
  );
}
window.ProblemScenario = ProblemScenario;
