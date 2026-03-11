import { useState } from "react";
import API from "../api";
import Loader from "./Loader";

export default function ControlPanel({ setResult, qubits, setQubits }) {
  const [mode, setMode] = useState("smiles");
  const [smiles, setSmiles] = useState("");
  const [protein, setProtein] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sliderPct = ((qubits - 2) / 6) * 100;

  const runSimulation = async () => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (mode === "smiles") {
        res = await API.post("/simulate", { smiles, protein, qubits });
      } else {
        const fd = new FormData();
        fd.append("drug_image", file);
        fd.append("protein", protein);
        fd.append("qubits", qubits);
        res = await API.post("/simulate", fd);
      }
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Simulation failed. Check your inputs.");
    }
    setLoading(false);
  };

  return (
    <aside className="sidebar">
      {/* ── Input Mode ───────────────────────────── */}
      <div className="sidebar-section-label">Input mode</div>

      <div className="mode-tabs">
        <button
          className={`mode-tab${mode === "smiles" ? " active" : ""}`}
          onClick={() => setMode("smiles")}
        >
          🧪 SMILES
        </button>
        <button
          className={`mode-tab${mode === "image" ? " active" : ""}`}
          onClick={() => setMode("image")}
        >
          🖼 Image
        </button>
      </div>

      {/* ── Drug Input ───────────────────────────── */}
      <div className="sidebar-section-label">Drug compound</div>

      {mode === "smiles" ? (
        <div className="field">
          <label className="field-label">
            <span className="field-label-icon">⬡</span>
            SMILES String
          </label>
          <input
            className="field-input"
            placeholder="CC(=O)Oc1ccccc1C(=O)O"
            value={smiles}
            onChange={e => setSmiles(e.target.value)}
          />
        </div>
      ) : (
        <div className="field">
          <label className="field-label">
            <span className="field-label-icon">📎</span>
            Structure Image
          </label>
          <input
            className="field-input"
            type="file"
            accept="image/*"
            onChange={e => setFile(e.target.files[0])}
          />
        </div>
      )}

      {/* ── Protein ──────────────────────────────── */}
      <div className="sidebar-section-label">Target protein</div>

      <div className="field">
        <label className="field-label">
          <span className="field-label-icon">🧬</span>
          Protein Identifier
        </label>
        <input
          className="field-input"
          placeholder="EGFR, ACE2, TP53, BRCA1…"
          value={protein}
          onChange={e => setProtein(e.target.value)}
        />
      </div>

      {/* ── Qubits ───────────────────────────────── */}
      <div className="sidebar-section-label">Quantum config</div>

      <div className="qubit-row">
        <span className="qubit-row-label">⚛ Qubits</span>
        <span className="qubit-badge">{qubits}</span>
      </div>

      <input
        className="qubit-slider"
        type="range"
        min={2} max={8} step={1}
        value={qubits}
        onChange={e => setQubits(Number(e.target.value))}
        style={{
          background: `linear-gradient(to right,
            #818cf8 0%, #a78bfa ${sliderPct}%,
            rgba(255,255,255,0.08) ${sliderPct}%, rgba(255,255,255,0.08) 100%)`
        }}
      />
      <div className="qubit-ticks">
        {[2, 3, 4, 5, 6, 7, 8].map(n => (
          <span key={n} className="qubit-tick" style={{ color: n === qubits ? "var(--a-indigo)" : undefined }}>
            {n}
          </span>
        ))}
      </div>

      <div className="divider" />

      {/* ── Run ──────────────────────────────────── */}
      <button className="btn-run" onClick={runSimulation} disabled={loading}>
        {loading ? "Running…" : "⚡  Run Simulation"}
      </button>

      {loading && <Loader />}

      {error && (
        <div className="err-toast">
          <span>⚠</span><span>{error}</span>
        </div>
      )}
    </aside>
  );
}
