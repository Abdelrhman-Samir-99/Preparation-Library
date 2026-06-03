/* ===========================================================
   scenario.jsx — shared scenario engine + visual atoms
   ScenarioPlayer drives a stepper over track-grouped step data.
   Node / Packet / FlowWires are the visual atoms placed on the
   stage by each scenario's renderStage().
   =========================================================== */
const { useState, useEffect, useRef, useCallback } = React;

/* ── Service / Coordinator node ───────────────────────────── */
function Node({ x, y, name, glyph, state = 'idle', label, coord = false, width }) {
  const style = { left: x + '%', top: y + '%' };
  if (width) style.width = width;
  const fallback = {
    idle: 'idle', active: 'working…', ok: 'done',
    prepared: 'prepared', fail: 'failed', undo: 'undone', locked: 'waiting…',
  };
  const shown = label || fallback[state] || 'idle';
  return (
    <div className={'node' + (coord ? ' coord' : '')} data-state={state} style={style}>
      <div className="nhead">
        <span className="glyph">{glyph}</span>
        <span className="nname">{name}</span>
      </div>
      <div className="nstate"><span className="dot"></span>{shown}</div>
    </div>
  );
}

/* ── Message packet — glides between positions on CSS transition ── */
function Packet({ x, y, label, color = 'var(--ink)', arrow, visible = true }) {
  return (
    <div className="packet" style={{
      left: x + '%', top: y + '%', background: color,
      opacity: visible ? 1 : 0,
      transform: `translate(-50%,-50%) scale(${visible ? 1 : 0.6})`,
    }}>
      {arrow === 'left' && <span className="ar">◀</span>}
      {label}
      {arrow === 'right' && <span className="ar">▶</span>}
    </div>
  );
}

/* ── Flow wires — static SVG topology between nodes ──────── */
function FlowWires({ wires }) {
  return (
    <svg className="flow" aria-hidden="true">
      {wires.map((w, i) => {
        const col = w.color || 'var(--line-bold)';
        return (
          <line key={i}
            x1={w.x1 + '%'} y1={w.y1 + '%'}
            x2={w.x2 + '%'} y2={w.y2 + '%'}
            stroke={col} strokeWidth={w.active ? 3 : 2}
            strokeDasharray={w.dashed ? '5 6' : 'none'}
            strokeLinecap="round"
            opacity={w.active ? 1 : 0.45} />
        );
      })}
    </svg>
  );
}

/* ── ScenarioPlayer — owns track + step + autoplay state ──── */
function ScenarioPlayer({ title, badge, badgeColor = 'var(--blue)', legend, tracks, renderStage }) {
  const [trackId, setTrackId] = useState(tracks[0].id);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const track = tracks.find(t => t.id === trackId) || tracks[0];
  const steps = track.steps;
  const step = steps[i];
  const last = steps.length - 1;
  const timer = useRef(null);

  const go = useCallback((n) => { setI(Math.max(0, Math.min(last, n))); }, [last]);

  // autoplay: advance one step every 2600ms, stop at the last step
  useEffect(() => {
    if (!playing) return;
    if (i >= last) { setPlaying(false); return; }
    timer.current = setTimeout(() => setI(v => Math.min(last, v + 1)), 2600);
    return () => clearTimeout(timer.current);
  }, [playing, i, last]);

  const switchTrack = (id) => { setTrackId(id); setI(0); setPlaying(false); };
  const next     = () => { setPlaying(false); go(i + 1); };
  const prev     = () => { setPlaying(false); go(i - 1); };
  const togglePlay = () => { if (i >= last) setI(0); setPlaying(p => !p); };

  const rootRef = useRef(null);
  const onKey = (e) => {
    if (e.key === 'ArrowRight')      { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft')  { e.preventDefault(); prev(); }
    else if (e.key === ' ')          { e.preventDefault(); togglePlay(); }
  };

  return (
    <div className="scenario" tabIndex={0} ref={rootRef} onKeyDown={onKey}>
      <div className="scenario-top">
        <div className="title">
          <span className="badge" style={{ background: badgeColor }}>{badge}</span>
          {title}
        </div>
        {tracks.length > 1 && (
          <div className="tabs">
            {tracks.map(t => (
              <button key={t.id}
                className={'scenario-tab' + (t.id === trackId ? ' on' : '')}
                onClick={() => switchTrack(t.id)}>{t.label}</button>
            ))}
          </div>
        )}
      </div>

      {/* Step caption — moved above the stage so the explanation is
          visible while the animation plays. */}
      <div className="caption">
        <span className="cstep" style={step.tone ? { background: step.tone } : null}>{i + 1}</span>
        <div className="cbody">
          <h4>{step.title}</h4>
          <p>{step.text} {step.why && <span className="why">{step.why}</span>}</p>
        </div>
      </div>

      <div className="stage">
        {renderStage(step, { trackId, index: i })}
      </div>

      {legend && (
        <div className="legend">
          {legend.map((l, k) => (
            <span className="li" key={k}>
              <span className="sw" style={{ borderColor: l.color, background: l.fill || 'transparent' }}></span>
              {l.label}
            </span>
          ))}
        </div>
      )}

      <div className="scenario-foot">
        <div className="controls">
          <button className="ctrl-btn" onClick={prev} disabled={i === 0}>← Prev</button>
          <div className="track">
            {steps.map((_, k) => (
              <span key={k}
                className={'pip' + (k < i ? ' done' : '') + (k === i ? ' now' : '')}
                onClick={() => { setPlaying(false); go(k); }}></span>
            ))}
          </div>
          <span className="cstepnum">{i + 1} / {steps.length}</span>
          <button className="ctrl-btn" onClick={next} disabled={i === last}>Next →</button>
          <button className="ctrl-btn play" onClick={togglePlay}>
            {playing ? '❚❚ Pause' : (i >= last ? '↺ Replay' : '▶ Play')}
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Node, Packet, FlowWires, ScenarioPlayer });
