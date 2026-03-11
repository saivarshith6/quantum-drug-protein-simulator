import { useState } from "react";
import "./index.css";
import "./App.css";
import Header from "./components/Header";
import ControlPanel from "./components/ControlPanel";
import ResultPanel from "./components/ResultPanel";

function App() {
  const [result, setResult] = useState(null);
  const [qubits, setQubits] = useState(4);

  return (
    <div className="app">
      {/* Aurora background blobs */}
      <div className="aurora" aria-hidden="true">
        <div className="aurora-blob" />
        <div className="aurora-blob" />
        <div className="aurora-blob" />
      </div>

      <Header />

      <div className="workspace">
        <ControlPanel setResult={setResult} qubits={qubits} setQubits={setQubits} />
        <ResultPanel result={result} qubits={qubits} />
      </div>
    </div>
  );
}

export default App;
