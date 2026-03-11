import { useEffect, useState } from "react";
import MoleculeViewer from "./MoleculeViewer";
import QuantumCircuit from "./QuantumCircuit";

/** Animated counter that counts up to a float value */
function Counter({ to, decimals = 4 }) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    const target = parseFloat(to);
    const steps = 50;
    let current = 0;
    let tick = 0;
    const step = target / steps;

    const id = setInterval(() => {
      tick++;
      current += step;
      if (tick >= steps) { setVal(target); clearInterval(id); }
      else { setVal(current); }
    }, 18);

    return () => clearInterval(id);
  }, [to]);

  return <>{val.toFixed(decimals)}</>;
}

/** Binding affinity bar (maps energy ~[-3, 0] → 0–100 %) */
function AffinityBar({ energy }) {
  const pct = Math.min(100, Math.max(0, ((parseFloat(energy) + 3) / 3) * 100));
  return (
    <div className="affinity-section">
      <div className="affinity-header">
        <span>Binding Affinity</span>
        <span>{pct.toFixed(1)} %</span>
      </div>
      <div className="affinity-track">
        <div className="affinity-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Empty-state SVG illustration */
function EmptyMolecule() {
  return (
    <svg className="empty-hexgrid" width="120" height="120" viewBox="0 0 120 120" fill="none">
      {/* Outer hex ring */}
      <polygon points="60,8 100,30 100,74 60,96 20,74 20,30"
        stroke="rgba(99,102,241,0.35)" strokeWidth="1.5" fill="none" strokeDasharray="8 4" />
      {/* Middle hex */}
      <polygon points="60,24 88,40 88,72 60,88 32,72 32,40"
        stroke="rgba(34,211,238,0.25)" strokeWidth="1.5" fill="none" strokeDasharray="6 6" />
      {/* Inner */}
      <polygon points="60,40 76,50 76,70 60,80 44,70 44,50"
        stroke="rgba(167,139,250,0.3)" strokeWidth="1.5" fill="none" />
      {/* Center atom */}
      <circle cx="60" cy="60" r="8" fill="url(#cg)" />
      {/* Orbit dots */}
      <circle cx="60" cy="24" r="3.5" fill="rgba(99,102,241,0.7)" />
      <circle cx="100" cy="52" r="3" fill="rgba(34,211,238,0.6)" />
      <circle cx="80" cy="92" r="3" fill="rgba(167,139,250,0.6)" />
      <circle cx="32" cy="84" r="2.5" fill="rgba(99,102,241,0.5)" />
      <defs>
        <radialGradient id="cg" cx="35%" cy="35%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#6366f1" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export default function ResultPanel({ result, qubits }) {
  /* ── Empty state ───────────────────────────────────── */
  if (!result) {
    return (
      <main className="content">
        {/* Circuit preview — always visible */}
        <div className="section-label">
          Quantum Circuit — {qubits} Qubits
          <span className="section-label-line" />
        </div>
        <div className="circuit-panel">
          <div className="circuit-panel-bar">
            <span className="circuit-tag">VQE Ansatz</span>
            <span className="circuit-hint">RY · CNOT · RY+π/4</span>
          </div>
          <QuantumCircuit n={qubits} />
        </div>

        <div className="empty-state" style={{ minHeight: "50vh" }}>
          <EmptyMolecule />
          <p className="empty-heading">Awaiting Simulation</p>
          <p className="empty-body">
            Configure a drug compound and target protein in the panel, then run the
            quantum VQE simulation to see binding energy, interaction strength, and
            a real-time 3D molecular structure.
          </p>
          <span className="empty-hint">
            ← Configure inputs &amp; press ⚡ Run Simulation
          </span>
        </div>
      </main>
    );
  }

  /* ── Strength meta ─────────────────────────────────── */
  const strength = result.interaction_strength;
  const badgeClass =
    strength === "Strong" ? "badge-strong" :
      strength === "Moderate" ? "badge-moderate" : "badge-weak";
  const strengthIcon =
    strength === "Strong" ? "▲▲▲" :
      strength === "Moderate" ? "▲▲◻" : "▲◻◻";

  /* ── Render ────────────────────────────────────────── */
  return (
    <main className="content">
      {/* ── Quantum Circuit ────────────────────────── */}
      <div className="section-label">
        Quantum Circuit — {qubits} Qubits
        <span className="section-label-line" />
      </div>
      <div className="circuit-panel">
        <div className="circuit-panel-bar">
          <span className="circuit-tag">VQE Ansatz</span>
          <span className="circuit-hint">RY · CNOT chain · RY+π/4</span>
        </div>
        <QuantumCircuit n={qubits} />
      </div>

      {/* ── Protein info ──────────────────────────────── */}
      <div className="section-label" style={{ marginTop: 24 }}>
        Protein target
        <span className="section-label-line" />
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label"><span className="metric-label-icon">🧬</span> Protein Name</span>
          <span className="metric-value">{result.protein_name}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label"><span className="metric-label-icon">🔗</span> UniProt ID</span>
          <span className="metric-value accent-indigo">{result.uniprot_id}</span>
        </div>
      </div>

      {/* ── Quantum results ───────────────────────── */}
      {result.binding_energy !== null && (
        <>
          <div className="section-label" style={{ marginTop: 8 }}>
            Quantum results
            <span className="section-label-line" />
          </div>

          <div className="metrics-grid">
            <div className="metric-card">
              <span className="metric-label"><span className="metric-label-icon">⚡</span> Binding Energy (eV)</span>
              <span className="metric-value accent-cyan">
                <Counter to={result.binding_energy} decimals={4} />
              </span>
            </div>

            <div className="metric-card">
              <span className="metric-label"><span className="metric-label-icon">💪</span> Interaction Strength</span>
              <div className="strength-row" style={{ marginTop: 4 }}>
                <span className={`strength-badge ${badgeClass}`}>
                  <span className="strength-dot" />
                  {strength}
                </span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.75rem", color: "var(--t-muted)", letterSpacing: "0.06em" }}>
                  {strengthIcon}
                </span>
              </div>
            </div>
          </div>

          <AffinityBar energy={result.binding_energy} />
        </>
      )}

      {/* ── 3D Viewer ─────────────────────────────── */}
      {result.structure ? (
        <>
          <div className="section-label">
            3D Molecular Structure
            <span className="section-label-line" />
          </div>

          <div className="viewer-shell">
            {/* macOS-style chrome bar */}
            <div className="viewer-bar">
              <div className="viewer-dot" />
              <div className="viewer-dot" />
              <div className="viewer-dot" />
              <span className="viewer-title">molecule_viewer.tsx</span>
              <span className="viewer-hint">drag · scroll · auto-rotates</span>
            </div>
            <div className="viewer-canvas">
              <MoleculeViewer structure={result.structure} />
            </div>
          </div>
        </>
      ) : (
        <p style={{ fontSize: "0.78rem", color: "var(--t-muted)", marginTop: 8 }}>
          3D structure is available in SMILES mode only.
        </p>
      )}
    </main>
  );
}
