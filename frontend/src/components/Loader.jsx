export default function Loader() {
  return (
    <div className="loader-container">
      <div className="qspinner">
        <div className="qspinner-ring" />
        <div className="qspinner-ring" />
        <div className="qspinner-ring" />
      </div>
      <div className="loader-dots">
        <div className="loader-dot" />
        <div className="loader-dot" />
        <div className="loader-dot" />
      </div>
      <span className="loader-label">Computing quantum state…</span>
    </div>
  );
}
