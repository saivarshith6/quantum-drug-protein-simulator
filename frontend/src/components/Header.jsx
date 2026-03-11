export default function Header() {
  return (
    <header className="topbar">
      {/* Logo block */}
      <div className="topbar-logo">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" fill="white" />
          <ellipse cx="12" cy="12" rx="10" ry="4.5" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" />
          <ellipse cx="12" cy="12" rx="10" ry="4.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"
            transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"
            transform="rotate(120 12 12)" />
        </svg>
      </div>

      {/* Brand */}
      <div className="topbar-brand">
        <span className="topbar-title">Quantum Drug–Protein Simulator</span>
        <span className="topbar-sub">VQE · Molecular Docking · 3D Visualization</span>
      </div>

      {/* Status pills */}
      <div className="topbar-pills">
        <span className="status-pill live">API Live</span>
        <span className="status-pill vqe">⚛ VQE</span>
      </div>
    </header>
  );
}
